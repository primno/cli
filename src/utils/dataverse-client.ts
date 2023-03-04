import { ConnectionStringClient, DataverseClient } from "@primno/dataverse-client";

const clients: { [key: string]: DataverseClient } = {};

export function getClient(connectionString: string,deviceCodeCallback: (url: string, code: string) => void):  DataverseClient {
    if (clients[connectionString] == null) {
        const csClient = new ConnectionStringClient(
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