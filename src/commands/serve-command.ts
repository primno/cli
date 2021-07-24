import fs from 'fs';
import express from 'express';
import https from "https";
import cors from "cors";

interface Options {
    port: number;
    pfx: string;
    passphrase: string;
}

export function serveCommand(dir: string, opt: Options) {
    const app = express();

    const options = {
        pfx: fs.readFileSync(opt.pfx),
        passphrase: opt.passphrase
    };

    console.log(`Primno serve ${dir} directory and port ${opt.port}`);

    app.use(cors());
    app.use(express.static(dir));
    
    const server = https.createServer(options, app).listen(opt.port);
};