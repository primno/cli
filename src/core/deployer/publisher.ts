import { D365Client } from "@primno/d365-client";
import { Environnement } from "../../configuration/workspace-configuration";

export interface PublishOptions {
    webResourcesId: string[];
}

interface PublishXmlRequest {
    ParameterXml: string;
}

export class Publisher {
    public constructor(private options: PublishOptions) {}

    public async publish(environnement: Environnement): Promise<any> {
        const d365Client = new D365Client(environnement.connectionString);

        const webResoucesNodes = this.options.webResourcesId.map(w => `<webresource>${w}</webresource>`).join("");

        const publishXmlRequest: PublishXmlRequest = {
            ParameterXml: `<importexportxml><webresources>${webResoucesNodes}</webresources></importexportxml>`
        };

        return await d365Client.executeAction("PublishXml", publishXmlRequest);
    }
}