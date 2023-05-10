import { spawnSync } from "child_process";

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

    private async spawn(...args: string[]) {
        const spawnResult = await spawnSync(
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

    public async install(packages: string[], opt?: NpmOption) {
        if (opt?.dev) {
            await this.spawn("install", ...packages, "--save-dev");
        }
        else {
            await this.spawn("install", ...packages);
        }
    }

    public async link(packageName: string) {
        await this.spawn("link", packageName);
    }
}