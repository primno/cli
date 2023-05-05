import { Logger, availableActions, engine } from "hygen";
import { getTemplateDirName } from '../../utils/dir';
import inquirer from "inquirer";
import { RunnerConfig } from "hygen/dist/types";

export class Template {
    public constructor(
        /** Template name, eg: project, component */
        private templateName: string,
        /** Destination directory, eg: src */
        private destinationDir: string) {

    }

    public getActions() {
        return availableActions(this.templateName);
    }

    /**
     * Run template action
     * @param actionName Action name, eg: new, update, delete
     * @param name Name of target. eg: project name, component name
     * @param locals Variables to pass to template
     */
    public async run(actionName: string, name: string, locals: Record<string, string>) {
        const config: RunnerConfig = {
            cwd: this.destinationDir,
            logger: new Logger(console.log.bind(console)),
            templates: getTemplateDirName(),
            createPrompter: () => inquirer as any,
            localsDefaults: locals,
            debug: true,
            exec: () => {
                throw new Error(`Exec is not authorized`);
            }
        };

        const args = [this.templateName, actionName, name];

        return await engine(args, config);
    }
}
