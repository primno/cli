import { EntryPointBundler } from "./bundler/entry-point-bundler";
import path from "path";
import glob from "glob";
import { WorkspaceConfig, Environnement } from "../configuration/workspace-configuration";
import { EntryPointDeployer } from "./deployer/entry-point-deployer";
import { isNullOrUndefined } from "../utils/common";
import { BundlerOptions } from "./bundler/bundler";
import { BundleResult } from "./bundler/bundle-result";

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

    public async build(destinationDir: string): Promise<BundleResult> {
        const dstPath = path.join(destinationDir, `${this.name}.js`);
        const bundler = new EntryPointBundler({
            sourcePath: this.sourcePath,
            destinationPath: dstPath
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
        return glob
            .sync(path.join(config.sourceRoot, config.entryPointDir, "*.ts"))
            .map(f => new EntryPoint(f, config));
    }
}