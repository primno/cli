export interface Environnement {
    name: string;
    production: boolean;
    connectionString: string;
}

export interface Build {
    entryPoints?: string[];
    environnement: string;
}

export interface Serve {
    port?: number;
    https?: boolean;
    pfx?: string;
    pfxPassword?: string;
}

export interface Deploy {
    environnement: string;
}

export interface Configuration {
    name: string;
    version: string;
    sourceRoot: string;
    entryPointDir: string;
    distDir: string;
    environnement?: Environnement[];
    build?: Build;
    serve?: Serve;
    deploy?: Deploy;
}

export const defaultConfig: Configuration = {
    name: "name",
    version: "1.0.0",
    sourceRoot: "src",
    entryPointDir: "entry-point",
    distDir: "dist",
    serve: {
        https: false,
        port: 12357
    }
};
