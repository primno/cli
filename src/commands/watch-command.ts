import { Command } from 'commander';
// TODO: Replace
import { EntryPointBuildMode } from '../core/entry-point';
import { Workspace } from '../core/workspace';

async function watchAction(entryPoint?: string | string[]) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.watch({ entryPoint, mode: EntryPointBuildMode.primnoEmbedded, production: false });
};

export const watchCommand = new Command('watch')
    .argument('[entrypoint]', 'entrypoint to watch')
    .description('watch project')
    .action(watchAction);