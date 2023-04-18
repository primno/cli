import { ConnStringTokenProvider } from "@primno/dataverse-auth";
import { DataverseClient } from "@primno/dataverse-client";

const clients: { [key: string]: DataverseClient } = {};

export function getClient(connectionString: string,deviceCodeCallback: (url: string, code: string) => void):  DataverseClient {
    if (clients[connectionString] == null) {
        const csClient = new ConnStringTokenProvider(
            connectionString,
            {
                oAuth: {
                    persistence: {
                        serviceName: "primno-cli",
                        accountName: "primno-cli"
                    },
                    deviceCodeCallback: (response) => deviceCodeCallback(response.verificationUri, response.userCode)
                }
            }
        );
    
        clients[connectionString] = new DataverseClient(csClient);
    }

    return clients[connectionString];
}