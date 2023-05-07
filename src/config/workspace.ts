/**
 * Environment configuration.
 */
export interface Environment {
    /**
     * Name of the environment.
     */
    name: string;

    /**
     * Connection string to the environment.
     */
    connectionString: string;
}

/**
 * Build configuration.
 */
export interface Build {
    /**
     * Module name template.
     * @default mn_{projectName}
     */
    moduleNameTemplate?: string;
}

/**
 * Certificate configuration.
 */
export interface Certificate {
    /**
     * Path to the certificate file in pfx format.
     */
    pfx?: string;

    /**
     * Password of the certificate.
     */
    pfxPassword?: string;

    /**
     * Use a self signed certificate.
     */
    selfSigned?: boolean;
}

/**
 * Serve configuration.
 */
export interface Serve {
    /**
     * Port to serve on.
     * @default 12357
     */
    port?: number;
    /**
     * Https mode.
     */
    https?: boolean;
    /**
     * Certificate to use for https.
     */
    certificate?: Certificate;
}

/**
 * Deployment configuration.
 */
export interface Deploy {
    /**
     * Environment to deploy to. See primno.env.json.
     */
    environment: string;

    /**
     * Unique name of the solution to deploy to.
     */
    solutionUniqueName: string;
    
    /**
     * Template for the web resource name.
     * The template will be formatted with the following parameters:
     * - {editorName}: Editor prefix (without the _).
     * - {projectName}: Project name.
     * @default {{editorName}}_/js/{{projectName}}.js
     */
    webResourceNameTemplate: string;
}

export interface WorkspaceConfig {
    $schema?: string;
    
    /**
     * Name of the project.
     */
    name: string;

    /**
     * Version of the project.
     */
    version: string;

    /**
     * Root directory of the source code.
     */
    sourceRoot: string;

    /**
     * Directory of the build output.
     */
    distDir: string;

    /**
     * Build configuration.
     */
    build?: Build;

    /**
     * Serve configuration.
     */
    serve?: Serve;

    /**
     * Deployment configuration.
     */
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
        webResourceNameTemplate: "{{editorName}}_/js/{{projectName}}.js"
    },
    build: {
        moduleNameTemplate: "mn_{{projectName}}"
    }
};
