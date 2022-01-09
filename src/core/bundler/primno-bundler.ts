import { InputOptions, OutputOptions, rollup, Plugin } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import virtual from "@rollup/plugin-virtual";
import typescript from "@rollup/plugin-typescript";
import { getPackageJson } from "../../utils/package";
import { Configuration as PrimnoConfig } from "@primno/core";
import { isNullOrUndefined } from "../../utils/common";

//TODO: Add EntryPoint with Primno embeded bundler
//TODO: Add Configuration in Project Primno and Embeded bundler

export class PrimnoBundler {
    private rollupInput: InputOptions;
    private rollupOutput: OutputOptions;

    public constructor(moduleName: string, config: PrimnoConfig, private destPath: string) {
        const pkg = getPackageJson();

        const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

        this.rollupInput = {
            input: "entry",
            plugins: [
                virtual({
                    entry: this.generatePrimnoCode(config as any)
                }) as Plugin,
                nodeResolve(),
                commonjs(),
                typescript()
            ],
            external,
        };

        this.rollupOutput = {
            format: "umd",
            file: destPath,
            name: moduleName,
            sourcemap: false
        };
    }

    private generatePrimnoCode(config?: PrimnoConfig): string {
        let primnoCode = `import * as primno from "@primno/core/dist/primno-d365.esm.js";
                          export default primno;`;
        if (!isNullOrUndefined(config)) {
            primnoCode += `primno.setConfig(${JSON.stringify(config)});`;
        }

        return primnoCode;
    }

    public async bundle() {
        let rollupBuild;

        try {
            rollupBuild = await rollup(this.rollupInput);
            await rollupBuild.write(this.rollupOutput);
        }
        catch (except) {
            throw new Error(`Building error occured: ${except}`);
        }
        finally {
            await rollupBuild?.close();
        }
    }
}
