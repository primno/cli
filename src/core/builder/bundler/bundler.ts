import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { InputOptions, ModuleFormat, OutputOptions, Plugin, rollup, RollupWatchOptions, watch } from "rollup";
import { terser } from "rollup-plugin-terser";
import { Observable } from "rxjs";
import { Result, ResultBuilder } from "../../../task";
import { getPackageJson } from "../../../utils/package";
import {  onWarnWrapper } from "./warn-wrapper";

export interface BundlerOptions {
    sourcePath: string;
    destinationPath: string;
    format: ModuleFormat;
    plugins?: Plugin[];
    moduleName?: string;
    production: boolean;
}

interface RollupOption {
    input: InputOptions,
    output: OutputOptions
}

export class Bundler {
    protected rollupOptions: RollupOption[];

    // TODO: Add babel and terser support. Remove production flag.
    public constructor(options: BundlerOptions | BundlerOptions[]) {
        const pkg = getPackageJson();
        const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

        if (!Array.isArray(options)) {
            options = [options];
        }
        
        const productionPlugins = [terser()];

        this.rollupOptions = options.map(opt => <RollupOption>{
            input: {
                input: opt.sourcePath,
                plugins: [
                    nodeResolve(),
                    commonjs(),
                    typescript({
                        tsconfig: "./tsconfig.json",
                        noEmitOnError: false
                    }),
                    ...opt.production ? productionPlugins : [],
                    ...opt.plugins ?? []
                ],
                external,
            },
            output: {
                format: opt.format,
                name: opt.moduleName,
                file: opt.destinationPath,
                sourcemap: opt.production ? false : "inline"
            }
        });
    }

    public async bundle(): Promise<Result> {
        let rollupBuild;

        const resultBuilder = new ResultBuilder(false);

        try {
            resultBuilder.start();

            for (const rollupOption of this.rollupOptions) {
                const input = rollupOption.input;
                input.onwarn = onWarnWrapper(resultBuilder);

                rollupBuild = await rollup(input);
                await rollupBuild.write(rollupOption.output);
            }
        }
        catch (except: any) {
            resultBuilder.addError(except.message);
        }
        finally {
            resultBuilder.end();

            await rollupBuild?.close();
            return resultBuilder;
        }
    }

    public watch(): Observable<Result> {
        return new Observable((observer) => {
            let rollupWatcher;

            try {
                const resultBuilder = new ResultBuilder(true);

                const options = this.rollupOptions.map(ro => <RollupWatchOptions>{
                    ...ro.input,
                    output: ro.output,
                    onwarn: onWarnWrapper(resultBuilder)
                });

                rollupWatcher = watch(options);

                rollupWatcher.on("event", (event) => {
                    switch (event.code) {
                        case "START":
                            resultBuilder.start();
                            break;
                        case "ERROR":
                            resultBuilder.addError(`${event.error.message} at ${event.error.loc?.line}, ${event.error.loc?.column}`)
                            break;
                        case "END":
                            resultBuilder.end();
                    }

                    observer.next(resultBuilder);

                    if ('result' in event && event.result) {
                        event.result.close();
                    }
                });
            } catch (except) {
                observer.error(`Watching error occurred: ${except}`);
            }
            finally {
                rollupWatcher?.close();
            }
        });
    }
}