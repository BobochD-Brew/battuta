import { onCleanup as l } from "./runtime.js";
import { useDebounced as m, useEffect as w, createSignal as u } from "./signals.js";
import { Pane as b } from "tweakpane";
const f = Symbol("folder"), a = new b({ title: "Tweaks" });
let d = null, h = 0, F = 0, S = 0;
function C(...e) {
  const i = e.pop(), t = a.addFolder({ title: e.pop() ?? `Tweak Pane ${++h}` });
  return l(() => t.dispose()), g(t, i);
}
function T(e, i) {
  const [t, o] = u(e), n = i ?? `signal ${++F}`, r = { [n]: e };
  d || (d = a.addFolder({ title: "Signals" }));
  const s = d.addBinding(r, n);
  return s.on("change", ({ value: c }) => o(c)), l(() => s.dispose()), m(() => {
    r[n] = t(), s.refresh();
  }), [t, o];
}
function P(e, { name: i, ...t } = {}) {
  const o = i ?? `monitor ${++S}`, n = {};
  w(() => n[o] = e()), d || (d = a.addFolder({ title: "Signals" }));
  const r = d.addBinding(n, o, {
    // @ts-ignore
    readonly: !0,
    view: "graph",
    multiline: !0,
    rows: 4,
    min: -1,
    ...t
  });
  l(() => r.dispose());
}
function $(e) {
  return e[f] = !0, e;
}
function g(e, i) {
  const t = {};
  return Object.entries(i).forEach(([o, n]) => {
    if (n != null && n[f]) {
      const r = e.addFolder({ title: o });
      t[o] = g(r, n);
    } else {
      const [r, s] = u(n);
      e.addBinding(i, o).on("change", ({ value: p }) => s(p)), t[o] = r;
    }
  }), t;
}
export {
  $ as Folder,
  C as createTweak,
  T as createTweakSignal,
  P as useMonitor
};
