import { Configuration as PrimnoConfiguration } from "@primno/core";
import Mustache from "mustache";
import path from "path";
import { Environnement, WorkspaceConfig, defaultConfig } from "../configuration/workspace-configuration";
import { isNullOrUndefined } from "../utils/common";
import { convertToSnakeCase } from "../utils/naming";
import { PrimnoBundler } from "./bundler/primno-bundler";
import { PrimnoDeployer } from "./deployer/primno-deployer";

// TODO: implements/extends EntryPoint or something like that
export class PrimnoEntryPoint {
    public constructor(private config: WorkspaceConfig) {

    }

    private get distributionPath() {
        return path.join(this.config.distDir, "primno-d365.js");
    }

    private generatePrimnoConfig(serveMode: boolean): PrimnoConfiguration {
        const webResourcePathFormat = this.config.deploy?.webResourceNameTemplate.entryPoint ??
                                      defaultConfig.deploy?.webResourceNameTemplate?.entryPoint as string;

        let uriTemplate: string;

        if (serveMode) {
            uriTemplate = `https://localhost:${this.config.serve?.port ?? 12357}/{entityName}.js`;
        }
        else {
            const data = {
                "editorName": "{editorName}", // TODO: Can't be generated here. Can be generated by primno ?
                "projectName": this.config.name,
                "entryPoint": "{entityName}" // TODO: Sure ?
            };

            uriTemplate = `{webResourceBaseUrl}${Mustache.render(webResourcePathFormat, data)}`;
        }
        

        return {
            moduleResolverConfig: {
                uriTemplate,
                type: "import"
            }
        };
    }

    public async build(serveMode: boolean = false) {
        const primnoConfig = this.generatePrimnoConfig(serveMode);
        const moduleName = `mn_${convertToSnakeCase(this.config.name)}`;

        // TODO: Log this
        // console.log(`Primno module name will be ${moduleName}`);
        const bundler = new PrimnoBundler(moduleName, primnoConfig, this.distributionPath);
        return await bundler.bundle();
    }

    public async deploy(environnement: Environnement): Promise<string> {
        // TODO: Logger here
        // console.log("Deploying Primno ...");

        const deployConfig = this.config.deploy;
        if (isNullOrUndefined(deployConfig)) {
            throw new Error("No deploiement config");
        }

        const primnoDeployer = new PrimnoDeployer(this.distributionPath, {
            connectionString: environnement.connectionString,
            solutionUniqueName: deployConfig.solutionUniqueName,
            webResourcePathFormat: deployConfig.webResourceNameTemplate.primno,
            projectName: this.config.name
        });

        return await primnoDeployer.deploy();
    }

    public watch() {
        //TODO: Watch Workspace configuration ?
        throw new Error("Not implemented");
    }
}