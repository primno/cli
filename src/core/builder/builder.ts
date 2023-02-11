import virtual from "@rollup/plugin-virtual";
import { map, Observable } from "rxjs";
import { Bundler } from "./bundler/bundler";
import { Configuration as PrimnoConfig } from "@primno/core";
import { CodeGeneratorMode, generateCode } from "./code-generator";
import { ResultBuilder } from "../../task/result-builder";
import { Result } from "../../task/result";

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

    private addModulesMessages(bundlerResult: ResultBuilder) {
        this.options.forEach(o => {
            bundlerResult.addInfo(`Module name is ${o.moduleName}. Eg: Call ${o.moduleName}.onFormLoad for onload event.`);
        });
    }

    public async bundle() {
        const bundlerResult = await this.bundler.bundle();
        this.addModulesMessages(bundlerResult as ResultBuilder);
        return bundlerResult;
    }

    public watch(): Observable<Result> {
        return this.bundler.watch()
            .pipe(
                map((br) => {
                    this.addModulesMessages(br as ResultBuilder);
                    return br;
                })
            );
    }
}