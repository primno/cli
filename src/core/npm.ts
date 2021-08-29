import { spawnSync } from "child_process";
import { isNullOrUndefined } from "../utils/common";

const npmCommandLine = "npm";

export interface Package {
    name: string;
    version?: string;
}

export interface NpmOption {
    dev: boolean;
}

export class Npm {
    constructor(private dirName: string) {

    }

    private spawn(...args: string[]) {
        const spawnResult = spawnSync(
            npmCommandLine,
            args,
            {
                cwd: this.dirName,
                shell: true,
            }
        );

        if (spawnResult.error) {
            throw new Error(spawnResult.error.message);
        }
        if (spawnResult.stderr.byteLength != 0) {
            const stderr = spawnResult.stderr.toString();
            const error = stderr.split("\n").filter(l => l.includes("ERR!")).join("\n");
            if (error.length > 0) {
                throw new Error(error);
            }
        }
    }

    public install(packages: string[], opt?: NpmOption) {
        if (opt?.dev) {
            this.spawn("install", ...packages, "--save-dev");
        }
        else {
            this.spawn("install", ...packages);
        }
    }

    public link(packageName: string) {
        this.spawn("link", packageName);
    }
}