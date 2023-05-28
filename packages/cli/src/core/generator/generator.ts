import { getTemplateDirName } from '../../utils/dir';
import inquirer from "inquirer";
import nodePlop from "node-plop";
import path from 'path';
import ora from 'ora';

const progressSpinner = ora();

export class Generator {
    public constructor(
        /** Template name, eg: project, component */
        private templateName: string,
        /** Destination directory, eg: src */
        private destinationDir: string) {

    }

    public getActions() {
        // return availableActions(this.templateName);
    }

    /**
     * Run template action
     * @param actionName Action name, eg: new, update, delete
     * @param name Name of target. eg: project name, component name
     * @param variables Variables to pass to the generator
     */
    public async run(actionName: string, variables: Record<string, string>) {
        const plopFile = path.join(getTemplateDirName(this.templateName), "plopfile.js");
        const plop = await nodePlop(
            plopFile,
            {
                destBasePath: this.destinationDir,
                force: false
            }
        );
        const generator = plop.getGenerator(actionName);

        let answers = [];
        
        if (generator.prompts != null) {
            answers = await generator.runPrompts();
        }
        
        const result = await generator.runActions(
            { ...variables, ...answers },
            {
                onComment: (msg) => {
                    progressSpinner.info(msg);
                    progressSpinner.start();
                },
                onSuccess: (change) => {
                    progressSpinner.succeed(` ${change.type} ${change.path}`);
                    progressSpinner.start();
                },
                onFailure: (fail) => {
                    const line = [fail.type, fail.path, fail.error || fail.message]
                        .filter(f => f != null)
                        .join(" ");
                    
                    progressSpinner.fail(` ${line}`);
                    progressSpinner.start();
                }
            }
        );

        progressSpinner.stop();

        if (result.failures.length > 0) {
            throw new Error("Failed to run template action");
        }
    }
}
