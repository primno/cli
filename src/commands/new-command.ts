import { Command } from 'commander';

function newAction(projectName: string) {
    console.log(`Create new ${projectName} project`);
};

export const newCommand = new Command('new')
    .argument('name', 'Project name')
    .description('Create a new Primno project')
    .action(newAction);