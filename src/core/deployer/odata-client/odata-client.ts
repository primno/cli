import { Authentication, WebClient } from "./web-client/web-client";

export interface Options {
    authentication: Authentication;
    annotations: boolean;
}

export class ODataClient {
    private webClient: WebClient;
    public constructor(serviceUri: string, options: Options) {
        this.webClient = new WebClient(
            serviceUri,
            {
                authentication: options?.authentication,
                headers: {
                    "OData-Version": "4.0",
                    "Content-Type": "application/json",
                    "Prefer": `odata.include-annotations="${options.annotations ? "*" : "-*"}"`
                }
            }
        );
    }

    public async retrieveRecord(entityLogicalName: string, id: string, options: string) {
        return (await this.webClient.get(`${entityLogicalName}(${encodeURIComponent(id)})?${options}`)).data;
    }

    public async retrieveMultipleRecords(entityLogicalName: string, options?: string) {
        return (await this.webClient.get(`${entityLogicalName}?${options}`)).data;
    }

    public async createRecord(entityLogicalName: string, data?: any) {
        return (await this.webClient.post(entityLogicalName, data)).data;
    }

    public async updateRecord(entityLogicalName: string, id: string, data?: any) {
        return (await this.webClient.patch(`${entityLogicalName}(${encodeURIComponent(id)})`, data)).data;
    }

    public async deleteRecord(entityLogicalName: string, id: string) {
        return (await this.webClient.delete(`${entityLogicalName}(${encodeURIComponent(id)})`)).data;
    }
}