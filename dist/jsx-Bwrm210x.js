import N from "@babel/parser";
import T from "@babel/generator";
import j from "@babel/traverse";
import * as e from "@babel/types";
const A = {
  filter: !0,
  defs: !0,
  altGlyph: !0,
  altGlyphDef: !0,
  altGlyphItem: !0,
  animate: !0,
  animateColor: !0,
  animateMotion: !0,
  animateTransform: !0,
  animation: !0,
  circle: !0,
  clipPath: !0,
  "color-profile": !0,
  cursor: !0,
  desc: !0,
  discard: !0,
  ellipse: !0,
  feBlend: !0,
  feColorMatrix: !0,
  feComponentTransfer: !0,
  feComposite: !0,
  feConvolveMatrix: !0,
  feDiffuseLighting: !0,
  feDisplacementMap: !0,
  feDistantLight: !0,
  feDropShadow: !0,
  feFlood: !0,
  feFuncA: !0,
  feFuncB: !0,
  feFuncG: !0,
  feFuncR: !0,
  feGaussianBlur: !0,
  feImage: !0,
  feMerge: !0,
  feMergeNode: !0,
  feMorphology: !0,
  feOffset: !0,
  fePointLight: !0,
  feSpecularLighting: !0,
  feSpotLight: !0,
  feTile: !0,
  feTurbulence: !0,
  font: !0,
  "font-face": !0,
  "font-face-format": !0,
  "font-face-name": !0,
  "font-face-src": !0,
  "font-face-uri": !0,
  foreignObject: !0,
  g: !0,
  glyph: !0,
  glyphRef: !0,
  handler: !0,
  hkern: !0,
  image: !0,
  line: !0,
  linearGradient: !0,
  listener: !0,
  marker: !0,
  mask: !0,
  metadata: !0,
  "missing-glyph": !0,
  mpath: !0,
  path: !0,
  pattern: !0,
  polygon: !0,
  polyline: !0,
  prefetch: !0,
  radialGradient: !0,
  rect: !0,
  set: !0,
  solidColor: !0,
  stop: !0,
  switch: !0,
  symbol: !0,
  tbreak: !0,
  text: !0,
  textArea: !0,
  textPath: !0,
  tref: !0,
  tspan: !0,
  unknown: !0,
  use: !0,
  view: !0,
  vkern: !0
}, B = {
  ...A,
  a: !0,
  abbr: !0,
  address: !0,
  area: !0,
  article: !0,
  aside: !0,
  audio: !0,
  b: !0,
  base: !0,
  bdi: !0,
  bdo: !0,
  blockquote: !0,
  body: !0,
  br: !0,
  button: !0,
  canvas: !0,
  caption: !0,
  cite: !0,
  code: !0,
  col: !0,
  colgroup: !0,
  data: !0,
  datalist: !0,
  dd: !0,
  del: !0,
  details: !0,
  dfn: !0,
  dialog: !0,
  div: !0,
  dl: !0,
  dt: !0,
  em: !0,
  embed: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  head: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  html: !0,
  i: !0,
  iframe: !0,
  img: !0,
  input: !0,
  ins: !0,
  kbd: !0,
  label: !0,
  legend: !0,
  li: !0,
  link: !0,
  main: !0,
  map: !0,
  mark: !0,
  math: !0,
  menu: !0,
  menuitem: !0,
  meta: !0,
  meter: !0,
  nav: !0,
  noscript: !0,
  object: !0,
  ol: !0,
  optgroup: !0,
  option: !0,
  output: !0,
  p: !0,
  param: !0,
  picture: !0,
  pre: !0,
  progress: !0,
  q: !0,
  rb: !0,
  rp: !0,
  rt: !0,
  rtc: !0,
  ruby: !0,
  s: !0,
  samp: !0,
  script: !0,
  search: !0,
  section: !0,
  select: !0,
  slot: !0,
  small: !0,
  source: !0,
  span: !0,
  strong: !0,
  style: !0,
  sub: !0,
  summary: !0,
  sup: !0,
  svg: !0,
  table: !0,
  tbody: !0,
  td: !0,
  template: !0,
  textarea: !0,
  tfoot: !0,
  th: !0,
  thead: !0,
  time: !0,
  title: !0,
  tr: !0,
  track: !0,
  u: !0,
  ul: !0,
  var: !0,
  video: !0,
  wbr: !0
}, M = j.default, D = T.default, _ = "battuta/runtime";
function z(t) {
  const r = N.parse(t, {
    sourceType: "module",
    plugins: ["jsx", "typescript"]
  });
  return M(r, {
    JSXElement: (i) => {
      i.replaceWith(y(i.node, "$d") || e.nullLiteral());
    }
  }), p(r, "createElement"), p(r, "createSVGElement"), p(r, "create"), p(r, "assign"), p(r, "set"), p(r, "call"), p(r, "appendMultiple"), p(r, "onRemove"), D(r, {}, t);
}
function y(t, r) {
  var x, S, J, X;
  const i = t.openingElement;
  let u = "";
  switch (i.name.type) {
    case "JSXIdentifier":
      u = i.name.name;
      break;
    case "JSXNamespacedName":
      u = i.name.name.name;
      break;
    case "JSXMemberExpression":
      u = i.name.object.name + "." + i.name.property.name;
      break;
  }
  const s = v[u];
  s && (r = u);
  const m = (S = (x = i.attributes.find((n) => n.type === "JSXAttribute" && n.name.type == "JSXIdentifier" && v[n.name.name])) == null ? void 0 : x.name) == null ? void 0 : S.name;
  m && (r = m);
  const k = B[u], F = A[u], f = i.attributes.map((n) => P(n, r)).filter(Boolean), E = r == "$c" && ((J = f.find(({
    key: n
  }) => n.type == "StringLiteral" && n.value == "$c")) == null ? void 0 : J.value), l = t.children.map((n) => $(n, r)).filter(Boolean);
  switch (!0) {
    case s:
      return ((n) => {
        switch (l.length) {
          case 0:
            return null;
          case 1:
            return l[0];
          default:
            return e.arrayExpression(l);
        }
      })();
    case u === "array":
      return e.arrayExpression(l);
    case u === "switch":
      return e.callExpression(e.arrowFunctionExpression([e.identifier("_")], e.blockStatement([e.switchStatement((X = f.find((n) => n.key.value == "on")) == null ? void 0 : X.value, t.children.filter((n) => n.type == "JSXElement").filter((n) => n.openingElement.name.type == "JSXIdentifier").filter((n) => n.openingElement.name.name == "case").map((n) => {
        var L, C;
        const d = n.openingElement.attributes.filter((a) => a.type == "JSXAttribute").filter((a) => a.name.type == "JSXIdentifier").find((a) => a.name.name == "default"), c = (L = n.openingElement.attributes.filter((a) => a.type == "JSXAttribute").filter((a) => a.name.type == "JSXIdentifier").find((a) => a.name.name == "is")) == null ? void 0 : L.value, o = (C = n.openingElement.attributes.filter((a) => a.type == "JSXAttribute").filter((a) => a.name.type == "JSXIdentifier").find((a) => a.name.name == "so")) == null ? void 0 : C.value, G = (c == null ? void 0 : c.type) == "StringLiteral" ? c : (c == null ? void 0 : c.type) == "JSXExpressionContainer" ? c.expression : e.identifier("NaN"), g = n.children.map((a) => $(a, r)).filter(Boolean);
        let w = (o == null ? void 0 : o.type) == "StringLiteral" ? o : (o == null ? void 0 : o.type) == "JSXExpressionContainer" ? o.expression.type == "JSXEmptyExpression" ? null : o.expression : (o == null ? void 0 : o.type) == "JSXElement" ? y(o, r) : null;
        return w || (w = g.length == 1 ? g[0] : g.length == 0 ? e.nullLiteral() : e.arrayExpression(g)), e.switchCase(d ? null : G, [e.returnStatement(w)]);
      }))])), []);
    case k:
      return I(l, h(f, e.callExpression(e.identifier(F ? "createSVGElement" : "createElement"), [e.stringLiteral(u)])));
    case r === "$c":
      return I(l, h(f, e.callExpression(e.memberExpression(e.identifier(u), e.identifier("create"), !0), E && E.type == "ArrayExpression" ? E.elements.map((n) => n || e.nullLiteral()) : [])));
    case r === "$n":
      return h(f, e.callExpression(e.memberExpression(e.identifier(u), e.identifier("create"), !0), l));
    case r === "$f":
      return h(f, e.callExpression(e.identifier(u), l));
    default:
      return e.callExpression(e.identifier(u), [e.objectExpression([...f.map(({
        key: n,
        value: d
      }) => ["StringLiteral", "BooleanLiteral"].includes(d.type) ? e.objectProperty(n, d) : e.objectMethod("get", e.identifier(n.value), [], e.blockStatement([e.returnStatement(d)]))), e.objectProperty(e.stringLiteral("children"), e.arrowFunctionExpression([e.identifier("_")], e.arrayExpression(l)))])]);
  }
}
function h(t, r) {
  return t.reduce((i, {
    key: u,
    value: s
  }) => {
    switch (!0) {
      case (u.type == "StringLiteral" && u.value == "$"):
        return i;
      case ["StringLiteral", "BooleanLiteral"].includes(s.type):
        return e.callExpression(e.memberExpression(i, e.identifier("set"), !0), [b(u), s]);
      case (s.type == "CallExpression" && s.callee.type == "Identifier" && s.callee.name == "$call"):
        return e.callExpression(e.memberExpression(i, e.identifier("call"), !0), [b(u), e.arrowFunctionExpression([e.identifier("_")], e.arrayExpression(s.arguments))]);
      default:
        return e.callExpression(e.memberExpression(i, e.identifier("assign"), !0), [b(u), e.arrowFunctionExpression([e.identifier("_")], s)]);
    }
  }, r);
}
function I(t, r) {
  return e.callExpression(e.memberExpression(r, e.identifier("appendMultiple"), !0), t);
}
function $(t, r) {
  var i, u;
  switch (t.type) {
    case "JSXElement":
      return y(t, r);
    case "JSXText": {
      const s = (u = (i = t.value) == null ? void 0 : i.trim) == null ? void 0 : u.call(i);
      return s ? e.stringLiteral(s) : void 0;
    }
    case "JSXExpressionContainer":
      switch (t.expression.type) {
        case "JSXEmptyExpression":
          return;
        default:
          return ["$f", "$n"].includes(r) ? t.expression : e.arrowFunctionExpression([e.identifier("_")], t.expression);
      }
    case "JSXFragment":
      return;
    case "JSXSpreadChild":
      return;
    default:
      return;
  }
}
function P(t, r) {
  switch (t.type) {
    case "JSXAttribute": {
      const i = O(t.value, r);
      return i ? {
        key: q(t.name),
        value: i
      } : void 0;
    }
    case "JSXSpreadAttribute":
      return;
    default:
      return;
  }
}
function q(t) {
  switch (t == null ? void 0 : t.type) {
    case "JSXIdentifier":
      return e.stringLiteral(t.name);
    case "JSXNamespacedName":
      return e.stringLiteral(t.namespace.name + ":" + t.name.name);
  }
}
function O(t, r) {
  switch (t == null ? void 0 : t.type) {
    case "JSXElement":
      return y(t, r);
    case "JSXExpressionContainer":
      switch (t.expression.type) {
        case "JSXEmptyExpression":
          return;
        default:
          return t.expression;
      }
    case "StringLiteral":
      return t;
    case "JSXFragment":
      return;
    case void 0:
      return e.booleanLiteral(!0);
  }
}
function b(t) {
  const r = t.value;
  return r.includes(":") ? e.binaryExpression("+", e.stringLiteral(r.split(":")[0]), e.binaryExpression("+", e.stringLiteral(":"), e.stringLiteral(r.split(":").slice(1).join(":")))) : t;
}
function p(t, r) {
  let i = !1;
  M(t, {
    ImportDeclaration(u) {
      const {
        node: s
      } = u;
      s.specifiers.some(
        // @ts-ignore
        (m) => e.isImportSpecifier(m) && m.imported.name === r
      ) && (i = !0);
    }
  }), i || t.program.body.unshift(e.importDeclaration([e.importSpecifier(e.identifier(r), e.identifier(r))], e.stringLiteral(_)));
}
const v = {
  $d: !0,
  $c: !0,
  $f: !0,
  $n: !0
};
export {
  z as t
};
