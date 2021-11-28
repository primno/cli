export interface Environnement {
    name: string;
    production: boolean;
    connectionString: string;
}

export interface Build {
    entryPoints?: string[];
    environnement: string;
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
    webResourcePathFormat: string;
}

export interface Configuration {
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
        production: false,
        connectionString: ""
    }
];

export const defaultConfig: Configuration = {
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
        webResourcePathFormat: "{{editorName}}_/js/{{entryPoint}}.js"
    },
    build: {
        environnement: "dev"
    }
};
