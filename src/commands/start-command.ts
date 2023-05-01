import { Command } from "commander";
import { Workspace } from "../core/workspace";

interface Options {
    open: boolean;
}

async function startAction(options: Options) {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.start({ openInBrowser: options.open });
};

export const startCommand = new Command("start")
    .description("deploy primno in local development mode and run a web server that watches the entry points files")
    .option("--no-open", "do not open the browser", false)
    .action(startAction);