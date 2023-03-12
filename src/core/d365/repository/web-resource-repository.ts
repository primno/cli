import { DataverseClient } from "@primno/dataverse-client";
import { isNullOrUndefined } from "../../../utils/common";
import { WebResource } from "../model/web-resource";

export class WebResourceRepository {
    public constructor(private client: DataverseClient) {}

    public async createOrUpdate(webResource: WebResource): Promise<string> {
        try {
            const existingWR = await this.findByName(webResource.name);

            if (isNullOrUndefined(existingWR)) {
                const result = await this.create(webResource);
                return result.webresourceid as string;
            }
            else {
                webResource.webresourceid = existingWR.webresourceid;
                await this.update(webResource);
                return webResource.webresourceid as string;
            }
        }
        catch(except: any) {
            throw new Error(`Web resource updating error: ${except}`);
        }
    }

    public async create(webResource: WebResource) {
        return await this.client.createRecord("webresourceset", webResource);
    }

    public async update(webResource: WebResource) {
        return await this.client.updateRecord("webresourceset", webResource.webresourceid as string, webResource);
    }

    public async findByName(webResourceName: string): Promise<WebResource | undefined> {
        const webResources = await this.client.retrieveMultipleRecords<WebResource>(
            "webresourceset",
            {
                select: ["webresourceid", "name", "webresourcetype", "content", "description", "displayname"],
                filters: [{ conditions: [{ attribute: "name", operator: "eq", value: webResourceName }] }]
            }
        );

        return webResources.entities[0];
    }
}