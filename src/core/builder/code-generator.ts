import { Configuration as PrimnoConfig } from "@primno/core";
import path from "path";

export enum CodeGeneratorMode {
    /**
     * Only build primno.
     * The entry point will import the entry point from the local file.
     */
    primnoImportLocal,
    /**
     * Build the entry point with primno embedded.
     */
    primnoEmbedded,
    /**
     * Build the entry point without primno.
     */
    moduleOnly,
}

export interface GenerateCodeOptions {
    mode: CodeGeneratorMode;
    config: PrimnoConfig;
    sourcePath: string;
}

export function generateCode(options: GenerateCodeOptions): string {
    const modulePosixPath = path.resolve(".", options.sourcePath).split(path.sep).join(path.posix.sep);

    switch (options.mode) {
        case CodeGeneratorMode.primnoImportLocal:
            return `import * as primno from "@primno/core/dist/primno-d365.esm.js";
                    export default primno;
                    primno.initialize({
                        config: ${JSON.stringify(options.config)}
                    });`;
        case CodeGeneratorMode.primnoEmbedded:
            return `import * as primno from "@primno/core/dist/primno-d365.esm.js";
                    export default primno;
                    import * as esm from "${modulePosixPath}";
                    primno.initialize({
                        config: ${JSON.stringify(options.config)},
                        esm
                    });`;
        case CodeGeneratorMode.moduleOnly:
            return `export * from "${modulePosixPath}";`;
        default:
            throw new Error("Unknown mode");
    }
}