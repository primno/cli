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
}

export class WebClient {
    private axiosConfig: AxiosRequestConfig;

    public constructor(private baseUrl: string, private authentication: Authentication) {
        this.axiosConfig = {
            baseURL: this.baseUrl,
            httpsAgent: new https.Agent({
                keepAlive: true,
                ca: this.getRootCertificates()
            }),
            httpAgent: new http.Agent({
                keepAlive: true
            })
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

        switch (this.authentication.type) {
            case "ntlm":
                {
                    const credentials: NtlmCredentials = {
                        username: this.authentication.username,
                        password: this.authentication.password,
                        domain: this.authentication.domain,
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
        client.put(url, data);
    }
}