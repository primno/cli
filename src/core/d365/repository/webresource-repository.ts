import { D365Client } from "@primno/d365-client";
import { isNullOrUndefined } from "../../../utils/common";
import { WebResource } from "../model/webresource";

export class WebResourceRepository {
    public constructor(private d365Client: D365Client) {

    }

    public async createOrUpdate(webResource: WebResource): Promise<string> {
        try {
            const existingWR = await this.findByName(webResource.name);

            if (isNullOrUndefined(existingWR)) {
                const result = await this.create(webResource);
                return result.id;
            }
            else {
                webResource.webresourceid = existingWR.webresourceid;
                await this.update(webResource);
                return webResource.webresourceid as string;
            }
        }
        catch(except: any) {
            throw new Error(`Webresource updating error: ${except}`);
        }
    }

    public async create(webResource: WebResource) {
        return await this.d365Client.createRecord("webresourceset", webResource);
    }

    public async update(webResource: WebResource) {
        return await this.d365Client.updateRecord("webresourceset", webResource.webresourceid as string, webResource);
    }

    public async findByName(webResourceName: string): Promise<WebResource> {
        const options = [
            "$select=webresourceid,name,webresourcetype,content",
            `$filter=name eq '${webResourceName}'`,
        ].join("&");

        const webResources = await this.d365Client.retrieveMultipleRecords<WebResource>("webresourceset", options);
        return webResources[0];
    }
}