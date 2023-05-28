import fs from "fs";
import path from "path";
import { getLibDirName } from "./dir";
import chalk from "chalk";

export function showPrimnoAsciiArt() {
    const asciiArtPath = path.join(getLibDirName(), "primno-ascii-art.txt");
    const asciiArt = fs.readFileSync(asciiArtPath, "utf-8");
    console.log(chalk.rgb(238,167,74)(asciiArt));
}

export function showError(message: string) {
    console.error(chalk.red(message));
}