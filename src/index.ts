import chalk from "chalk";
import figlet from "figlet";
import { program } from 'commander';
import { serveCommand, newCommand } from './commands';

console.log(
    chalk.blue(figlet.textSync("Primno CLI"))
);

program.version('1.0.0')
    .addCommand(serveCommand)
    .addCommand(newCommand)
    .parse(process.argv);
