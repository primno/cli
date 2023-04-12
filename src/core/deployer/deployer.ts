import { SolutionRepository } from "../d365/repository/solution-repository";
import { readFile } from "fs/promises";
import { SolutionComponentType } from "../d365/model/add-solution-component";
import { WebResourceType } from "../d365/model/web-resource";
import { WebResourceRepository } from "../d365/repository/web-resource-repository";
import { Solution } from "../d365/model/solution";
import { defaultConnectionString, defaultSolutionUniqueName } from "../../config/workspace";
import { DataverseOptions } from "./dataverse-options";
import { getClient } from "../../utils/dataverse-client";

export interface DeployerOptions extends DataverseOptions {
    projectName: string;
    solutionUniqueName: string;

    /**
     * Callback for device code authentication.
     */
    deviceCodeCallback: (url: string, code: string) => void;
}

export abstract class Deployer<TOptions extends DeployerOptions> {
    public constructor(protected sourcePath: string, protected config: TOptions) {
        if (config.environment?.connectionString == null ||
            config.environment?.connectionString === defaultConnectionString) {
            throw new Error("Invalid connection string");
        }

        if (config.solutionUniqueName == null || config.solutionUniqueName === defaultSolutionUniqueName) {
            throw new Error("Invalid solution name");
        }
    }

    /**
     * Deploy the JS web resource.
     * @returns Web resource id or undefined if the web resource does not need to be updated.
     */
    public async deploy(): Promise<string | undefined> {
        try {
            const client = getClient(this.config.environment.connectionString, this.config.deviceCodeCallback);

            const solutionRepository = new SolutionRepository(client);
            const webResourceRepository = new WebResourceRepository(client);

            // Exists ?
            const solution = await solutionRepository.getByName(this.config.solutionUniqueName);

            if (solution == null) {
                throw new Error("Solution not found");
            }

            const webResourceName = this.getWebResourceName(solution);

            const fileContent = await readFile(this.sourcePath, { encoding: "base64" });

            const webResourceId = await webResourceRepository.createOrUpdate({
                content: fileContent,
                name: webResourceName,
                displayname: `${this.config.projectName} - ${webResourceName}`,
                description: `Web resource generated by Primno CLI`,
                webresourcetype: WebResourceType.JS,
                solutionid: solution.solutionid
            });

            if (webResourceId != null) {
                await solutionRepository.addSolutionComponent({
                    ComponentId: webResourceId,
                    ComponentType: SolutionComponentType.WebResource,
                    DoNotIncludeSubcomponents: false,
                    AddRequiredComponents: false,
                    SolutionUniqueName: this.config.solutionUniqueName
                });
            }

            return webResourceId;
        }
        catch (except: any) {
            throw new Error(`Unable to deploy ${this.sourcePath}: ${except.message}`);
        }
    }

    protected abstract getWebResourceName(solution: Solution): string;
}