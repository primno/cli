import chalk from "chalk";
import figlet from "figlet";
import { program } from 'commander';
import { serveCommand, newCommand } from './commands';

console.log(chalk.blue(
    figlet.textSync("Primno CLI", {horizontalLayout: 'full'})
));

 program
     .version('1.0.0')

 program
     .command('serve <dir>')
    .description('Serve the primno library directory')
        .option('-p, --port <number>', 'Port', '12357')
        .option('--pfx <name>', 'PFX certificate file')
        .option('-pwd, --passphrase <passphrase>', 'PFX passphrase')
        .action(serveCommand);

program
    .command('new <name>')
    .description('Create a new Primno project')
        .action(newCommand)

program.parse(process.argv);
