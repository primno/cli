import { Command } from 'commander';
import { Workspace } from '../core/workspace';

async function deployAction() {
    // if (!Workspace.isWorkspace(".")) {
    //     console.error("This action must be run in a primno project directory");
    //     return;
    // }

    const currentWs = new Workspace(".");
    await currentWs.deploy();
};

export const deployCommand = new Command('deploy')
    .description('deploy workspace')
    .action(deployAction);