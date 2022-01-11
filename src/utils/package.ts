import { isNullOrUndefined } from "./common";
import fs from "fs";
import path from "path";

let packageJson: any | undefined;

export function getPackageJson(dirPath: string = "."): any {
    if (isNullOrUndefined(packageJson)) {
        const fullPath = path.join(dirPath, "package.json");
        const content = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(content);
    }

    return packageJson;
}