#!/usr/bin/env node
import { Command as u } from "commander";
import { readFileSync as s, writeFileSync as i, existsSync as f, mkdirSync as g } from "fs";
import m from "path";
import { compile as b } from "./compiler.js";
import { optimize as y, optimizeStrings as S, optimizeFunctions as v } from "./optimizer.js";
import { createServer as w, build as x } from "vite";
import p from "./vite.js";
import { execSync as c } from "child_process";
import { t as C } from "./jsx-Bwrm210x.js";
const o = {
  pattern: (t) => `${t} <file>`,
  wrap: (t) => (r) => {
    try {
      const e = s(r, "utf-8"), d = t(e), a = m.parse(r), l = m.join(a.dir, `${a.name}.result${a.ext}`);
      i(l, d);
    } catch (e) {
      console.error("An error occurred during the compilation process:", e);
    }
  }
}, n = new u();
n.command("init").action(async () => {
  f("./.gitignore") || i("./.gitignore", `node_modules
dist`), c("npm init -y"), c("npm install"), c("npm link battuta"), g("./src"), i("./src/main.tsx", `import { render } from "battuta/runtime"

function App() {

    return <div>Hello, World!</div>
}

render(App, document.querySelector<HTMLDivElement>('#app')!)`), i("./tsconfig.json", `{
    "compilerOptions": {
        "module": "ESNext",
        "target": "ES2020",
        "moduleResolution": "bundler",
        "lib": [
            "ES2020",
            "DOM",
            "DOM.Iterable"
        ],
        "jsx": "preserve",
        "jsxImportSource": "battuta",
    },
    "include": ["./**/*.ts", "./**/*.tsx"],
    "exclude": [
        "node_modules/**/*"
    ]
}`);
  const e = JSON.parse(s("./package.json", "utf-8"));
  e.scripts = {
    dev: "battuta dev",
    build: "battuta bundle"
  }, i("./package.json", JSON.stringify(e, null, 4));
});
n.command("dev").action(async () => {
  const t = await w({ plugins: [p()] });
  await t.listen(), t.printUrls(), t.bindCLIShortcuts({ print: !0 });
});
n.command("bundle").option("-m, --minify <boolean>", "Minify the chunks", !0).action(async (t) => {
  await x({ plugins: [p()], build: { minify: t.minify } });
});
n.command(o.pattern("compile")).action(o.wrap((t) => b(t).code));
n.command(o.pattern("compile:jsx")).action(o.wrap((t) => C(t).code));
n.command(o.pattern("optimize")).action(o.wrap((t) => y(t).code));
n.command(o.pattern("optimize:strings")).action(o.wrap((t) => S(t).code));
n.command(o.pattern("optimize:functions")).action(o.wrap((t) => v(t).code));
n.name("battuta").description("CLI tool for battuta").version("0.0.0");
n.parse(process.argv);
