import c from "fs";
import u from "path";
import p from "postcss";
const l = { BASE_URL: "/", DEV: !1, MODE: "production", PROD: !0, SSR: !1 };
function h(a, ...g) {
  const m = this, t = {}, o = p.parse(a);
  o.walkRules((e) => {
    e.selectors = e.selectors.map((r) => r.replace(/\.[\w-]+/g, (n) => {
      const s = n.slice(1);
      return t[s] ?? (t[s] = d()), "." + t[s];
    }));
  });
  const i = o.toString();
  if (l) {
    const e = ".temp", r = `${f()}.css`, n = u.join(process.cwd(), e, r);
    return c.mkdirSync(u.dirname(n), { recursive: !0 }), c.writeFileSync(n, i, "utf8"), m.magicString.prepend(`import '/${e}/${r}';
`), new String(`(${JSON.stringify(t)})`);
  } else
    return new String(`
            (() => {
                const style = document.createElement("style");
                style.innerHTML = ${JSON.stringify(i)};
                document.head.appendChild(style);
                return ${JSON.stringify(t)};
            })();
        `);
}
function d() {
  return "cls-" + Math.random().toString(36).substr(2, 8);
}
function f() {
  return "style-" + Math.random().toString(36).substr(2, 8);
}
export {
  h as css
};
