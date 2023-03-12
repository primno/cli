import { escapeXml } from "../../utils/common";
import { getClient } from "../../utils/dataverse-client";
import { DataverseOptions } from "./dataverse-options";

export interface PublishOptions extends DataverseOptions {
    webResourcesId: string[];

    /**
     * Callback for device code authentication.
     */
    deviceCodeCallback: (url: string, code: string) => void;
}

interface PublishXmlRequest {
    ParameterXml: string;
}

export class Publisher {
    public constructor(private options: PublishOptions) {}

    public async publish(): Promise<any> {
        const client = getClient(this.options.environment.connectionString, this.options.deviceCodeCallback);

        const webResourcesNodes = this.options.webResourcesId.map(w => `<webresource>${escapeXml(w)}</webresource>`).join("");

        const publishXmlRequest: PublishXmlRequest = {
            ParameterXml: `<importexportxml><webresources>${webResourcesNodes}</webresources></importexportxml>`
        };

        return await client.executeAction("PublishXml", publishXmlRequest);
    }
}