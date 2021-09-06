import { Bundler } from "./bundler/bundler";
import path from "path";
import glob from "glob";

export class EntryPoint {
    private _name: string;

    public constructor(private entryPointPath: string) {
        this._name = path.basename(entryPointPath, ".ts");
    }

    public get name(){
        return this._name;
    }

    public async build(destinationDir: string): Promise<void> {
        console.info(`Building ${this.name} ...`);
        const dstPath = path.join(destinationDir, `${this.name}.js`);
        const bundler = new Bundler(this.entryPointPath, dstPath);
        await bundler.bundle();
    }

    public async watch(destinationDir: string) {
        console.info(`Watching ${this.name} ...`);
        const dstPath = path.join(destinationDir, `${this.name}.js`);
        const bundler = new Bundler(this.entryPointPath, dstPath);
        bundler.watch();
    }

    public static getEntryPoints(entryPointDir: string) {
        return glob
            .sync(path.join(entryPointDir, "*.ts"))
            .map(f => new EntryPoint(f));
    }
}