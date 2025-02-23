import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'
import packageJson from "./package.json"
import tsConfig from "./tsconfig.json"
import { readdirSync, writeFileSync } from 'fs'
import { battutaJSX } from "./node_modules/battuta/dist/vite"

/**
 *          MODULES 
 */

const entries = {
    "compiler": './lib/compiler/index.ts',
    "optimizer": './lib/optimizer/index.ts',
    "runtime": './lib/runtime/index.ts',
    "signals": './lib/signals/index.ts',
    "contexts": './lib/contexts/index.ts',
    "jsx-runtime": './lib/runtime/jsx-types.ts',
    "jsx-dev-runtime": './lib/runtime/jsx-types.ts',
    "macros": './lib/macros/index.ts',
    "vite": './lib/utils/vite.ts',
    "dom": './lib/utils/dom.tsx',
    "cli": './lib/utils/cli.ts',
}

readdirSync("./lib/utils").forEach(file => {
    if(!/\.tsx?$/.test(file)) return;
    if(file.startsWith("_")) return;
    const path = `./lib/utils/${file}`;
    if(Object.values(entries).includes(path)) return;
    const name = file.split(".")[0];
    entries[`utils/${name}`] ??= path;
})

readdirSync("./lib/macros").forEach(file => {
    if(!/\.macro\.ts$/.test(file)) return;
    if(file.startsWith("_")) return;
    const path = `./lib/macros/${file}`;
    if(Object.values(entries).includes(path)) return;
    const name = file.split(".")[0];
    entries[`macros/${name}.macro`] ??= path;
})

/**
 *          REWRITE PACKAGE.JSON 
 */

const dist = "dist";
const outNames = { "jsx-dev-runtime": "jsx-runtime" }
const outName = (name: string) => (outNames[name] || name).split("/").join(".");
packageJson.exports = Object.entries(entries).reduce((acc, [k, v]) => {
    const path = `./${k}`;
    acc[path] = `./${dist}/${outName(k)}.js`;
    return acc;
}, {}) as any;
packageJson.typesVersions = {
    "*": Object.entries(entries).reduce((acc, [k, v]) => {
        acc[k] = [`${dist}/${outName(k)}.d.ts`];
        return acc;
    }, {})
} as any;
writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));

/**
 *          REWRITE TSCONFIG.JSON 
 */

const ignoreAliase = (name: string) => ["jsx-dev-runtime", "jsx-runtime", "cli"].includes(name) || name.includes("/");
const aliases = Object.entries(entries).reduce((acc, [k, v]) => {
    if(ignoreAliase(k)) return acc;
    acc[`@${k}`] = [v];
    return acc;
}, {}) as any;
tsConfig.compilerOptions.paths = aliases;
writeFileSync('./tsconfig.json', JSON.stringify(tsConfig, null, 4));

/**
 *          BUILD OPTIONS
 */

export default defineConfig(({ mode }) => ({
    plugins: [
        mode == "quick" ? null : dts({
            rollupTypes: true,
            tsconfigPath: "./tsconfig.json",
            entryRoot: "lib",
            beforeWriteFile(filePath, content) {
                if(filePath.endsWith(`${dist}/runtime.d.ts`)) return { content, filePath };
                content = content.replace(/\bdeclare\s+global\s*{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*}/gs, "");
                return { content, filePath };
            },
            compilerOptions: {
                lib: ['es2020', 'dom']
            }
        }),
        externalizeDeps(),
        battutaJSX(),
    ],
    define: {
        'process.env.HOST_DEV': 'import.meta.env.DEV'
    },
    resolve: {
        alias: Object.entries(aliases).reduce((acc, [k,v]: any) => (acc[k] = resolve(__dirname, v[0]), acc),{}),
    },
    build: {
        lib: {
            entry: Object
                .entries(entries)
                .reverse()
                .reduce((acc, [k,v]) => (acc[outName(k)] = resolve(__dirname, v), acc),{}),
            formats: ['es']
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        }
    }
}))