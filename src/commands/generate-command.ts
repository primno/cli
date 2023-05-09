import { Argument, Command } from 'commander';
import { Workspace } from '../core/workspace';

async function generateAction(type: string, name: string) {
    try {
        if (!Workspace.isWorkspace(".")) {
            console.error("This action must be run in a primno project directory");
            return;
        }

        const currentWs = new Workspace(".");
        await currentWs.generate(type, name);
    }
    catch (except: any) {
        console.error(except.message);
    }
};

export const generateCommand = new Command('generate')
    .alias('g')
    .description('generate a new component, service, or module.')
    //     .command("component")
    //     .alias('c')
    //     .argument('<name>', 'name of the new component')
    //     .summary("generate a new component")
    //     .action(generateAction)
    // .parent!;  
    .addArgument(new Argument("<type>", "generator type.").choices(["component", "service", "module"]))
    .argument('<name>', 'name of the new element, can contain a path (e.g. "sales/order")')
    .description('generate a new component, service, or module')
    .action(generateAction);