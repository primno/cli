import { isNullOrUndefined } from "./common";
import fs from "fs";

let packageJson: any | undefined;

export function getPackageJson(): any {
    if (isNullOrUndefined(packageJson)) {
        const content = fs.readFileSync("package.json", "utf-8");
        return JSON.parse(content);
    }

    return packageJson;
}