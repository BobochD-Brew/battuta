import { existsSync, lstatSync, mkdirSync, readdirSync, renameSync, rmdirSync } from "fs";
import path, { join, resolve } from "path";
import { Plugin } from "vite";

export function battutaFolders(config?: any) {
    return {
        name: "battuta-build-folders",
        generateBundle(options, _bundle) {
            handleTempFolder(options.dir!, config?.temp ?? ".temp");
            handleMoveFolder(options.dir!, config?.move ?? ".move");
        },
    } as Plugin;
}

function handleTempFolder(dist: string, tempFolder: string) {
    const tempDir = resolve(tempFolder);
    const distDir = join(dist);
    if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
    if (existsSync(tempDir)) rmdirSync(tempDir, { recursive: true, force: true } as any);
}

function handleMoveFolder(dist: string, moveFolder: string) {
    const moveDir = resolve(moveFolder);
    const distDir = join(dist);
    if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
    if (existsSync(moveDir)) {
        readdirSync(moveDir).forEach(file => {
            const moveFilePath = path.join(moveDir, file);
            const distFilePath = path.join(distDir, file);
            if (lstatSync(moveFilePath).isFile()) renameSync(moveFilePath, distFilePath);
        });
        rmdirSync(moveDir, { recursive: true, force: true } as any);
    }
}