import chalk from "chalk";
import { getLocalBin, getLocalBinVersion, localBinExists } from "./utils/local-bin";
import { lt as semverLt } from "semver";
import { showPrimnoAsciiArt } from "./utils/display";

async function loadCli(): Promise<typeof import("./cli")> {
    if (localBinExists()) {
        const localBinVersion = getLocalBinVersion();

        if (semverLt(localBinVersion, "0.8.0")) {
            throw new Error("Local CLI version is too old. Please update it to 0.8.0 or later.");
        }

        return await getLocalBin();
    }
    else {
        return await import("./cli");
    }
}

async function bootstrap() {
    // Set process title
    try {
        process.title = `mn ${process.argv.slice(2).join(' ')}`;
    } catch (_) {
        process.title = 'mn';
    }

    showPrimnoAsciiArt();

    let cli: typeof import("./cli") | undefined;

    try {
        cli = await loadCli();

        if (!cli?.default) {
            throw new Error("Unable to start CLI.");
        }
    }
    catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
    }

    cli?.default({});
}

bootstrap();