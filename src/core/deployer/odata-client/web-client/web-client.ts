const ca = require("win-ca/api");
import https from "https";
import http from "http";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { NtlmClient, NtlmCredentials } from "./custom-axios-ntlm/ntlm-client";
//import { NtlmClient, NtlmCredentials } from "axios-ntlm";

export interface Authentication {
    type: "oauth2" | "ntlm";
    username: string;
    password: string;
    domain: string;
}

export interface Options {
    authentication: Authentication;
    headers: Record<string, string>;
}

export class WebClient {
    private axiosConfig: AxiosRequestConfig;

    public constructor(private baseUrl: string, private options: Options) {
        this.axiosConfig = {
            baseURL: this.baseUrl,
            httpsAgent: new https.Agent({
                keepAlive: true,
                ca: this.getRootCertificates()
            }),
            httpAgent: new http.Agent({
                keepAlive: true
            }),
            headers: options.headers
        };
    }

    private getRootCertificates(): string[] {
        let list: string[] = [];

        ca({
            format: ca.der2.pem,
            store: ['root', 'ca',],
            ondata: list
        });

        return list;
    }

    private createClient(): AxiosInstance {
        let client: AxiosInstance;

        switch (this.options.authentication.type) {
            case "ntlm":
                {
                    const credentials: NtlmCredentials = {
                        username: this.options.authentication.username,
                        password: this.options.authentication.password,
                        domain: this.options.authentication.domain,
                    };

                    client = NtlmClient(credentials, this.axiosConfig);
                    break;
                }
            case "oauth2":
                throw new Error("Not implemented");
            default: client = axios.create(this.axiosConfig);
        }

        return client;
    }

    public async get(url: string) {
        const client = this.createClient();
        return client.get(url);
    }

    public async put(url: string, data?: any) {
        const client = this.createClient();
        return client.put(url, data);
    }

    public async patch(url: string, data?: any) {
        const client = this.createClient();
        return client.patch(url, data);
    }

    public async post(url: string, data?: any) {
        const client = this.createClient();
        return client.post(url, data);
    }

    public async delete(url: string) {
        const client = this.createClient();
        return client.delete(url);
    }
}