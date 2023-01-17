export interface Environnement {
    name: string;
    connectionString: string;
}

export interface Build {
    entryPoints?: string[];
}

export interface Certificate {
    pfx?: string;
    pfxPassword?: string;
    selfSigned?: boolean;
}

export interface Serve {
    port?: number;
    https?: boolean;
    certificate?: Certificate;
}

export interface Deploy {
    entryPoints?: string[],
    environnement: string;
    solutionUniqueName: string;
    webResourceNameTemplate: {
        primno: string,
        entryPoint: string
    }
}

export interface WorkspaceConfig {
    name: string;
    version: string;
    sourceRoot: string;
    entryPointDir: string;
    distDir: string;
    build?: Build;
    serve?: Serve;
    deploy?: Deploy;
}

export const defaultEnvironnements: Environnement[] = [
    {
        name: "dev",
        connectionString: "<set connection string>"
    }
];

export const defaultConfig: WorkspaceConfig = {
    name: "name",
    version: "1.0.0",
    sourceRoot: "src",
    entryPointDir: "entry-point",
    distDir: "dist",
    serve: {
        https: true,
        port: 12357,
        certificate: {
            selfSigned: true
        }
    },
    deploy: {
        environnement: "dev",
        solutionUniqueName: "<set solution unique name>",
        webResourceNameTemplate: {
            primno: "{{editorName}}_/{{projectName}}/js/primno.js",
            entryPoint: "{{editorName}}_/{{projectName}}/js/{{entryPoint}}.js"
        }
    },
    build: {
        
    }
};
