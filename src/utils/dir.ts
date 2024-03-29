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
 * Gets the root directory name of the current process.
 * @returns 
 */
export function getRootDirName() {
    return path.join(getProcessDirName(), "..");
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

/**
 * Gets the schema directory name.
 * @param schemaName Schema name. If not specified, the root directory of the schemas is returned.
 * @returns Schema directory name.
 */
export function getSchemaDirName(schemaName?: string) {
    const primnoCliDir = path.posix.join(".", "node_modules", "@primno" , "cli", "lib");

    if (schemaName != null) {
        return path.posix.join(primnoCliDir, "schema", schemaName);
    }
    else {
        return path.posix.join(primnoCliDir, "schema");
    }
}