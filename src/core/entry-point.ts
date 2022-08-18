import { Builder, BuilderOptions } from "./builder/builder";
import path from "path";
import glob from "glob";
import { WorkspaceConfig, Environnement } from "../configuration/workspace-configuration";
import { EntryPointDeployer } from "./deployer/entry-point-deployer";
import { isNullOrUndefined } from "../utils/common";
import { BundleResult } from "./builder/bundler/bundle-result";
import { Configuration as PrimnoConfig } from "@primno/core";
import { convertToSnakeCase } from "../utils/naming";
import { CodeGeneratorMode as EntryPointBuildMode } from "./builder/code-generator";

export { EntryPointBuildMode };

export interface EntryPointBuildOptions {
    production: boolean;
    mode: EntryPointBuildMode;
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

    public async build(options: EntryPointBuildOptions): Promise<BundleResult> {
        const bundlerOptions = EntryPoint.createBundlerOptions([this], options);
        const bundler = new Builder(bundlerOptions);
        return await bundler.bundle();
    }

    private static createBundlerOptions(
        entryPoints: EntryPoint[],
        options: EntryPointBuildOptions): BuilderOptions[] {
        return entryPoints.map(
            ep => ({
                // TODO: Change module name here. Prefix with mn_ and convert to snake case.
                moduleName: `mn_${convertToSnakeCase(ep.name)}`,
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

    public async deploy(environnement: Environnement): Promise<string> {
        const deployCfg = this.config.deploy;
            if (isNullOrUndefined(deployCfg)) {
                throw new Error("No deploiement configuration");
            }

            const deployer = new EntryPointDeployer(this.distributionPath, this.name, {
                connectionString: environnement.connectionString,
                solutionUniqueName: deployCfg.solutionUniqueName,
                webResourcePathFormat: deployCfg.webResourceNameTemplate.entryPoint,
                projectName: this.config.name
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