import path from "path";
import { fileURLToPath } from 'url';

/**
 * Gets the directory name of the current process.
 * @returns Directory name
 */
export function getProcessDirName() {
    return path.dirname(fileURLToPath(import.meta.url));
}

/**
 * Gets the lib directory name.
 * @returns Lib directory name
 */
export function getLibDirName() {
    return path.join(getProcessDirName(), "..", "lib");
}

/**
 * Gets the template directory name.
 * @param templateName Template name. If not specified, the root directory of the templates is returned.
 * @returns Template directory name
 */
export function getTemplateDirName(templateName?: string) {
    if (templateName != null) {
        return path.join(getLibDirName(), "template", templateName);
    }
    else {
        return path.join(getLibDirName(), "template");
    }
}