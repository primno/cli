import cors from "cors";
import express from "express";
import { Serve } from "../../config/workspace";
import https from "https";
import http from "http";
import { getCertificate } from "./self-signed-cert";
import fs from "fs";

export interface ServeInfo {
    directory: string;
    port: number;
    schema: "http" | "https";
    newSelfSignedCert: boolean;
}

interface ServeOptions extends Serve {
    environmentUrl: string;
}

export class Server {
    private server?: http.Server | https.Server | null;

    public constructor(private config: ServeOptions) { }

    public async serve(directory: string): Promise<ServeInfo> {
        if (this.server != null) {
            throw new Error("Server already started");
        }

        const app = express();
        app
            .use(cors())
            .use("/build", express.static(directory))
            .get("/", (_req, res) => {
                res.send(`<h1>Primno</h1><p>Development server is ready.</p>` +
                    `<p>Navigate to the <a href="/redirect">D365 / Power Apps environment</a>.</p>`
                );
            })
            .get("/redirect", (_req, res) => {
                res.redirect(this.config.environmentUrl);
            });

        let newSelfSignedCert = false;

        if (this.config?.https) {
            const options: https.ServerOptions = {};

            if (this.config.certificate?.selfSigned) {
                const cert = getCertificate();
                options.cert = cert.cert;
                options.key = cert.cert;
                newSelfSignedCert = cert.regenerated;
            }
            else if (this.config.certificate?.pfx) {
                options.pfx = fs.readFileSync(this.config.certificate.pfx);
                options.passphrase = this.config.certificate.pfxPassword;
            }

            this.server = https.createServer(options, app);
        }
        else {
            this.server = http.createServer(app);
        }

        try {
            await this.listen(this.config.port!);
        }
        catch (except: any) {
            if (except.code === "EADDRINUSE") {
                throw new Error(`Port ${this.config.port} is already in use`);
            }

            throw new Error(except.message);
        }

        return {
            directory,
            port: this.config.port!,
            schema: this.config.https ? "https" : "http",
            newSelfSignedCert
        };
    }

    private listen(port: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server!
                .on("error", (err: Error) => reject(err))
                .on("listening", () => resolve())
                .listen(port);
        });
    }

    public stop() {
        this.server?.close();
        this.server = null;
    }
}