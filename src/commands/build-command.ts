import { Command } from 'commander';
import { Workspace } from '../core/workspace';

interface Options {
    production: boolean;
}

async function buildAction(entryPoint: string | undefined, options: Options) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.build({
        entryPoint,
        production: options.production
    });
};

export const buildCommand = new Command('build')
    .argument("[entrypoint]", "entrypoint to build")
    .option("-p, --production", "production mode", false)
    .description("build project")
    .action(buildAction);