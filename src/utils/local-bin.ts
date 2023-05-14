import { existsSync } from 'fs';
import path from 'path';
import { getPackageJson } from './package';

const pathSegments = [process.cwd(), 'node_modules', '@primno', 'cli'];

export function localBinExists() {
    return existsSync(path.join(...pathSegments));
}

export function getLocalBinVersion() {
    return getPackageJson(path.join(...pathSegments)).version as string;
}

export async function getLocalBin(): Promise<typeof import('../cli')> {
    try {
        const cliPath = path.posix.join(...pathSegments, 'dist', 'cli.mjs');
        return await import(`file://${cliPath}`);
    }
    catch (except: any) {
        throw new Error(`Unable to load local CLI: ${except.message}`);
    }
}