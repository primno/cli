import path from 'path';
import fs from 'fs';
import { NodePlopAPI } from 'node-plop';
// import {  } from "typescript";

/**
 * Search the near module (file with .module.ts extension) in the path.
 * The search is done right to left.
 */
function searchNearModuleFromPath(searchedPath: string) {
    const normalizedPath = path.normalize(searchedPath);
    const pathParts = normalizedPath.split(path.sep);
    
    while(pathParts.length > 0) {
        pathParts.pop();

        const currentPath = path.join(pathParts.join(path.sep));

        if (!fs.existsSync(currentPath)) {
            continue;
        }

        const files = fs.readdirSync(currentPath);
        const module = files.find(f => f.endsWith('.module.ts'));

        if (module) {
            return path.join(currentPath, module);
        }
    }

    throw new Error(`No module found in ${searchedPath}`);
}

export default function (
    plop: NodePlopAPI
    ) {
    // plop.setActionType("appendInDeclaration", (answers, config, plop) => {
    //     const { modulePath, componentPath } = config;
    //     const relativePath = path.relative(path.dirname(modulePath), componentPath);
    // };

    plop.setGenerator('new', {
        description: 'Create a new component',
        prompts: [
            {
                type: 'list',
                name: 'pageType',
                message: 'Which page are you targeting?',
                choices: [
                    { name: 'Record (eg. main form, quick create)', short: "record", value: 'record' },
                    { name: 'List (eg. grid, sub-grid)', short: "list", value: 'list' }
                ]
            },
            {
                type: 'input',
                name: 'table',
                message: 'Which table(s) are you targeting? (eg. account, contact)'
            },
        ],
        actions: (data: any) => {
            const namePath = path.parse(data.name);
            data.name = namePath.base;
            data.subPath = namePath.dir;

            if (data.subPath.includes("..")) {
                throw new Error("Sub-path cannot reference parent directory");
            }

            const componentPath = plop.renderString("src/{{pageType}}/{{subPath}}/{{dashCase name}}/{{dashCase name}}.component.ts", data);
            const modulePath = searchNearModuleFromPath(componentPath);

            return [
                {
                    type: 'add',
                    path: componentPath,
                    templateFile: 'new/{{pageType}}-component.ts.hbs',
                    destination: 'src',
                },
                {
                    type: 'addDeclaration',
                    modulePath: modulePath,
                    componentPath: componentPath 
                }
            ]
        }
    });
}