import { createSignal } from "@signals";

const [width, setWidth] = createSignal(window.innerWidth);
const [height, setHeight] = createSignal(window.innerHeight);
const [aspectRatio, setAspectRatio] = createSignal(window.innerWidth / window.innerHeight);

window.addEventListener('resize', () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    setAspectRatio(window.innerWidth / window.innerHeight)
});

export { width, height, aspectRatio }