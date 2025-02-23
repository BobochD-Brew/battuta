#!/usr/bin/env node
import { Command } from 'commander';
import { compile, inferModes, transformJSX } from '@compiler';
import { optimize, optimizeFunctions, optimizeStrings } from '@optimizer';
import { build, createServer } from 'vite'
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from "path";
import battutaPlugins from './vite';

const program = new Command();
const FileAction = {
    pattern: (name: string) => `${name} <file>`,
    wrap: (f: (arg: string, path: string) => string) => (file: string) => {
        try {
            const p = path.resolve(file);
            const content = readFileSync(file, "utf-8");
            const compiledContent = f(content, p);
            const parsedPath = path.parse(file);
            const compiledFile = path.join(parsedPath.dir, `${parsedPath.name}.result${parsedPath.ext}`);
            writeFileSync(compiledFile, compiledContent);
        } catch (error) {
            console.error("An error occurred during the process:", error);
        }
    },
}

/**
 *          INIT 
 */

program
    .command('init')
    .action(async () => {
        if(!existsSync("./.gitignore")) writeFileSync("./.gitignore", "node_modules\ndist")
        execSync("npm init -y");
        execSync("npm install battuta --verbose");
        mkdirSync("./src");
        const defaultCode = `import { render } from "battuta/runtime"\n\nfunction App() {\n\n    return <div>Hello, World!</div>\n}\n\nrender(App, document.querySelector<HTMLDivElement>('#app')!)`;
        writeFileSync("./src/main.tsx", defaultCode)
        const defaultTsConfig = `{\n    "compilerOptions": {\n        "module": "ESNext",\n        "target": "ES2020",\n        "moduleResolution": "bundler",\n        "lib": [\n            "ES2020",\n            "DOM",\n            "DOM.Iterable"\n        ],\n        "jsx": "preserve",\n        "jsxImportSource": "battuta",\n    },\n    "include": ["./**/*.ts", "./**/*.tsx"],\n    "exclude": [\n        "node_modules/**/*"\n    ]\n}`
        writeFileSync("./tsconfig.json", defaultTsConfig)
        const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
        packageJson.scripts = {
            "dev": "battuta dev",
            "build": "battuta bundle",
        }
        writeFileSync("./package.json", JSON.stringify(packageJson, null, 4))
    });

/**
 *          DEV 
 */

program
    .command('dev')
    .action(async () => {
        const server = await createServer({ plugins: [ battutaPlugins() ] })
        await server.listen();
        server.printUrls()
        server.bindCLIShortcuts({ print: true })
    });

/**
 *          BUNDLE 
 */

program
    .command('bundle')
    .option('-m, --minify <boolean>', 'Minify the chunks', true)
    .action(async (options) => {
        await build({ plugins: [ battutaPlugins() ], build: { minify: options.minify } })
    });

/**
 *          COMPILE 
 */

program
    .command(FileAction.pattern('compile'))
    .action(FileAction.wrap((code, path) => compile(code, path)));

program
    .command(FileAction.pattern('compile:modes'))
    .action(FileAction.wrap((code, path) => inferModes(code, path)));

program
    .command(FileAction.pattern('compile:jsx'))
    .action(FileAction.wrap(code => transformJSX(code).code));

/**
 *          OPTIMIZE 
 */

program
    .command(FileAction.pattern('optimize'))
    .action(FileAction.wrap(code => optimize(code).code));

program
    .command(FileAction.pattern('optimize:strings'))
    .action(FileAction.wrap(code => optimizeStrings(code).code));

program
    .command(FileAction.pattern('optimize:functions'))
    .action(FileAction.wrap(code => optimizeFunctions(code).code));

/**
 *          /////////
 */

program
    .name('battuta')
    .description('CLI tool for battuta')
    .version('0.0.0');

program.parse(process.argv);
