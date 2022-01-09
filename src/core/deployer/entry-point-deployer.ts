import Mustache from "mustache";
import { isNullOrUndefined } from "../../utils/common";
import { Solution } from "../d365/model/solution";
import { Deployer, DeployerConfig } from "./deployer";

export interface EntryPointDeployerConfig extends DeployerConfig {
    webResourcePathFormat: string;
}

export class EntryPointDeployer extends Deployer<EntryPointDeployerConfig> {
    public constructor(sourcePath: string, private entryPoint: string, config: EntryPointDeployerConfig) {
        super(sourcePath, config);
    }

    protected override getWebResourceName(solution: Solution) {
        if (isNullOrUndefined(solution?.publisherid?.customizationprefix)) {
            throw new Error("Customization prefix not found");
        }

        const webResourceFormatOptions = {
            "editorName": solution.publisherid.customizationprefix,
            "projectName": this.config.projectName,
            "entryPoint": this.entryPoint
        };
        return Mustache.render(this.config.webResourcePathFormat, webResourceFormatOptions);
    }
}