import path from "path";
import { RollupError, RollupWarning } from "rollup";

export function buildMessage(source: RollupWarning | RollupError): string {
    if (source.loc?.file) {
        const filePath = path.relative(".", source.loc.file);
        return `${source.message} from "${filePath}":${source.loc.line}:${source.loc.column}`;
    }
    else {
        return `${source.message}`;
    }
}