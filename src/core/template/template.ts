import fs from 'fs';
import Mustache from 'mustache';
import path from 'path';
import { WorkspaceConfig, Environment } from '../../config/workspace';
import { getSchemaDirName, getTemplateDirName } from '../../utils/dir';

enum EntryType {
    directory,
    template,
    file,
    config,
    environment
};

class Entry {
    public fullPath: string;
    public type: EntryType;

    public constructor(entry: string) {
        this.fullPath = entry;
        const stat = fs.lstatSync(entry);
        if (stat.isDirectory()) {
            this.type = EntryType.directory;
        }
        else if (entry.endsWith(".template")) {
            this.type = EntryType.template;
        }
        else if (path.basename(entry) === "primno.json") {
            this.type = EntryType.config;
        }
        else if (path.basename(entry) == "primno.env.json") {
            this.type = EntryType.environment;
        }
        else {
            this.type = EntryType.file;
        }
    }
}

export class Template {
    private dir: string;
    private entries: Entry[];

    public constructor(templateName: string) {
        this.dir = getTemplateDirName(templateName);
        this.entries = this.readDir(this.dir);
    }

    private readDir(dirPath: string): Entry[] {
        const entries = fs.readdirSync(dirPath);
        return entries.flatMap(e => {
            const fullPath = path.join(dirPath, e);
            const entry = new Entry(fullPath);
            if (entry.type == EntryType.directory) {
                return [entry, ...this.readDir(entry.fullPath)];
            }
            else {
                return entry;
            }
        });
    }

    public applyTo(destination: string, config: WorkspaceConfig, environments: Environment[]) {
        for (const entry of this.entries) {
            const relativePath = path.relative(this.dir, entry.fullPath);
            const destinationPath = path.join(destination, relativePath);

            console.log(`Create ${destinationPath}`);

            switch (entry.type) {
                case EntryType.directory:
                    fs.mkdirSync(destinationPath);
                    break;
                case EntryType.file:
                    fs.copyFileSync(entry.fullPath, destinationPath);
                    break;
                case EntryType.template:
                    const template = fs.readFileSync(entry.fullPath, { encoding: "utf-8" });
                    const transformResult = Mustache.render(template, config);
                    fs.writeFileSync(destinationPath.substring(0, destinationPath.lastIndexOf(".")), transformResult);
                    break;
                case EntryType.config:
                    const configWithSchema = { $schema: getSchemaDirName("primno.json"), ...config };
                    fs.writeFileSync(destinationPath, JSON.stringify(configWithSchema, null, 4));
                    break;
                case EntryType.environment:
                    fs.writeFileSync(destinationPath, JSON.stringify(environments, null, 4));
                    break;
                default: throw new Error("Unknown entry type");
            }
        }
    }
}
