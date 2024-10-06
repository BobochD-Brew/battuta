import { t as f } from "./jsx-Bwrm210x.js";
import h from "unplugin-macros/vite";
import { default as I } from "unplugin-macros/vite";
import { existsSync as a, mkdirSync as m, rmdirSync as s, readdirSync as b, lstatSync as v, renameSync as x, readFileSync as o } from "fs";
import u, { resolve as d, join as c } from "path";
import { optimize as y } from "./optimizer.js";
const F = ".temp", S = ".move";
function D(t) {
  return {
    name: "battuta-build-folders",
    generateBundle(e, r) {
      P(e.dir), j(e.dir);
    }
  };
}
function P(t) {
  const e = d(F), r = c(t);
  a(r) || m(r, { recursive: !0 }), a(e) && s(e, { recursive: !0, force: !0 });
}
function j(t) {
  const e = d(S), r = c(t);
  a(r) || m(r, { recursive: !0 }), a(e) && (b(e).forEach((i) => {
    const n = u.join(e, i), p = u.join(r, i);
    v(n).isFile() && x(n, p);
  }), s(e, { recursive: !0, force: !0 }));
}
function z() {
  return {
    name: "battuta-virtual-root",
    enforce: "pre",
    load: (t) => t !== "index.html" ? void 0 : a("./index.html") ? o("./index.html") : l,
    resolveId: (t, e, r) => {
      if (r.isEntry) return "index.html";
    },
    configureServer: (t) => {
      t.middlewares.use((e, r, i) => {
        if (e.url !== "/") return i();
        const n = a("./index.html") ? o("./index.html") : l;
        r.setHeader("Content-Type", "text/html"), r.statusCode = 200, r.end(n);
      });
    },
    config: () => ({
      optimizeDeps: {
        entries: ["index.html"]
      }
    })
  };
}
const l = `
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
    <script type="module" src="/src/main.tsx"><\/script>
</body>

</html>
`;
function C() {
  return {
    name: "battuta-config",
    config: (t) => {
      var e, r, i, n;
      return {
        build: {
          modulePreload: {
            polyfill: ((e = t.build) == null ? void 0 : e.modulePreload) ?? !1
          },
          build: {
            minify: ((r = t.build) == null ? void 0 : r.minify) ?? "terser"
          }
        },
        server: {
          host: ((i = t.server) == null ? void 0 : i.host) ?? "0.0.0.0",
          port: ((n = t.server) == null ? void 0 : n.port) ?? 5173
        }
      };
    }
  };
}
function T(t) {
  return {
    name: "battuta-jsx",
    enforce: "pre",
    transform(e, r) {
      return /\.[jt]sx$/.test(r) ? f(e) : null;
    }
  };
}
function w(t) {
  return {
    name: "battuta-optimizer",
    renderChunk: (e) => y(e, t)
  };
}
function J(t) {
  return [
    C(),
    z(),
    h(t == null ? void 0 : t.macros),
    T(t == null ? void 0 : t.compiler),
    D(t == null ? void 0 : t.folders),
    w(t == null ? void 0 : t.optimizer)
  ];
}
export {
  C as battutaConfig,
  D as battutaFolders,
  T as battutaJSX,
  I as battutaMacros,
  w as battutaOptimizer,
  z as battutaVirtualRoot,
  J as default
};
