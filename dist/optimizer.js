import { parse as S } from "@babel/parser";
import L from "@babel/generator";
import M from "@babel/traverse";
import * as n from "@babel/types";
const O = M.default, x = L.default;
function W(c) {
  const a = S(c, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  }), o = [];
  function d(e) {
    var g, P, b, k;
    const i = (g = e.parentPath) == null ? void 0 : g.node;
    if (!n.isFunction(i)) return;
    const r = e.scope, t = [];
    e.parentPath.traverse({
      ReferencedIdentifier(s) {
        t.push(s.node.name);
      },
      BindingIdentifier(s) {
        t.push(s.node.name);
      },
      ThisExpression() {
        t.push("this");
      },
      Super() {
        t.push("super");
      }
    }), t.every((s) => y.hasOwnBinding(s) || r.hasOwnBinding(s));
    let u = e.parentPath;
    function v() {
      const s = u == null ? void 0 : u.parentPath, w = u;
      if (w != s)
        return !(!s || t.some((l) => {
          var B;
          return ((B = w == null ? void 0 : w.scope) == null ? void 0 : B.hasOwnBinding(l)) && !r.hasOwnBinding(l);
        }) || !t.every((l) => s.scope.hasBinding(l) || r.hasOwnBinding(l) || F[l]));
    }
    for (; v(); )
      u = u.parentPath;
    if (u == e.parentPath || !u) return;
    const f = u.isBlockStatement() || u.isProgram() ? u : u.findParent((s) => s.isBlockStatement() || s.isProgram()), p = (P = e.parentPath) != null && P.isBlockStatement() || (b = e.parentPath) != null && b.isProgram() ? e.parentPath : (k = e.parentPath) == null ? void 0 : k.findParent((s) => s.isBlockStatement() || s.isProgram());
    (f == null ? void 0 : f.node) != (p == null ? void 0 : p.node) && o.push({
      blockPath: f,
      path: e
    });
  }
  function m({
    blockPath: e,
    path: i
  }) {
    var u, v, f, p, g, P, b, k, s;
    const r = j(), t = (u = i.parentPath) == null ? void 0 : u.node;
    switch (t.type) {
      case "ArrowFunctionExpression": {
        (v = i.parentPath) == null || v.replaceWith(n.identifier(r)), e.unshiftContainer("body", n.variableDeclaration("const", [
          n.variableDeclarator(
            n.identifier(r),
            t
          )
        ]));
        break;
      }
      case "ClassMethod": {
        if (t.key.type == "Identifier" && t.key.name == "constructor") return;
        (f = i.parentPath) == null || f.replaceWith(n.classProperty(
          t.key,
          n.identifier(r),
          void 0,
          t.decorators,
          t.computed,
          t.static
        )), e.unshiftContainer("body", n.functionDeclaration(
          n.identifier(r),
          t.params,
          t.body,
          t.generator,
          t.async
        ));
        break;
      }
      case "ClassPrivateMethod": {
        if (t.key.id.name == "constructor") return;
        (p = i.parentPath) == null || p.replaceWith(n.classPrivateProperty(
          t.key,
          n.identifier(r),
          t.decorators,
          t.static
        )), e.unshiftContainer("body", n.functionDeclaration(
          n.identifier(r),
          t.params,
          t.body,
          t.generator,
          t.async
        ));
        break;
      }
      case "FunctionDeclaration": {
        (g = i.parentPath) == null || g.replaceWith(n.identifier(r)), (P = t.id) != null && P.name && i.parentPath.scope.rename((b = t.id) == null ? void 0 : b.name, r), e.unshiftContainer("body", n.functionDeclaration(
          n.identifier(r),
          t.params,
          t.body,
          t.generator,
          t.async
        ));
        break;
      }
      case "FunctionExpression": {
        (k = i.parentPath) == null || k.replaceWith(n.identifier(r)), e.unshiftContainer("body", n.functionDeclaration(
          n.identifier(r),
          t.params,
          t.body,
          t.generator,
          t.async
        ));
        break;
      }
      case "ObjectMethod": {
        (s = i.parentPath) == null || s.replaceWith(n.objectProperty(
          t.key,
          n.identifier(r),
          t.computed,
          void 0,
          t.decorators
        )), e.unshiftContainer("body", n.functionDeclaration(
          n.identifier(r),
          t.params,
          t.body,
          t.generator,
          t.async
        ));
        break;
      }
    }
  }
  let y;
  O(a, {
    Program(e) {
      y = e.scope, e.stop();
    }
  }), O(a, {
    Function(e) {
      const i = e.node;
      i.type == "ObjectMethod" && ["get", "set"].includes(i.kind) || d(e.get("body"));
    }
  }), o.forEach(m);
  const h = x(a, { retainLines: !0 }, c);
  return {
    code: h.code,
    map: h.map
  };
}
function j(c = "", a = 8) {
  const o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return "f_" + (c || "unnamed").split("").filter((d) => o.includes(d)).join("") + "_" + Array.from({ length: a }, () => o[Math.floor(Math.random() * o.length)]).join("");
}
const F = {
  globalThis: !0,
  console: !0,
  document: !0,
  navigator: !0,
  window: !0,
  setTimeout: !0
}, D = M.default, I = L.default;
function R(c) {
  const a = S(c, {
    sourceType: "module",
    plugins: ["typescript", "jsx"]
  }), o = {}, d = (e) => {
    e in o ? o[e].count++ : o[e] = { count: 1, name: A(e) };
  };
  D(a, {
    StringLiteral(e) {
      d(e.node.value);
    },
    ObjectProperty(e) {
      const i = e.node.key;
      i.type === "Identifier" && d(i.name);
    }
  });
  const m = [];
  for (const [e, { count: i, name: r }] of Object.entries(o))
    i > 1 && m.push(
      n.variableDeclaration("const", [
        n.variableDeclarator(
          n.identifier(r),
          n.stringLiteral(e)
        )
      ])
    );
  const y = (e, i, r) => {
    e in o && o[e].count > 1 && i.replaceWith(r(o[e].name, i));
  };
  m.length > 0 && (D(a, {
    StringLiteral(e) {
      y(e.node.value, e, (i, r) => (r.parent.type == "ObjectProperty" && r.parent.key == r.node && (r.parent.computed = !0), n.identifier(i)));
    },
    ObjectProperty(e) {
      const i = e.node.key;
      i.type === "Identifier" && y(i.name, e, (r) => n.objectProperty(n.identifier(r), e.node.value, !0));
    }
  }), a.program.body.unshift(...m));
  const h = I(a, { retainLines: !0 }, c);
  return {
    code: h.code,
    map: h.map
  };
}
function A(c = "", a = 8) {
  const o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return "s_" + c.split("").filter((d) => o.includes(d)).join("") + "_" + Array.from({ length: a }, () => o[Math.floor(Math.random() * o.length)]).join("");
}
function z(c, a) {
  var o, d;
  return ((a == null ? void 0 : a.functions) ?? !0) && (c = ((o = W(c)) == null ? void 0 : o.code) || c), ((a == null ? void 0 : a.strings) ?? !0) && (c = ((d = R(c)) == null ? void 0 : d.code) || c), { code: c };
}
export {
  z as optimize,
  W as optimizeFunctions,
  R as optimizeStrings
};
