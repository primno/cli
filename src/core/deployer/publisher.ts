import { D365Client } from "@primno/d365-client";
import { Environment } from "../../configuration/workspace-configuration";
import { escapeXml } from "../../utils/common";

export interface PublishOptions {
    webResourcesId: string[];
}

interface PublishXmlRequest {
    ParameterXml: string;
}

export class Publisher {
    public constructor(private options: PublishOptions) {}

    public async publish(environment: Environment): Promise<any> {
        const d365Client = new D365Client(environment.connectionString);

        const webResourcesNodes = this.options.webResourcesId.map(w => `<webresource>${escapeXml(w)}</webresource>`).join("");

        const publishXmlRequest: PublishXmlRequest = {
            ParameterXml: `<importexportxml><webresources>${webResourcesNodes}</webresources></importexportxml>`
        };

        return await d365Client.executeAction("PublishXml", publishXmlRequest);
    }
}