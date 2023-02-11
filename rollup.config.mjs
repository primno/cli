import resolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json' assert { type: "json" };

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
];

const plugins = [
    typescript(),
    commonjs(),
    resolve()
];

export default [
    // Public API (cjs)
    {
        input: 'src/index.ts',
        plugins,
        external,
        output: { format: 'esm', file: 'dist/tsc.mjs', sourcemap: "inline" },
    }
];