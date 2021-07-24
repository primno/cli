import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import pkg from './package.json';

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

const plugins = [
    nodeResolve(),
    typescript({ module: "esnext" })
];

export default [
    // Public API (cjs)
    {
        input: 'src/index.ts',
        plugins,
        external,
        output: { format: 'cjs', file: 'dist/tsc.js' },
    }
];