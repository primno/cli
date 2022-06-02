import { Plugin } from "rollup";
import virtual from "@rollup/plugin-virtual";
import { Configuration as PrimnoConfig } from "@primno/core";
import { isNullOrUndefined } from "../../utils/common";
import { BundleResult } from "./bundler/bundle-result";
import { Bundler } from "./bundler/bundler";
import { Observable } from "rxjs";

//TODO: Add EntryPoint with Primno embeded bundler
//TODO: Add Configuration in Project Primno and Embeded bundler

function generatePrimnoCode(config: PrimnoConfig): string {
    let primnoCode = `import * as primno from "@primno/core/dist/primno-d365.esm.js";
                      export default primno;`;
    if (!isNullOrUndefined(config)) {
        primnoCode += `primno.setConfig(${JSON.stringify(config)});`;
    }

    return primnoCode;
}

export interface PrimnoBundlerOptions {
    moduleName: string;
    config: PrimnoConfig;
    destinationPath: string;
    production: boolean;
}

export class PrimnoBundler {
    private bundler: Bundler;

    public constructor(options: PrimnoBundlerOptions) {
        const { moduleName, destinationPath, config, production } = options;

        this.bundler = new Bundler({
            production,
            moduleName,
            destinationPath,
            sourcePath: "entry",
            plugins: [
                virtual({
                    entry: generatePrimnoCode(config)
                }) as Plugin
            ],
            format: "umd"
        });
    }

    public async bundle() {
        return await this.bundler.bundle();
    }

    public watch(): Observable<BundleResult> {
        throw new Error("Not implemented");
    }
}
