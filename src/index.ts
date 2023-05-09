import chalk from "chalk";
import figlet from "figlet";
import { program } from 'commander';
import { startCommand, newCommand, buildCommand, watchCommand, deployCommand, generateCommand } from './commands';
import { getPackageJson } from "./utils/package";
import { getRootDirName } from "./utils/dir";

console.log(
    chalk.rgb(238,167,74)(figlet.textSync("Primno CLI"))
);

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
        console.error(chalk.red(err.message));
        process.exitCode = 1;
    });