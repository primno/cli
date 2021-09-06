import { Command } from 'commander';
import { Workspace } from '../core/workspace';

async function buildAction(entryPoint?: string) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.build(entryPoint);
};

export const buildCommand = new Command('build')
    .argument('[entrypoint]', 'entrypoint to build')
    .description('build project')
    .action(buildAction);