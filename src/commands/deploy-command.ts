import { Command } from 'commander';
import { EntryPointBuildMode } from '../core/entry-point';
import { Workspace } from '../core/workspace';

interface Options {
    production: boolean;
}

async function deployAction(options: Options) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.deploy({ production: options.production, mode: EntryPointBuildMode.primnoEmbedded });
};

export const deployCommand = new Command('deploy')
    .description('deploy workspace')
    .option("-p, --production", "production mode", false)
    .action(deployAction);