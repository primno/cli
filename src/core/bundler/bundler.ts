import { Configuration } from "../../configuration/configuration";
import { InputOptions, OutputOptions, rollup, watch } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { getPackageJson } from "../../utils/package";

export class Bundler {
    private rollupInput: InputOptions;
    private rollupOutput: OutputOptions;

    public constructor(private sourcePath: string, private destPath: string) {
        const pkg = getPackageJson();

        const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

        this.rollupInput = {
            input: sourcePath,
            plugins: [
                nodeResolve(),
                commonjs(),
                typescript()
            ],
            external,
        };

        this.rollupOutput = {
            format: "esm",
            file: destPath,
            sourcemap: false
        };
    }

    public async bundle() {
        let rollupBuild;

        try {
            rollupBuild = await rollup(this.rollupInput);
            await rollupBuild.write(this.rollupOutput);
        }
        catch (except) {
            console.error(`Building error occured: ${except}`);
        }
        finally {
            await rollupBuild?.close();
        }
    }

    public async watch() {
        let rollupWatcher;
        try {
            rollupWatcher = watch({
                ...this.rollupInput,
                output: {
                    ...this.rollupOutput
                }
            });
        } catch (except) {
            console.error(`Watching error occurent: ${except}`);
        }
        finally {
            rollupWatcher?.close();
        }
    }
}