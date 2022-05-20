import { Bundler } from "./bundler";

export interface EntryPointBundlerOptions {
    sourcePath: string;
    destinationPath: string;
}

export class EntryPointBundler extends Bundler {
    public constructor(options: EntryPointBundlerOptions | EntryPointBundlerOptions[]) {
        if (!Array.isArray(options)) {
            options = [options];
        }

        super(options.map(opt => ({
            format: "es",
            sourcePath: opt.sourcePath,
            destinationPath: opt.destinationPath,
        })));
    }
}