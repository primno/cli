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

    public async build(entryPoint?: string | string[], serveMode?: boolean) {
        const entryPoints = this.searchEntryPoint(entryPoint);

        // Build Primno
        await this.primnoEntryPoint.build(serveMode);

        // Build entry points
        for (const ep of entryPoints) {
            await ep.build(this.config.distDir);
        }
    }

    public generate(templateName: string, name: string) {
        /*const template = new Template(templateName);
        template.applyTo(this.dirPath, this.config);*/
    }

    public async deploy(entryPoint?: string | string[]) {
        const entryPoints = this.searchEntryPoint(entryPoint);

        if (isNullOrUndefined(this.environnement)) {
            throw new Error("Environnement not found");
        }

        try {
            const webResourcesId = [];

            // Deploy Primno
            webResourcesId.push(await this.primnoEntryPoint.deploy(this.environnement));

            // Deploy entry points
            for (const ep of entryPoints) {
                webResourcesId.push(await ep.deploy(this.environnement));
            }

            console.log("Publishing ...");
            // Publish webressources
            const publisher = new Publisher({ webResourcesId });
            await publisher.publish(this.environnement);
        }
        catch (except: any) {
            console.error(`Deploying error: ${except.message}`);
        }
    }

    public async watch(entryPoint?: string | string[]) {
        const entryPoints = this.searchEntryPoint(entryPoint);

        for (const ep of entryPoints) {
            await ep.watch();
        }
    }

    public serve(): Server {
        const server = new Server(this.config.serve as Serve);
        server.serve(this.config.distDir);
        return server;
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
        
        let config = { ...defaultConfig, name: name};
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