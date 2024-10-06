import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'
import packageJson from "./package.json"
import tsConfig from "./tsconfig.json"
import { writeFileSync } from 'fs'
import { battutaJSX } from "./node_modules/battuta/dist/vite"

const dist = "dist";

const entries = {
    // battuta: './lib/main.ts',
    macros: './lib/macros/index.ts',
    vite: './lib/vite/index.ts',
    compiler: './lib/compiler/index.ts',
    optimizer: './lib/optimizer/index.ts',
    runtime: './lib/runtime/index.ts',
    three: './lib/three/index.tsx',
    signals: './lib/signals/index.ts',
    tweak: './lib/tweak/index.ts',
    ["signals/screen"]: './lib/signals/screen.ts',
    ["jsx-runtime"]: './lib/runtime/jsx-types.ts',
    ["jsx-dev-runtime"]: './lib/runtime/jsx-types.ts',
}

const isMain = (name: string) => name === "battuta";
const ignore = (name: string) => ["jsx-dev-runtime", "jsx-runtime"].includes(name) || name.includes("/");

packageJson.exports = Object.entries(entries).reduce((acc, [k, v]) => {
    const path = isMain(k) ? "." : `./${k}`;
    acc[path] = `./${dist}/${k}.js`;
    return acc;
}, {}) as any;

packageJson.typesVersions = {
    "*": Object.entries(entries).reduce((acc, [k, v]) => {
        acc[isMain(k) ? "." : k] = [`${dist}/${k}.d.ts`];
        return acc;
    }, {})
} as any;

writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));

const aliases = Object.entries(entries).reduce((acc, [k, v]) => {
    if(ignore(k)) return acc;
    // acc[`@${k}/*`] = [v.split("/").slice(0, -1).join('/')+"/"];
    acc[`@${k}`] = [v];
    return acc;
}, {}) as any;

tsConfig.compilerOptions.paths = aliases;

writeFileSync('./tsconfig.json', JSON.stringify(tsConfig, null, 4));

export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true,
            tsconfigPath: "./tsconfig.json",
            insertTypesEntry: true,
            beforeWriteFile(filePath, content) {
                if(filePath.includes("jsx-runtime") || filePath.includes("jsx-dev-runtime")) return {
                    content: `import { TreeNode } from "./runtime";\n${content}`,
                    filePath
                };
                if(filePath.includes("runtime")) return { content, filePath };
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
    resolve: {
        alias: Object.entries(aliases).reduce((acc, [k,v]: any) => (acc[k] = resolve(__dirname, v[0]), acc),{}),
    },
    build: {
        lib: {
            entry: Object.entries({
                ...entries,
                "cli": "./cli/index.ts"
            }).reduce((acc, [k,v]) => (acc[k] = resolve(__dirname, v), acc),{}),
            formats: ['es']
        },
        rollupOptions: {
            output: {
                exports: 'named',
            },
        }
    }
})