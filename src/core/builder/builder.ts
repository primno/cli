import virtual from "@rollup/plugin-virtual";
import { map, Observable } from "rxjs";
import { BundleResult } from "./bundler/bundle-result";
import { Bundler } from "./bundler/bundler";
import { Configuration as PrimnoConfig } from "@primno/core";
import { BundlerResultBuilder } from "./bundler/bundler-result-builder";
import { CodeGeneratorMode, generateCode } from "./code-generator";

export interface BuilderOptions {
    sourcePath: string;
    destinationPath: string;
    production: boolean;
    primnoConfig: PrimnoConfig;
    mode: CodeGeneratorMode;
    moduleName: string;
}

export class Builder {
    private bundler: Bundler;
    private options: BuilderOptions[];

    public constructor(options: BuilderOptions | BuilderOptions[]) {
        if (!Array.isArray(options)) {
            options = [options];
        }

        this.options = options;

        this.bundler = new Bundler(options.map(opt => ({
            production: opt.production,
            moduleName: opt.moduleName,
            destinationPath: opt.destinationPath,
            sourcePath: "entry",
            plugins: [
                virtual({
                    entry: generateCode({
                        config: opt.primnoConfig,
                        sourcePath: opt.sourcePath,
                        mode: opt.mode
                    })
                })
            ],
            format: opt.mode === CodeGeneratorMode.moduleOnly ? "esm" : "umd"
        })));
    }

    private addModulesMessages(bundlerResult: BundlerResultBuilder) {
        this.options.forEach(o => {
            bundlerResult.addInfo(`Module name is ${o.moduleName}. Eg: Call ${o.moduleName}.onFormLoad for onload event.`);
        });
    }

    public async bundle() {
        const bundlerResult = await this.bundler.bundle();
        this.addModulesMessages(bundlerResult as BundlerResultBuilder);
        return bundlerResult;
    }

    public watch(): Observable<BundleResult> {
        return this.bundler.watch()
            .pipe(
                map((br) => {
                    this.addModulesMessages(br as BundlerResultBuilder);
                    return br;
                })
            );
    }
}