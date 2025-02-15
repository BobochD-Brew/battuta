import { compile, transformJSX } from "@compiler";
import battutaMacros from 'unplugin-macros/vite'
import { Options } from "unplugin-macros";
import { battutaFolders } from "./build-folders";
import { Plugin } from "vite";
import { optimize } from "@optimizer";
import { battutaVirtualRoot } from "./virtual-root";

type Config = {
    macros?: Options,
    compiler?: {},
    folders?: {
        temp: string,
        move: string,
    },
    optimizer?: {
        strings?: boolean;
        functions?: boolean;
    },
    root?: string,
}

export {
    battutaMacros,
    battutaFolders,
    battutaVirtualRoot,
}

export function battutaConfig() {
    return {
        name: "battuta-config",
        config: (prev) => ({
            build: {
                modulePreload: {
                    polyfill: prev.build?.modulePreload ?? false,
                },
                build: {
                    minify: prev.build?.minify ?? 'terser',
                }
            },
            server: {
                host: prev.server?.host ?? "0.0.0.0",
                port: prev.server?.port ?? 5173,
            },
        })
    } as Plugin;
}

export function battutaCompiler(config?: Config["compiler"]) {
    return {
        name: "battuta-compiler",
        enforce: 'pre',
        transform(code: string, id: string) {
            if (!/\.[jt]sx$/.test(id)) return null;
            return compile(code, id);
        },
    } as Plugin;
}

export function battutaOptimizer(config?: Config["optimizer"]) {
    return {
        name: "battuta-optimizer",
        renderChunk: (chunk) => optimize(chunk, config)
    } as Plugin;
}

export default function battutaPlugin(config?: Config) {
    return [
        battutaConfig(),
        battutaVirtualRoot(config?.root),
        battutaMacros(config?.macros),
        battutaCompiler(config?.compiler),
        battutaFolders(config?.folders),
        battutaOptimizer(config?.optimizer)
    ] as Plugin[];
}