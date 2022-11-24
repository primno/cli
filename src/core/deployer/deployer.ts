import { D365Client } from "@primno/d365-client";
import { SolutionRepository } from "../d365/repository/solution-repository";
import { readFile } from "fs/promises";
import { SolutionComponentType } from "../d365/model/add-solution-component";
import { WebResourceType } from "../d365/model/webresource";
import { WebResourceRepository } from "../d365/repository/webresource-repository";
import { isNullOrUndefined } from "../../utils/common";
import { Solution } from "../d365/model/solution";
import { getCacheDir } from "../../utils/cache";

export interface DeployerConfig {
    // TODO: Change location ?
    projectName: string;
    connectionString: string;
    solutionUniqueName: string;
}

export abstract class Deployer<TCfg extends DeployerConfig> {
    public constructor(protected sourcePath: string, protected config: TCfg) { }

    public async deploy(): Promise<string> {
        try {
            const d365Client = new D365Client(
                this.config.connectionString,
                {
                    persistence: {
                        enabled: true,
                        cacheDirectory: getCacheDir(),
                        serviceName: "primno-client",
                        accountName: this.config.connectionString
                    }
                }
            );

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

            return webResourceId;
        }
        catch (except: any) {
            throw new Error(`Unable to deploy ${this.sourcePath}: ${except.message}`);
        }
    }

    protected abstract getWebResourceName(solution: Solution): string;
}