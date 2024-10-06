import { readFileSync, writeFileSync } from "fs";
import path from "path";

export const FileAction = {
    pattern: (name: string) => `${name} <file>`,
    wrap: (f: (arg: string) => string) => (file: string) => {
        try {
            const content = readFileSync(file, "utf-8");
            const compiledContent = f(content);
            const parsedPath = path.parse(file);
            const compiledFile = path.join(parsedPath.dir, `${parsedPath.name}.result${parsedPath.ext}`);
            writeFileSync(compiledFile, compiledContent);
        } catch (error) {
            console.error("An error occurred during the compilation process:", error);
        }
    },
}