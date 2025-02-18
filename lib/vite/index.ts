import { compile, inferModes, transformJSX } from "@compiler";
import battutaMacros from 'unplugin-macros/vite'
import { Options } from "unplugin-macros";
import { battutaFolders, FoldersConfig } from "./build-folders";
import { Plugin } from "vite";
import { optimize } from "@optimizer";
import { battutaVirtualRoot, RootConfig } from "./virtual-root";

type Config = {
    macros?: Options,
    modes?: ModesConfig,
    jsx?: JSXConfig,
    optimizer?: OptimizerConfig,
    root?: RootConfig,
    folders?: FoldersConfig,
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

type ModesConfig = {}
export function battutaInferModes(config?: ModesConfig) {
    return {
        name: "battuta-infer-modes",
        enforce: 'pre',
        transform(code: string, id: string) {
            if (!/\.[jt]sx$/.test(id)) return null;
            return inferModes(code, id);
        },
    } as Plugin;
}

type JSXConfig = {}
export function battutaJSX(config?: JSXConfig) {
    return {
        name: "battuta-jsx",
        enforce: 'pre',
        transform(code: string, id: string) {
            if (!/\.[jt]sx$/.test(id)) return null;
            return transformJSX(code);
        },
    } as Plugin;
}

type OptimizerConfig = {
    strings?: boolean;
    functions?: boolean;
}
export function battutaOptimizer(config?: OptimizerConfig) {
    return {
        name: "battuta-optimizer",
        renderChunk: (chunk) => optimize(chunk, config)
    } as Plugin;
}

export default function battutaPlugin(config?: Config) {
    return [
        battutaConfig(),
        battutaVirtualRoot(config?.root),
        battutaInferModes(config?.modes),
        battutaMacros(config?.macros),
        battutaJSX(config?.jsx),
        battutaFolders(config?.folders),
        battutaOptimizer(config?.optimizer)
    ] as Plugin[];
}