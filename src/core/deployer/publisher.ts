import { DataverseClient } from "@primno/dataverse-client";
import { Environment } from "../../configuration/workspace-configuration";
import { getCacheDir } from "../../utils/cache";
import { escapeXml } from "../../utils/common";

export interface PublishOptions {
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

    public async publish(environment: Environment): Promise<any> {
        const client = new DataverseClient(
            environment.connectionString,
            {
                oAuth: {
                    persistence: {
                        enabled: true,
                        cacheDirectory: getCacheDir(),
                        serviceName: "primno-cli",
                        // TODO: Fix this
                        accountName: environment.connectionString
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