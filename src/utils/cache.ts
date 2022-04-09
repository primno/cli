import path from "path";

export function getCacheDir(): string {
    return path.join(__dirname, ".cache");
}