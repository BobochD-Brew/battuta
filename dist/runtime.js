import { useEffect as p } from "./signals.js";
const g = Symbol("+"), j = Symbol("+"), C = Symbol("<"), O = Symbol("="), R = Symbol("m"), r = Symbol("l"), b = Symbol("d"), w = Symbol("c"), _ = Symbol("r"), d = Symbol("u"), A = Symbol("x"), v = Symbol("call"), a = Element.prototype;
a[g] = function(t) {
  return this.append(t), this;
};
a[w] = function() {
  return Array.from(this.children);
};
a[_] = function() {
  this.remove();
};
const s = Object.prototype;
s[R] = function(...t) {
  return Reflect.construct(this, t);
};
s[O] = function(t, n) {
  if (t.includes(":")) {
    const o = t.split(":");
    this[o[0]][o[1]] = n;
  } else
    this[t] = n;
  return this;
};
s[C] = function(t, n) {
  if (t.includes(":")) {
    const o = t.split(":");
    p((i) => this[o[0]][o[1]] = n());
  } else
    p((o) => this[t] = n());
  return this;
};
s[v] = function(t, n) {
  if (t.includes(":")) {
    const o = t.split(":");
    p((i) => this[o[0]][o[1]](...n()));
  } else
    p((o) => this[t](...n()));
  return this;
};
s[g] = function() {
  return this;
};
const l = [], c = [], y = [], S = () => l == null ? void 0 : l[l.length - 1], M = (t) => {
  const n = Symbol("context");
  return [() => S()[n], ({ children: h, ...m }) => () => (S()[n] = t(m), h)];
}, G = (t) => {
  var n, o;
  (o = (n = c == null ? void 0 : c[c.length - 1]) == null ? void 0 : n[b]) == null || o.call(n, t);
};
function f(t, n, o, i) {
  var h, m;
  for (let E = 0; E < n.length; E++) {
    const e = n[E];
    if (typeof e == "function") {
      l.push({ ...i || S() });
      const u = new Object();
      (h = o[b]) == null || h.call(o, () => u == null ? void 0 : u[d]()), c.push(u), y.push((...x) => f(t, x, u)), f(t, [e()], u), l.pop(), y.pop(), c.pop();
    } else if (Array.isArray(e))
      f(t, e, o, i);
    else {
      if (!e) continue;
      (m = o[b]) == null || m.call(o, () => e == null ? void 0 : e[d]()), e instanceof Object && (e[A] = i || S()), t[g](e);
    }
  }
}
s[j] = function(...t) {
  return f(this, t, this, this[A]), this;
};
s[b] = function(t) {
  return this[r] ?? (this[r] = []), this[r].push(t), this;
};
s[w] = function() {
  return [];
};
s[_] = function() {
};
s[d] = function() {
  var t;
  (t = this[r]) == null || t.forEach((n) => n()), delete this[r], this[_]();
};
function N() {
  return y[y.length - 1];
}
function P() {
  const t = c[c.length - 1];
  if (t)
    return () => t[d]();
}
const T = document.createElement.bind(document), V = document.createElementNS.bind(document, "http://www.w3.org/2000/svg"), q = (t, n) => n[j](t);
export {
  g as append,
  j as appendMultiple,
  C as assign,
  v as call,
  w as children,
  r as cleanupListeners,
  R as create,
  M as createContext,
  T as createElement,
  V as createSVGElement,
  S as currentContext,
  G as onCleanup,
  b as onRemove,
  _ as remove,
  q as render,
  O as set,
  d as unmount,
  N as useAppend,
  P as useRemove
};
