import chalk from "chalk";
import figlet from "figlet";
import { program } from 'commander';
import { startCommand, newCommand, buildCommand, watchCommand, deployCommand, generateCommand } from './commands';

console.log(
    chalk.rgb(238,167,74)(figlet.textSync("Primno CLI"))
);

// TODO: Use package.json to fill version and description
program
    .name('mn')
    .version('0.5.0')
    .description("Create, build and serve primno workspace")
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