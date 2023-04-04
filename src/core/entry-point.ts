import { Builder, BuilderOptions } from "./builder/builder";
import path from "path";
import glob from "glob";
import { WorkspaceConfig, Environment } from "../config/workspace";
import { EntryPointDeployer } from "./deployer/entry-point-deployer";
import { Configuration as PrimnoConfig } from "@primno/core";
import { CodeGeneratorMode as EntryPointBuildMode } from "./builder/code-generator";
import { Result } from "../task";
import Mustache from "mustache";
import { convertToSnakeCase } from "../utils/naming";

export { EntryPointBuildMode };

export interface EntryPointBuildOptions {
    production: boolean;
    mode: EntryPointBuildMode;
}

export interface EntryPointDeployOptions {
    environment: Environment;

    /**
     * Callback for device code authentication.
     */
    deviceCodeCallback: (url: string, code: string) => void;
}

interface GeneratePrimnoConfigOptions {
    localImport: boolean;
    entryPointName: string;
    port?: number;
}

export class EntryPoint {
    private _name: string;
    private _srcPath: string;

    public constructor(sourcePath: string, private config: WorkspaceConfig) {
        this._srcPath = sourcePath;
        this._name = path.basename(sourcePath, ".ts");
    }

    public get name(){
        return this._name;
    }

    /** Typescript entry point. */
    public get sourcePath() {
        return this._srcPath;
    }

    /** Distribution path of the entry point (js file). */
    public get distributionPath() {
        return path.join(this.config.distDir, `${this.name}.js`);
    }

    private static generatePrimnoConfig(options: GeneratePrimnoConfigOptions): PrimnoConfig {
        const { port = 12357, entryPointName, localImport: localMode } = options;
        if (localMode) {
            return {
                moduleResolverConfig: {
                    uri: `https://localhost:${port}/${entryPointName}.js`,
                    type: "import"
                }
            };
        }
        else {
            return {
                moduleResolverConfig: {
                    type: "embedded"
                }
            };
        }
    }

    public async build(options: EntryPointBuildOptions): Promise<Result> {
        const bundlerOptions = EntryPoint.createBundlerOptions([this], options);
        const bundler = new Builder(bundlerOptions);
        return await bundler.bundle();
    }

    /**
     * Generate module name from the template.
     * @param format Format of the module name.
     * @param entryPointName Name of the entry point.
     * @param config Workspace configuration.
     * @returns Module name.
     */
    private static generateModuleName(format: string, entryPointName: string, config: WorkspaceConfig): string {
        const moduleFormatOptions = {
            "projectName": convertToSnakeCase(config.name),
            "entryPoint": convertToSnakeCase(entryPointName)
        };
        return Mustache.render(format, moduleFormatOptions);
    }

    private static createBundlerOptions(
        entryPoints: EntryPoint[],
        options: EntryPointBuildOptions): BuilderOptions[] {
        return entryPoints.map(
            ep => ({
                moduleName: EntryPoint.generateModuleName(ep.config.build?.moduleNameTemplate!, ep.name, ep.config),
                sourcePath: ep.sourcePath,
                destinationPath: ep.distributionPath,
                production: options.production,
                mode: options.mode,
                primnoConfig: EntryPoint.generatePrimnoConfig({
                    localImport: options.mode === EntryPointBuildMode.primnoImportLocal,
                    port: ep.config.serve?.port,
                    entryPointName: ep.name
                })
            })
        );
    }

    /**
     * Deploy the entry point to the environment.
     * @param options Deployment options.
     * @returns Id of the web resource or undefined if the web resource don't need to be updated.
     */
    public async deploy(options: EntryPointDeployOptions): Promise<string | undefined> {
        const { environment, deviceCodeCallback } = options;

        const deployCfg = this.config.deploy;
            if (deployCfg == null) {
                throw new Error("No deployment configuration");
            }

            const deployer = new EntryPointDeployer(this.distributionPath, this.name, {
                environment,
                solutionUniqueName: deployCfg.solutionUniqueName,
                webResourcePathFormat: deployCfg.webResourceNameTemplate,
                projectName: this.config.name,
                deviceCodeCallback
            });
            
            return await deployer.deploy();
    }

    public static watch(entryPoints: EntryPoint[], options?: EntryPointBuildOptions) {       
        options = options || {
            mode: EntryPointBuildMode.primnoEmbedded,
            production: false,
        };

        const bundlerOpt = EntryPoint.createBundlerOptions(
            entryPoints,
            options
        );
        
        const bundler = new Builder(bundlerOpt);
        return bundler.watch();
    }

    public static getEntryPoints(config: WorkspaceConfig) {
        const sourceDir = path.join(config.sourceRoot, config.entryPointDir);
        return glob
            .sync("*.ts", { cwd: sourceDir })
            .map(f => new EntryPoint(path.join(sourceDir, f), config));
    }
}