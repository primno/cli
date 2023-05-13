import { program } from 'commander';
import { startCommand, newCommand, buildCommand, watchCommand, deployCommand, generateCommand } from './commands';
import { getPackageJson } from "./utils/package";
import { getRootDirName } from "./utils/dir";
import { showError, showPrimnoAsciiArt } from "./utils/display";
import process from 'process';

// Set process title
try {
    process.title = `mn ${process.argv.slice(2).join(' ')}`;
} catch (_) {
    process.title = 'mn';
}

showPrimnoAsciiArt();

const pkg = getPackageJson(getRootDirName());

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