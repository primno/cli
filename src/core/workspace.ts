import fs from "fs";
import path from "path";
import { Configuration, defaultConfig, Deploy, Serve } from "../configuration/configuration";
import { Template } from "./template/template";
import { isNullOrUndefined, mergeDeep } from "../utils/common";
import { EntryPoint } from "./entry-point";
import { Npm } from "../utils/npm";
import { Server } from "./server/server";
import { Deployer } from "./deployer/deployer";

export class Workspace {
    private _config: Configuration;
    private _entryPoints: EntryPoint[];
    private _sourceRoot: string;
    private _entryPointDir: string;

    public constructor(private dirPath: string) {
        this._config = this.loadConfig();
        this._sourceRoot = path.join(dirPath, this.config.sourceRoot);
        this._entryPointDir = path.join(this._sourceRoot, this.config.entryPointDir);

        this._entryPoints = EntryPoint.getEntryPoints(this._entryPointDir);
    }

    public get config() {
        return this._config;
    }

    public get entryPoints() {
        return this._entryPoints;
    }

    public async build(entryPoint?: string | string[]) {
        const entryPoints = this.searchEntryPoint(entryPoint);

        for (const ep of entryPoints) {
            await ep.build(this.config.distDir);
        }
    }

    public generate(templateName: string, name: string) {
        /*const template = new Template(templateName);
        template.applyTo(this.dirPath, this.config);*/
    }

    public async deploy() {
        const deployer = new Deployer(this.config.deploy as Deploy, this.config.environnement);
        await deployer.deploy();
    }

    public async watch(entryPoint?: string | string[]) {
        const entryPoints = this.searchEntryPoint(entryPoint);

        for (const ep of entryPoints) {
            await ep.watch(this.config.distDir);
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

    private loadConfig(): Configuration {
        const content = fs.readFileSync(path.join(this.dirPath, "primno.json"), "utf-8");
        return mergeDeep(defaultConfig as any, JSON.parse(content));
    }

    public static create(dirPath: string, name: string): Workspace {
        const workspaceDir = path.join(dirPath, name);

        if (fs.existsSync(workspaceDir)) {
            throw new Error("Directory already exist");
        }

        fs.mkdirSync(workspaceDir);
        
        let config = { ...defaultConfig, name: name};

        const templateApplier = new Template("new");
        templateApplier.applyTo(workspaceDir, config);

        const npm = new Npm(workspaceDir);
        npm.install(["tslib", "@types/xrm@^9.0.40"], { dev: true });
        npm.link("@primno/core");

        return new Workspace(workspaceDir);
    }

    public static isWorkspace(dirPath: string): boolean {
        return fs.existsSync(path.join(dirPath, "primno.json"));
    }
}