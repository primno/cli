import path from "path";
import { getDirName } from "./common";

export function getCacheDir(): string {
    return path.join(getDirName(), ".cache");
}