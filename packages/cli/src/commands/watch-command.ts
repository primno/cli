import { Command } from 'commander';
// TODO: Replace
import { EntryPointBuildMode } from '../core/entry-point';
import { Workspace } from '../core/workspace';

async function watchAction() {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.watch({ mode: EntryPointBuildMode.primnoEmbedded, production: false });
};

export const watchCommand = new Command('watch')
    .alias("w")
    .description('build the workspace and rebuild on file changes')
    .action(watchAction);