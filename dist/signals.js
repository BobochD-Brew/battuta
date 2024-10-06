const s = [];
function f(t) {
  const n = /* @__PURE__ */ new Set();
  let e = t;
  return [() => {
    const o = s[s.length - 1];
    return o && n.add(o), e;
  }, (o) => {
    e = o, n.forEach((c) => c());
  }];
}
function r(t) {
  s.push(t), t(), s.pop();
}
function l(t, n = 250) {
  let e = !0, u;
  r(() => {
    e ? (e = !1, t()) : (clearTimeout(u), setTimeout(t, n));
  });
}
export {
  f as createSignal,
  l as useDebounced,
  r as useEffect
};
