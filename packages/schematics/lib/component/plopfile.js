import path from 'path';
import fs from 'fs';

/**
 * Search the near module (file with .module.ts extension) in the path.
 * The search is done right to left.
 */
function searchNearModuleFromPath(/** @type { string } */ searchedPath) {
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
    /** @type { import("node-plop").NodePlopAPI } */
    plop
    ) {
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
        actions: (/** @type { { name: string; pageType: "list" | "record", table: string } } */ data) => {
            const namePath = path.parse(data.name);
            data.name = namePath.base;
            data.subPath = namePath.dir;

            if (data.subPath.includes("..")) {
                throw new Error("Sub-path cannot reference parent directory");
            }

            const componentPath = plop.renderString("src/{{pageType}}/{{subPath}}/{{dashCase name}}/{{dashCase name}}.component.ts", data);
            const modulePath = searchNearModuleFromPath(componentPath);

            const absoluteModuleDir = path.posix.resolve(path.posix.dirname(modulePath));
            const absoluteComponentPath = path.posix.resolve(componentPath);
            data.moduleToComponentPath = path.posix.relative(absoluteModuleDir, absoluteComponentPath);

            return [
                {
                    type: 'add',
                    path: componentPath,
                    templateFile: 'new/{{pageType}}-component.ts.hbs',
                    destination: 'src',
                },
                {
                    type: 'append',
                    path: modulePath,
                    pattern: /import\s.*\sfrom\s.*;/,
                    template: `import { {{pascalCase name}}Component } from './{{moduleToComponentPath}}';`,
                }
                ,
                {
                    type: 'append',
                    path: modulePath,
                    pattern: /declarations:\s*\[/,
                    template: `        {{pascalCase name}}Component,`,
                }
            ]
        }
    });
}