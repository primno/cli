import { Command } from 'commander';
import { Workspace } from '../core/workspace';

async function newAction(projectName: string) {
    try {
        await Workspace.create(".", projectName);
    }
    catch (except: any) {
        console.error(except.message);
    }
};

export const newCommand = new Command('new')
    .alias('n')
    .argument('<name>', 'project name')
    .description('create a new primno workspace.')
    .action(newAction);