
export default function (
    /** @type { import("node-plop").NodePlopAPI } */
    plop
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