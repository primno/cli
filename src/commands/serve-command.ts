import fs from 'fs';
import express from 'express';
import https from "https";
import cors from "cors";
import { Command } from 'commander';

interface Options {
    port: number;
    passphrase: string;
}

function serveAction(dir: string, pfx: string, opt: Options) {
    const app = express();

    const options = {
        pfx: fs.readFileSync(pfx),
        passphrase: opt.passphrase
    };

    console.log(`Primno serve ${dir} directory on port ${opt.port}`);

    app.use(cors());
    app.use(express.static(dir));

    const server = https
        .createServer(options, app)
        .listen(opt.port);
};

export const serveCommand = new Command('serve')
    .argument("dir", "directory of primno project")
    .argument('pfx', 'pfx certificate file')
    .description('serve the primno library directory')
    .option('-p, --port <number>', 'Port', '12357')
    .option('-pwd, --passphrase <passphrase>', 'pfx passphrase')
    .action(serveAction);