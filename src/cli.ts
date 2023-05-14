import { program } from 'commander';
import { startCommand, newCommand, buildCommand, watchCommand, deployCommand, generateCommand } from './commands';
import { getPackageJson } from "./utils/package";
import { getRootDirName } from "./utils/dir";
import { showError } from "./utils/display";
import process from 'process';

interface Options {
    
}

const pkg = getPackageJson(getRootDirName());

export const VERSION = pkg.version as string;

export default function run(options: Options) {
    program
        .name('mn')
        .version(pkg.version)
        .description(pkg.description)
        .addCommand(startCommand)
        .addCommand(newCommand)
        .addCommand(buildCommand)
        .addCommand(watchCommand)
        .addCommand(deployCommand)
        .addCommand(generateCommand)
        .parseAsync(process.argv)
        .catch((err) => {
            showError(err.message);
            process.exitCode = 1;
        });
}