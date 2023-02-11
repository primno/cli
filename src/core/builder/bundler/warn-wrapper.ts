import path from "path";
import { WarningHandler } from "rollup";
import { ResultBuilder } from "../../../task/result-builder";

export function onWarnWrapper(resultBuilder: ResultBuilder): WarningHandler {
    return (warning) => {
        if (warning.loc?.file) {
            const filePath = path.relative(".", warning.loc.file);
            resultBuilder.addWarning(`${warning.message} at ${filePath} [${warning.loc.line}, ${warning.loc.column}]`);
        }
        else {
            resultBuilder.addWarning(`${warning.message}`);
        }
    };
}
