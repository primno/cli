import { Plugin } from "rollup";
import virtual from "@rollup/plugin-virtual";
import { Configuration as PrimnoConfig } from "@primno/core";
import { isNullOrUndefined } from "../../utils/common";
import { BundleResult } from "./bundle-result";
import { Bundler } from "./bundler";
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

export class PrimnoBundler extends Bundler {
    public constructor(moduleName: string, config: PrimnoConfig, destPath: string) {
        super({
            moduleName,
            destinationPath: destPath,
            sourcePath: "entry",
            plugins: [
                virtual({
                    entry: generatePrimnoCode(config)
                }) as Plugin
            ],
            format: "umd"
        });
    }

    public watch(): Observable<BundleResult> {
        throw new Error("Not implemented");
    }
}
