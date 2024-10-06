import { append as g, children as E, remove as x, createContext as F, onCleanup as r, unmount as m, appendMultiple as P } from "./runtime.js";
import { useEffect as y } from "./signals.js";
import { aspectRatio as M, width as R, height as S } from "./signals/screen.js";
import { Object3D as d, PerspectiveCamera as b, Scene as O, WebGLRenderer as _, PCFSoftShadowMap as j, Clock as k } from "three";
import { EffectComposer as D, OrbitControls as W, RenderPass as q } from "three/examples/jsm/Addons.js";
d.prototype[g] = function(n) {
  return this.add(n), this;
};
d.prototype[E] = function() {
  return this.children;
};
d.prototype[x] = function() {
  return this.removeFromParent();
};
const [z, A] = F((n) => n);
function I(n) {
  const {
    updateFunctions: e
  } = z();
  e.push(n);
  const o = () => e.splice(e.indexOf(n), 1);
  return r(o), o;
}
function J({
  children: n,
  camera: e,
  scene: o,
  antialias: w,
  shadowMap: C,
  renderer: t,
  composer: i,
  controls: a,
  passes: c,
  renderPass: u
}) {
  e ?? (e = new b(75, window.innerWidth / window.innerHeight, 0.1, 1e3)), o ?? (o = new O()), t ?? (t = new _({
    antialias: w
  })), i ?? (i = new D(t)), a ?? (a = new W(e, t.domElement)), c ?? (c = []), u ?? (u = new q(o, e)), C && (t.shadowMap.enabled = !0, t.shadowMap.type = j), y(() => {
    e.aspect = M(), e.updateProjectionMatrix(), t.setSize(R(), S()), t.domElement.style.width = "100vw", t.domElement.style.height = "100vh", t.setPixelRatio(window.devicePixelRatio);
  }), i.addPass(u), c.forEach((s) => i.addPass(s));
  const h = [], v = new k();
  let l = !1;
  function f() {
    if (l) return;
    requestAnimationFrame(f);
    const s = v.getDelta();
    h.forEach((p) => p(s)), i.render();
  }
  return f(), r(() => {
    l = !0, t.dispose(), u.dispose(), i.dispose(), a.dispose(), e[m](), o[m]();
  }), A({
    get scene() {
      return o;
    },
    get camera() {
      return e;
    },
    get renderer() {
      return t;
    },
    get updateFunctions() {
      return h;
    },
    children: (s) => [(p) => (o[P](n), void 0), (p) => t.domElement]
  });
}
export {
  J as Canvas,
  I as useFrame,
  z as useScene
};
