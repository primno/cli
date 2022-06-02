import { EntryPointBundler } from "./builder/entry-point-builder";
import path from "path";
import glob from "glob";
import { WorkspaceConfig, Environnement } from "../configuration/workspace-configuration";
import { EntryPointDeployer } from "./deployer/entry-point-deployer";
import { isNullOrUndefined } from "../utils/common";
import { BundlerOptions } from "./builder/bundler/bundler";
import { BundleResult } from "./builder/bundler/bundle-result";

export interface EntryPointBuildOptions {
    destinationDir: string;
    production: boolean;
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

    public async build(options: EntryPointBuildOptions): Promise<BundleResult> {
        const destinationPath = path.join(options.destinationDir, `${this.name}.js`);
        const bundler = new EntryPointBundler({
            sourcePath: this.sourcePath,
            destinationPath,
            production: options.production
        });
        return await bundler.bundle();
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

    public static watch(entryPoints: EntryPoint[]) {
        const bundlerOptions: BundlerOptions[] = entryPoints.map(e => <BundlerOptions>{
            sourcePath: e.sourcePath,
            destinationPath: e.distributionPath
        });

        const bundler = new EntryPointBundler(bundlerOptions);
        return bundler.watch();
    }

    public static getEntryPoints(config: WorkspaceConfig) {
        const sourceDir = path.join(config.sourceRoot, config.entryPointDir);
        return glob
            .sync("*.ts", { cwd: sourceDir })
            .map(f => new EntryPoint(path.join(sourceDir, f), config));
    }
}