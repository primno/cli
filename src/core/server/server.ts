import cors from "cors";
import express from "express";
import { Serve } from "../../configuration/workspace-configuration";
import https, { ServerOptions } from "https";
import { isNullOrUndefined } from "../../utils/common";
import { getCertificate } from "./self-signed-cert";
import fs from "fs";

export class Server {
    private server: any;

    public constructor(private config: Serve) { }

    public serve(directory: string) {
        if (!isNullOrUndefined(this.server)) {
            throw new Error("Server already started");
        }

        console.info(`Serve ${directory} on port ${this.config.port} (${this.config.https ? "HTTPS" : "HTTP"})`);

        const app = express();
        app.use(cors());
        app.use(express.static(directory));

        if (this.config?.https) {
            const options: ServerOptions = {};

            if (this.config.certificate?.selfSigned) {
                const selfSignedCert = getCertificate();
                options.cert = selfSignedCert;
                options.key = selfSignedCert;
            }
            else if (this.config.certificate?.pfx) {
                options.pfx = fs.readFileSync(this.config.certificate.pfx);
                options.passphrase = this.config.certificate.pfxPassword;
            }

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