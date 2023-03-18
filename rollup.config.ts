import resolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { RollupOptions } from 'rollup';

// eslint-disable-next-line security/detect-non-literal-fs-filename
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const external: string[] = [
    ...Object.keys("dependencies" in pkg ? pkg.dependencies as Record<string, unknown> : {}),
    ...Object.keys("peerDependencies" in pkg ? pkg.peerDependencies as Record<string, unknown> : {}),
];

const plugins = [
    typescript({ compilerOptions: { rootDir: "./src" } }),
    commonjs(),
    resolve(),
    terser()
];

export default function(
    //command: Record<string, unknown>
): RollupOptions[] {
    return [
        // CJS
        {
            input: 'src/index.ts',
            plugins,
            external,
            output: { format: 'esm', file: 'dist/tsc.mjs' }
        }
    ]
}