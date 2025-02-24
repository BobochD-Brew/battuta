import { compile, inferModes, transformJSX } from "@compiler";
import battutaMacros from 'unplugin-macros/vite'
import { Options } from "unplugin-macros";
import { Plugin } from "vite";
import { optimize } from "@optimizer";
import { existsSync, readFileSync, lstatSync, mkdirSync, readdirSync, renameSync, rmdirSync } from "fs";
import path, { join, resolve } from "path";

export default function battutaPlugins(config?: {
    macros?: Parameters<typeof battutaMacros>[0],
    modes?: Parameters<typeof battutaInferModes>[0],
    jsx?: Parameters<typeof battutaJSX>[0],
    optimizer?: Parameters<typeof battutaOptimizer>[0],
    root?: Parameters<typeof battutaVirtualRoot>[0],
    folders?: Parameters<typeof battutaFolders>[0],
}): any {
    return [
        battutaConfig(),
        battutaVirtualRoot(config?.root),
        battutaInferModes(config?.modes),
        battutaJSX(config?.jsx),
        battutaMacros(config?.macros),
        battutaFolders(config?.folders),
        battutaOptimizer(config?.optimizer)
    ];
}

export const battutaConfig = plgn((config?: {}) => ({
    name: "battuta-config",
    config: (prev) => ({
        build: {
            modulePreload: { polyfill: false },
            build: { minify: prev.build?.minify ?? 'terser' }
        },
        server: {
            host: prev.server?.host ?? "0.0.0.0",
            port: prev.server?.port ?? 5173,
        },
    })
}));

export const battutaInferModes = plgn((config?: {}) => ({
    name: "battuta-infer-modes",
    enforce: 'pre',
    transform(code: string, id: string) {
        if (!/\.[jt]sx$/.test(id)) return null;
        return inferModes(code, id);
    },
}));

export const battutaJSX = plgn((config?: { dom?: string }) => ({
    name: "battuta-jsx",
    enforce: 'pre',
    transform(code: string, id: string) {
        if (!/\.[jt]sx$/.test(id)) return null;
        return transformJSX(code, config?.dom);
    },
}));

export const battutaOptimizer = plgn((config?: { strings?: boolean, functions?: boolean }) => ({
    name: "battuta-optimizer",
    renderChunk: (chunk) => optimize(chunk, config)
}));

export const battutaFolders = plgn((config?: { temp: string,  move: string }) => ({
    name: "battuta-build-folders",
    generateBundle(options, _bundle) {
        const tempDir = resolve(config?.temp ?? ".temp");
        const moveDir = resolve(config?.move ?? ".move");
        const distDir = join(options.dir!);
        if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
        if (existsSync(tempDir)) rmdirSync(tempDir, { recursive: true, force: true } as any);
        if (existsSync(moveDir)) {
            readdirSync(moveDir).forEach(file => {
                const moveFilePath = path.join(moveDir, file);
                if (lstatSync(moveFilePath).isFile()) renameSync(moveFilePath, path.join(distDir, file));
            });
            rmdirSync(moveDir, { recursive: true, force: true } as any);
        }
    },
}));

export const battutaVirtualRoot = (opts?: { pages: Record<string, string> }) => {
    const head = () => `<head>
        <meta charset="UTF-8"/><title>Website</title>
        <link rel="icon" type="image/svg+xml" href="/icon.svg"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"/>
    </head>`;
    const body = (root: string) => `<body><div id="app"></div><script type="module" src="${root}"></script></body>`
    const defaultHTML = (root: string) => `<!DOCTYPE html><html lang="en">${head()}${body(root)}</html>`.replace(/\s+/g, " ");
    const dev = (content: string) => content.replace("<head>", `<head><script type="module" src="/@vite/client"></script>`)
    const pages = Object.entries(opts?.pages || { "index": "/src/main.tsx" });
    const contents = Object.fromEntries(pages.map(([k, v]) => [`${k}.html`, defaultHTML(v)]));
    return {
        name: "battuta-virtual-root",
        enforce: "pre",
        load: (id) => {
            if(!contents[id]) return;
            const content = existsSync(`./${id}`) ? readFileSync(`./${id}`, "utf-8") : contents[id];
            return content;
        },
        resolveId: (source, importer, options) => {
            if(options.isEntry) return path.relative(path.resolve("./"), source);
        },
        configureServer: (server) => {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.slice(1)?.replace(".html", "");
                const id = url ? `${url}.html` : "index.html";
                if (!contents[id]) return next();
                const content = existsSync(`./${id}`) ? readFileSync(`./${id}`, "utf-8") : dev(contents[id]);
                res.setHeader('Content-Type', 'text/html')
                res.statusCode = 200;
                res.end(content)
            })
        },
        config: () => ({
            optimizeDeps: { entries: Object.keys(contents) } 
        })
    } as Plugin;
}

export { battutaMacros }

function plgn<T, P extends Plugin>(p: (opts?: T) => P) { return p as (opts?: T) => P }