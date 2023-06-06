import { NodePlopAPI } from "node-plop";

export default function (
    plop: NodePlopAPI
    ) {
    plop.setGenerator('new', {
        description: 'Create a new workspace',
        actions: [
            {
                type: 'addMany',
                templateFiles: 'new/**',
                globOptions: {
                    dot: true,
                },
                destination: '.',
            }
        ]
    });
}