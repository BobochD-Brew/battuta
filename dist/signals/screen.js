import { createSignal as i } from "../signals.js";
const [d, n] = i(window.innerWidth), [o, e] = i(window.innerHeight), [r, t] = i(window.innerWidth / window.innerHeight);
window.addEventListener("resize", () => {
  n(window.innerWidth), e(window.innerHeight), t(window.innerWidth / window.innerHeight);
});
export {
  r as aspectRatio,
  o as height,
  t as setAspectRatio,
  e as setHeight,
  n as setWidth,
  d as width
};
