import { existsSync, readFileSync } from "fs";
import path from "path";
import { Plugin } from "vite";

export type RootConfig = { pages: Record<string, string> }
export function battutaVirtualRoot(opts?: RootConfig) {
    const pages = opts?.pages || { "index": "/src/main.tsx" };
    const htmlMapping = map(pages, (k, v) => [`${k}.html` as string, v]);
    const contents = map(htmlMapping, (k, v) => [k, defaultHTML(v)]);
    
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
                const content = existsSync(`./${id}`) ? readFileSync(`./${id}`, "utf-8") : contents[id];
                res.setHeader('Content-Type', 'text/html')
                res.statusCode = 200;
                res.end(content)
            })
        },
        config: () => ({
            optimizeDeps: {
                entries: Object.keys(htmlMapping),
            } 
        })
    } as Plugin;
}

type Key = string | symbol | number;
function map<T extends Key, P, R extends Key, G>(obj: Record<T, P>, f: (key: T, value: P) => [R, G]): Record<R, G> {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => f(k as T, v as P))) as any;
}

const defaultHTML = (root: string) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <title>Battuta Example</title>
</head>

<body>
    <div id="app"></div>
    <script type="module" src="${root}"></script>
</body>

</html>
`