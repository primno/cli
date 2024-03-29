import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { InputOptions, ModuleFormat, OutputOptions, Plugin, rollup, RollupLog, RollupWatchOptions, WarningHandler, WarningHandlerWithDefault, watch } from "rollup";
import terser from "@rollup/plugin-terser";
import { Observable } from "rxjs";
import { Result, ResultBuilder } from "../../../task";
import { getPackageJson } from "../../../utils/package";
import { onWarnWrapper } from "./warn-wrapper";
import babel from "@rollup/plugin-babel";
import { buildMessage } from "./message-builder";

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

function removeNodeModuleWarnings(nextHandler: WarningHandlerWithDefault): WarningHandlerWithDefault {
    return (warning, defaultHandler) => {
        if (warning.code === "CIRCULAR_DEPENDENCY" && warning.ids?.at(0)?.includes("node_modules")) {
            return;
        }

        if (warning.code === "THIS_IS_UNDEFINED" && warning.id?.includes("node_modules")) {
            return;
        }

        return nextHandler(warning, defaultHandler);
    };
}

export class Bundler {
    protected rollupOptions: RollupOption[];

    public constructor(options: BundlerOptions | BundlerOptions[]) {
        const pkg = getPackageJson();
        const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

        if (!Array.isArray(options)) {
            options = [options];
        }

        const productionPlugins = [
            terser()
        ];

        this.rollupOptions = options.map(opt => <RollupOption>{
            input: {
                input: opt.sourcePath,
                plugins: [
                    nodeResolve(),
                    typescript({
                        tsconfig: "./tsconfig.json",
                        noEmitOnError: false
                    }),
                    babel({
                        babelHelpers: "bundled",
                        presets: [
                            ["@babel/preset-env", {
                                "useBuiltIns": "usage",
                                "corejs": 3
                            }]
                        ]
                    }),
                    commonjs(),
                    ...opt.production ? productionPlugins : [],
                    ...opt.plugins ?? [],
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
                input.onwarn = removeNodeModuleWarnings(onWarnWrapper(resultBuilder));

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
                            {
                                const message = buildMessage(event.error);
                                resultBuilder.addError(message);
                            }
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
                observer.error(new Error(`Watching error occurred: ${except}`));
            }
            finally {
                rollupWatcher?.close();
            }
        });
    }
}