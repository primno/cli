import fs from "fs";
import path from "path";
import { WorkspaceConfig, defaultConfig, defaultEnvironnements, Deploy, Environnement, Serve } from "../configuration/workspace-configuration";
import { Template } from "./template/template";
import { isNullOrUndefined, mergeDeep } from "../utils/common";
import { EntryPoint } from "./entry-point";
import { Npm } from "../utils/npm";
import { Server } from "./server/server";
import { PrimnoEntryPoint } from "./primno-entry-point";
import { Publisher } from "./deployer/publisher";
import { Listr, ListrTask } from "listr2";

interface EntryPointOptions {
    entryPoint?: string | string[];
}

export interface BuildOptions extends EntryPointOptions {
    serveMode?: boolean
}

export interface DeployOptions extends BuildOptions {
}

export interface WatchOptions extends EntryPointOptions {
}

export interface ServeOptions {

}

export class Workspace {
    private _config: WorkspaceConfig;
    private _entryPoints: EntryPoint[];
    private _environnements: Environnement[];
    private _primnoEntryPoint: PrimnoEntryPoint;

    public constructor(private dirPath: string) {
        this._config = this.loadConfig();
        this._environnements = this.loadEnvironnements();
        this._entryPoints = EntryPoint.getEntryPoints(this._config);
        this._primnoEntryPoint = new PrimnoEntryPoint(this.config);
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

    public get primnoEntryPoint() {
        return this._primnoEntryPoint;
    }

    private get environnement(): Environnement | undefined {
        return this._environnements.find(e => e.name == this.config.deploy?.environnement);
    }

    public async build(options: BuildOptions) {
        await this.buildTask(options).run();
    }

    private buildTask(options: BuildOptions): Listr {
        const entryPoints = this.searchEntryPoint(options.entryPoint);

        const buildListr = new Listr([
            {
                title: "Build Primno",
                task: async () => await this.primnoEntryPoint.build(options.serveMode)
            }
        ], { concurrent: true });

        if (entryPoints.length > 0) {
            buildListr.add({
                title: "Build entrypoints",
                task: (ctx, _task): Listr => _task.newListr(
                    entryPoints.map(ep => <ListrTask>{
                        title: `Build ${ep.name}`,
                        task: async () => await ep.build(this.config.distDir)
                    }),
                    { concurrent: 3 }
                )
            });
        }

        return buildListr;
    }

    public generate(templateName: string, name: string) {
        /*const template = new Template(templateName);
        template.applyTo(this.dirPath, this.config);*/
    }

    public async deploy(options: DeployOptions) {
        await this.deployTask(options).run();
    }

    private deployTask(options: DeployOptions): Listr {
        const entryPoints = this.searchEntryPoint(options.entryPoint);

        if (isNullOrUndefined(this.environnement)) {
            throw new Error("Environnement not found");
        }

        const webResourcesId: string[] = [];

        const deployListr = new Listr([
            {
                title: "Build project",
                task: (): Listr => this.buildTask(options)
            },
            {
                title: "Deploy Primno",
                task: async() => webResourcesId.push(await this.primnoEntryPoint.deploy(this.environnement as Environnement))
            }
        ]);

        if (entryPoints.length > 0) {
            deployListr.add({
                title: "Deploy entrypoints",
                task: (ctx, _task): Listr => _task.newListr(
                    entryPoints.map(ep => <ListrTask>{
                        title: `Deploy ${ep.name}`,
                        task: async () => webResourcesId.push(await ep.deploy(this.environnement as Environnement))
                    }),
                    { concurrent: false }
                )
            });
        }

        deployListr.add({
            title: "Publish",
            task: async () => {
                const publisher = new Publisher({ webResourcesId });
                await publisher.publish(this.environnement as Environnement);
            }
        });

        return deployListr;
    }

    public async watch(options: WatchOptions) {
        await this.watchTask(options).run();
    }

    private watchTask(options: WatchOptions): Listr {
        const entryPoints = this.searchEntryPoint(options.entryPoint);

        const watchListr = new Listr(entryPoints.map(ep => <ListrTask>{
            title: `Watching ${ep.name}`,
            task: async () => await ep.watch()
        }), { concurrent: true });

        return watchListr;
    }

    public async serve(options: ServeOptions) {
        await this.serveTask(options).run();
    }

    private serveTask(options: ServeOptions): Listr {
        return new Listr([
            {
                title: "Deploy Primno",
                task: (): Listr => this.deployTask({ entryPoint: [], serveMode: true })
            },
            {
                title: "Watching",
                task: (): Listr => this.watchTask({})
            },
            {
                title: "Serve",
                task: () => {
                    const server = new Server(this.config.serve as Serve);
                    server.serve(this.config.distDir);
                }
            }
        ]);
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

    private loadEnvironnements(): Environnement[] {
        const content = fs.readFileSync(path.join(this.dirPath, "primno.env.json"), "utf-8");
        return JSON.parse(content) ?? [];
    }

    public static create(dirPath: string, name: string): Workspace {
        const workspaceDir = path.join(dirPath, name);

        if (fs.existsSync(workspaceDir)) {
            throw new Error("Directory already exist");
        }

        fs.mkdirSync(workspaceDir);

        let config = { ...defaultConfig, name: name };
        const environnements = defaultEnvironnements;

        const templateApplier = new Template("new");
        templateApplier.applyTo(workspaceDir, config, environnements);

        const npm = new Npm(workspaceDir);
        npm.install(["tslib", "@types/xrm@^9.0.40"], { dev: true });
        npm.link("@primno/core");

        return new Workspace(workspaceDir);
    }

    public static isWorkspace(dirPath: string): boolean {
        return fs.existsSync(path.join(dirPath, "primno.json"));
    }
}