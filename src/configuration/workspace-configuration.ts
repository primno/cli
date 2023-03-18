export interface Environment {
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
    environment: string;
    solutionUniqueName: string;
    webResourceNameTemplate: string;
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

export const defaultConnectionString = "AuthType=OAuth;Url=<Url>;UserName=<UserName>;TokenCacheStorePath=./.cache/token.json";
export const defaultSolutionUniqueName = "<set solution unique name>";

export const defaultEnvironments: Environment[] = [
    {
        name: "dev",
        connectionString: defaultConnectionString
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
        environment: "dev",
        solutionUniqueName: defaultSolutionUniqueName,
        webResourceNameTemplate: "{{editorName}}_/{{projectName}}/js/{{entryPoint}}.js"
    },
    build: {
        
    }
};
