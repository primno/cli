import cors from "cors";
import express from "express";
import fs from "fs";
import { Serve } from "../configuration/configuration";
import https from "https";
import { isNullOrUndefined } from "../utils/common";

export class Server {
    private server: any;

    public constructor(private config: Serve) {}

    public serve(directory: string) {
        if (!isNullOrUndefined(this.server)) {
            throw new Error("Server already started");
        }

        console.info(`Serve ${directory} on port ${this.config.port} (${this.config.https ? "HTTPS" : "HTTP"})`);

        const app = express();
        app.use(cors());
        app.use(express.static(directory));

        if (this.config?.https) {
            const options = {
                pfx: fs.readFileSync(this.config?.pfx as string),
                passphrase: this.config?.pfxPassword
            };

            this.server = https
                .createServer(options, app)
                .listen(this.config?.port);
        }
        else {
            this.server = app.listen(this.config?.port);
        }
    }

    public stop() {
        this.server?.close();
        this.server = null;
    }
}