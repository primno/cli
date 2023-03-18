import fs from "fs";
import path from "path";
import { WorkspaceConfig, defaultConfig, defaultEnvironments, Deploy, Environment, Serve } from "../configuration/workspace-configuration";
import { Template } from "./template/template";
import { isNullOrUndefined, mergeDeep } from "../utils/common";
import { EntryPoint, EntryPointBuildMode } from "./entry-point";
import { Npm } from "../utils/npm";
import { Server } from "./server/server";
import { Publisher } from "./deployer/publisher";
import { map, Observable } from "rxjs";
import { Action, Task, ResultBuilder } from "../task";
import open from "open";

interface EntryPointOptions {
    entryPoint?: string | string[];
}

export interface BuildOptions extends EntryPointOptions {
    /**
     * Primno import entry points from local web server.
     */
    mode: EntryPointBuildMode;
    /**
     * Production mode will minify files.
     */
    production: boolean;
}

export interface DeployOptions extends BuildOptions {

}

export interface WatchOptions extends BuildOptions {

}

export interface StartOptions extends EntryPointOptions {

}

export interface PublishOptions {
    webResourcesId: string[];
}

export class Workspace {
    private _config: WorkspaceConfig;
    private _entryPoints: EntryPoint[];
    private _environments: Environment[];

    public constructor(private dirPath: string) {
        this._config = this.loadConfig();
        this._environments = this.loadEnvironments();
        this._entryPoints = EntryPoint.getEntryPoints(this._config);
    }

    public get name(): string {
        return this.config.name;
    }

    public get config() {
        return this._config;
    }

    public get entryPoints() {
        return this._entryPoints;
    }

    private get environment(): Environment | undefined {
        return this._environments.find(e => e.name == this.config.deploy?.environment);
    }

    public async build(options: BuildOptions) {
        await this.buildTask(options).run();
    }

    private buildTask(options: BuildOptions): Task {
        const entryPoints = this.searchEntryPoint(options.entryPoint);

        const entryPointsActions = entryPoints.map(ep => <Action>{
            title: `Build ${ep.name}`,
            action: async () => {
                const result = await ep.build(options);
                if (result.hasErrors) {
                    throw new Error(result.toString());
                }
                return result.toString();
            }
        });

        return Task.new()
            .newActions(entryPointsActions)
            .withConcurrency(3)
    }

    public generate(templateName: string, name: string) {
        /*const template = new Template(templateName);
        template.applyTo(this.dirPath, this.config);*/
    }

    public async deploy(options: DeployOptions) {
        await this.deployTask(options).run();
    }

    private deployTask(options: DeployOptions): Task {
        const entryPoints = this.searchEntryPoint(options.entryPoint);

        if (isNullOrUndefined(this.environment)) {
            throw new Error("Environment not found");
        }

        const webResourcesId: string[] = [];

        const deployEntryPointsActions = entryPoints.map(ep => <Action>{
            title: `Deploy ${ep.name}`,
            action: () => new Observable<string>(observer => {
                ep.deploy({
                    environment: this.environment as Environment,
                    deviceCodeCallback: (url, code) => {
                        observer.next(`Device authentication required. Open ${url} and enter code ${code}`);
                        open(url);
                    }
                }).then((webResourceId) => {
                    webResourcesId.push(webResourceId);
                    observer.complete();
                }).catch(err => observer.error(err));
            })
        });

        return Task.new()
            .withConcurrency(false)
            .addTaskAsLevel(this.buildTask(options), "Build")
            .newLevel("Deploy entry points")
                .newActions(deployEntryPointsActions)
                .withConcurrency(3)
            .endLevel()
            .addSubtasks(this.publishTask({ webResourcesId }));
    }

    private publishTask(options: PublishOptions): Task {
        const { webResourcesId } = options;

        return Task.new()
            .newAction({
                title: "Publish",
                action: () => new Observable<string>(observer => {
                    const publisher = new Publisher({
                        webResourcesId,
                        environment: this.environment as Environment,
                        deviceCodeCallback: (url, code) => {
                            observer.next(`Device authentication required. Open ${url} and enter code ${code}`);
                            open(url);
                        }
                    });
                    publisher.publish()
                    .then(() => observer.complete())
                    .catch(err => observer.error(err));
                })
            });
    }

    public async watch(options: WatchOptions) {
        await this.watchTask(options).run();
    }

    private watchTask(options?: WatchOptions): Task {
        const entryPoints = this.searchEntryPoint(options?.entryPoint);

        return Task.new()
            .newObservable(
                "Watching",
                EntryPoint.watch(entryPoints, options)
                    .pipe(map(e => e.toString()))
            );
    }

    public async start(options: StartOptions) {
        await this.startTask(options).run();
    }

    private startTask(options: StartOptions): Task {
        return Task.new()
            //.withConcurrency(true)
            .addTaskAsLevel(this.deployTask({
                entryPoint: options.entryPoint,
                production: false,
                mode: EntryPointBuildMode.primnoImportLocal
            }), "Deploy")
            .addSubtasks(this.serveTask())
            .addSubtasks(this.watchTask({
                entryPoint: options.entryPoint,
                mode: EntryPointBuildMode.moduleOnly,
                production: false,
            }));
    }

    private serveTask(): Task {
        return Task.new()
            .newAction({
                title: "Serve",
                action: async () => {
                    const server = new Server(this.config.serve as Serve);
                    const serveInfo = await server.serve(this.config.distDir);

                    const resultBuilder = new ResultBuilder();
                    const url = `${serveInfo.schema}://localhost:${serveInfo.port}/`;
                    resultBuilder.addInfo(`Serving on ${url}`);

                    if (serveInfo.newSelfSignedCert) {
                        resultBuilder.addWarning(`New self-signed certificate generated. Accept it in your browser.`);
                        try {
                            await open(url);
                        }
                        catch {
                            resultBuilder.addWarning(`Unable to open browser. Please open ${url} manually.`);
                        }
                    }

                    return resultBuilder.toString()
                }
            });
    }

    private searchEntryPoint(entryPoint?: string | string[]) {
        if (isNullOrUndefined(entryPoint)) {
            return this._entryPoints;
        }

        if (Array.isArray(entryPoint)) {
            return this._entryPoints.filter(ep => entryPoint.some(sep => sep === ep.name));
        }

        return this._entryPoints.filter(e => e.name == entryPoint);
    }

    private loadConfig(): WorkspaceConfig {
        const content = fs.readFileSync(path.join(this.dirPath, "primno.json"), "utf-8");
        return mergeDeep(defaultConfig as any, JSON.parse(content));
    }

    private loadEnvironments(): Environment[] {
        const content = fs.readFileSync(path.join(this.dirPath, "primno.env.json"), "utf-8");
        return JSON.parse(content) ?? [];
    }

    public static create(dirPath: string, name: string): Workspace {
        const workspaceDir = path.join(dirPath, name);

        if (fs.existsSync(workspaceDir)) {
            throw new Error("Directory already exists");
        }

        fs.mkdirSync(workspaceDir);

        let config = { ...defaultConfig, name: name };
        const environments = defaultEnvironments;

        const templateApplier = new Template("new");
        templateApplier.applyTo(workspaceDir, config, environments);

        const npm = new Npm(workspaceDir);
        npm.install(
            [
                "tslib",
                "@types/xrm",
                "@primno/core"
            ],
            { dev: true }
        );

        return new Workspace(workspaceDir);
    }

    public static isWorkspace(dirPath: string): boolean {
        return fs.existsSync(path.join(dirPath, "primno.json"));
    }
}