import { D365Client } from "@primno/d365-client";
import { SolutionRepository } from "../d365/repository/solution-repository";
import { readFile } from "fs/promises";
import { SolutionComponentType } from "../d365/model/add-solution-component";
import { WebResourceType } from "../d365/model/webresource";
import { WebResourceRepository } from "../d365/repository/webresource-repository";
import { isNullOrUndefined } from "../../utils/common";
import Mustache from "mustache";
import { Solution } from "../d365/model/solution";

export interface DeployerConfig {
    connectionString: string;
    solutionUniqueName: string;
    webResourcePathFormat: string;
}

export class Deployer {
    public constructor(private sourcePath: string, private entryPoint: string, private config: DeployerConfig) { }

    public async deploy() {
        try {
            const d365Client = new D365Client(this.config.connectionString);

            const solutionRepository = new SolutionRepository(d365Client);
            const webResourceRepository = new WebResourceRepository(d365Client);

            // Exist ?
            const solution = await solutionRepository.getByName(this.config.solutionUniqueName);

            if (isNullOrUndefined(solution)) {
                throw new Error("Solution not found");
            }

            const webResourceName = this.getWebResourceName(solution);

            const fileContent = await readFile(this.sourcePath, { encoding: "base64" });

            const webResourceId = await webResourceRepository.createOrUpdate({
                content: fileContent,
                name: webResourceName,
                webresourcetype: WebResourceType.JS,
                solutionid: solution.solutionid
            });

            await solutionRepository.addSolutionComponent({
                ComponentId: webResourceId,
                ComponentType: SolutionComponentType.WebResource,
                DoNotIncludeSubcomponents: false,
                AddRequiredComponents: false,
                SolutionUniqueName: this.config.solutionUniqueName
            });
        }
        catch (except: any) {
            console.error(`Deploying error: ${except}`);
        }
    }

    private getWebResourceName(solution: Solution) {
        const webResourceFormatOptions = {
            "editorName": solution.publisherid.customizationprefix,
            "entryPoint": this.entryPoint
        };
        return Mustache.render(this.config.webResourcePathFormat, webResourceFormatOptions);
    }
}