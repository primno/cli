import { DataverseClient } from "@primno/dataverse-client";
import { getCacheDir } from "../../utils/cache";
import { escapeXml } from "../../utils/common";
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
        const client = new DataverseClient(
            this.options.environment.connectionString,
            {
                oAuth: {
                    persistence: {
                        enabled: true,
                        cacheDirectory: getCacheDir(),
                        serviceName: "primno-cli",
                        accountName: this.options.environment.name
                    },
                    deviceCodeCallback: (response) => this.options.deviceCodeCallback(response.verificationUri, response.userCode)
                }
            });

        const webResourcesNodes = this.options.webResourcesId.map(w => `<webresource>${escapeXml(w)}</webresource>`).join("");

        const publishXmlRequest: PublishXmlRequest = {
            ParameterXml: `<importexportxml><webresources>${webResourcesNodes}</webresources></importexportxml>`
        };

        return await client.executeAction("PublishXml", publishXmlRequest);
    }
}