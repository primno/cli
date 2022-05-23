import { Command } from "commander";
import { Workspace } from "../core/workspace";

async function startAction() {
    if (!Workspace.isWorkspace(".")) {
        console.error("This action must be run in a primno project directory");
        return;
    }

    const currentWs = new Workspace(".");
    await currentWs.start({});
};

export const startCommand = new Command("start")
    .description("deploy primno in local development mode and run a web server that watches the entry points files")
    .action(startAction);