import { Observable } from "rxjs";
import { BundleResult } from "./bundler/bundle-result";
import { Bundler } from "./bundler/bundler";

export interface EntryPointBundlerOptions {
    sourcePath: string;
    destinationPath: string;
    production: boolean;
}

export class EntryPointBundler {
    private bundler: Bundler;

    public constructor(options: EntryPointBundlerOptions | EntryPointBundlerOptions[]) {
        if (!Array.isArray(options)) {
            options = [options];
        }

        this.bundler = new Bundler(options.map(opt => ({
            production: opt.production,
            format: "es",
            sourcePath: opt.sourcePath,
            destinationPath: opt.destinationPath,
        })));
    }

    public async bundle() {
        return await this.bundler.bundle();
    }

    public watch(): Observable<BundleResult> {
        return this.bundler.watch();
    }
}