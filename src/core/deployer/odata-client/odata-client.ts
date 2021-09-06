import { Authentication, WebClient } from "./web-client/web-client";

export class ODataClient {
    private webClient: WebClient;
    public constructor(serviceUri: string, authentication: Authentication) {
        this.webClient = new WebClient(serviceUri, authentication);
    }

    public async get(ressource: string) {
        return await this.webClient.get(ressource);
    }
}