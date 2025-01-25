import { existsSync, readFileSync } from "fs";
import { Plugin } from "vite";

export function battutaVirtualRoot(root?: string) {
    const defaultContent = defaultHTML(root ?? "/src/main.tsx");
    
    return {
        name: "battuta-virtual-root",
        enforce: "pre",
        load: (id) => {
            if(id !== "index.html") return;
            const content = existsSync("./index.html") ? readFileSync("./index.html", "utf-8") : defaultContent;
            return content;
        },
        resolveId: (source, importer, options) => {
            if(options.isEntry) return "index.html";
        },
        configureServer: (server) => {
            server.middlewares.use((req, res, next) => {
                if (req.url !== '/') return next();
                const content = existsSync("./index.html") ? readFileSync("./index.html", "utf-8") : defaultContent;
                res.setHeader('Content-Type', 'text/html')
                res.statusCode = 200;
                res.end(content)
            })
        },
        config: () => ({
            optimizeDeps: {
                entries: [ "index.html" ]
            } 
        })
    } as Plugin;
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