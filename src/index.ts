import chalk from "chalk";
import figlet from "figlet";
import { program } from 'commander';
import { startCommand, newCommand, buildCommand, watchCommand, deployCommand } from './commands';

console.log(
    chalk.rgb(238,167,74)(figlet.textSync("Primno CLI"))
);

program.version('1.0.0')
    .addCommand(startCommand)
    .addCommand(newCommand)
    .addCommand(buildCommand)
    .addCommand(watchCommand)
    .addCommand(deployCommand)
    .parseAsync(process.argv);
