import { Deploy, Environnement } from "../../configuration/configuration";
import { D365Client } from "@primno/d365-client";
import { isNullOrUndefined } from "../../utils/common";

export class Deployer {
    public constructor(private deployConfig: Deploy, private environnementConfig?: Environnement[]) { }

    public async deploy() {
        try {
            // Deploy one or more webresources
            // Build before
            // Compute webresource uri from uri format (in config ?)
            
            // const environnement = this.environnementConfig?.find(e => e.name == this.deployConfig.environnement);
            // if (isNullOrUndefined(environnement)) {
            //     throw new Error("Environnement not found");
            // }

            // const client = new D365Client(environnement?.connectionString);
            // const firstAccount = await client.retrieveMultipleRecords("accounts", "$top=1");
            // console.log("First Account :");
            // console.log(firstAccount);
        }
        catch (except) {
            console.error("Error");
            console.error(except);
        }
    }
}