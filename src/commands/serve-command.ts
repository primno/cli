import { Command } from 'commander';
import { Workspace } from '../core/workspace';

async function serveAction() {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.build([], true); // Primno only
    await currentWs.deploy([]); // Primno only
    await currentWs.watch();
    currentWs.serve();
};

export const serveCommand = new Command('serve')
    .description('serve the primno library directory')
    .action(serveAction);