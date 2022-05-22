import { Bundler } from "./bundler";

export interface EntryPointBundlerOptions {
    sourcePath: string;
    destinationPath: string;
    production: boolean;
}

// TODO: Composition instead of inheritance
export class EntryPointBundler extends Bundler {
    public constructor(options: EntryPointBundlerOptions | EntryPointBundlerOptions[]) {
        if (!Array.isArray(options)) {
            options = [options];
        }

        super(options.map(opt => ({
            production: opt.production,
            format: "es",
            sourcePath: opt.sourcePath,
            destinationPath: opt.destinationPath,
        })));
    }
}