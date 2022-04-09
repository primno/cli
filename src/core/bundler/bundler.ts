import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { InputOptions, ModuleFormat, OutputOptions, Plugin, rollup, RollupWatchOptions, watch } from "rollup";
import { Observable } from "rxjs";
import { getPackageJson } from "../../utils/package";
import { BundleResult } from "./bundle-result";
import { BundlerResultBuilder, onWarnWrapper } from "./bundler-result-builder";

export interface BundlerOptions {
    sourcePath: string;
    destinationPath: string;
    format: ModuleFormat;
    plugins?: Plugin[];
    moduleName?: string;
}

interface RollupOption {
    input: InputOptions,
    output: OutputOptions
}

export class Bundler {
    protected rollupOptions: RollupOption[];

    public constructor(options: BundlerOptions | BundlerOptions[]) {
        const pkg = getPackageJson();
        const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

        if (!Array.isArray(options)) {
            options = [options];
        }

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
                    ...opt.plugins ?? []
                ],
                external,
            },
            output: {
                format: opt.format,
                name: opt.moduleName,
                file: opt.destinationPath,
                sourcemap: false
            }
        });
    }

    public async bundle(): Promise<BundleResult> {
        let rollupBuild;

        const resultBuilder = new BundlerResultBuilder();

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

    public watch(): Observable<BundleResult> {
        return new Observable((observer) => {
            let rollupWatcher;

            try {
                const resultBuilder = new BundlerResultBuilder();

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
                observer.error(`Watching error occured: ${except}`);
            }
            finally {
                rollupWatcher?.close();
            }
        });
    }
}