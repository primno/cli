import { InputOptions, OutputOptions, rollup, RollupWatchOptions, WarningHandlerWithDefault, watch } from "rollup";
import { Bundler, BundlerOptions } from "./bundler";
import { Observable } from "rxjs";
import { BundlerResultBuilder, onWarnWrapper } from "./bundler-result-builder";
import { BundleResult } from "./bundle-result";

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