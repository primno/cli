import { WarningHandler } from "rollup";
import { ResultBuilder } from "../../../task";
import { buildMessage } from "./message-builder";

export function onWarnWrapper(resultBuilder: ResultBuilder): WarningHandler {
    return (warning) => {
        const message = buildMessage(warning);
        resultBuilder.addWarning(message);
    };
}
