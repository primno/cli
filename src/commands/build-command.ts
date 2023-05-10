import { Command } from 'commander';
import { EntryPointBuildMode } from '../core/entry-point';
import { Workspace } from '../core/workspace';

interface Options {
    production: boolean;
}

async function buildAction(options: Options) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.build({
        production: options.production,
        mode: EntryPointBuildMode.primnoEmbedded
    });
};

export const buildCommand = new Command('build')
    .alias("b")
    .summary("build workspace")
    .option("-p, --production", "production mode", false)
    .description("compile a primno workspace into a single file into the dist directory.")
    .action(buildAction);