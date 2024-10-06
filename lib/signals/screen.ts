import { createSignal } from "@signals";

export const [width, setWidth] = createSignal(window.innerWidth);
export const [height, setHeight] = createSignal(window.innerHeight);
export const [aspectRatio, setAspectRatio] = createSignal(window.innerWidth / window.innerHeight);

window.addEventListener('resize', () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    setAspectRatio(window.innerWidth / window.innerHeight)
});