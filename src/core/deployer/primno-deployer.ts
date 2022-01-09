import Mustache from "mustache";
import { isNullOrUndefined } from "../../utils/common";
import { Solution } from "../d365/model/solution";
import { Deployer, DeployerConfig } from "./deployer";

export interface PrimnoDeployerConfig extends DeployerConfig {
    webResourcePathFormat: string;
}

export class PrimnoDeployer extends Deployer<PrimnoDeployerConfig> {
    public constructor(sourcePath: string, config: PrimnoDeployerConfig) {
        super(sourcePath, config);
    }

    protected override getWebResourceName(solution: Solution) {
        if (isNullOrUndefined(solution?.publisherid?.customizationprefix)) {
            throw new Error("Customization prefix not found");
        }

        const webResourceFormatOptions = {
            "editorName": solution.publisherid.customizationprefix,
            "projectName": this.config.projectName
        };
        return Mustache.render(this.config.webResourcePathFormat, webResourceFormatOptions);
    }
}