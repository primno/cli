import path from 'path';

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

            return [
                {
                    type: 'add',
                    path: 'src/{{pageType}}/{{subPath}}/{{dashCase name}}/{{dashCase name}}.component.ts',
                    templateFile: 'new/{{pageType}}-component.ts.hbs',
                    destination: 'src',
                }
            ]
        }
    });
}