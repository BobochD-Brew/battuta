import { createSignal } from "@signals";

export const [mouse, setMouse] = createSignal({ x: 0, y: 0 });

window.addEventListener('mousemove', (e) => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
});

window.addEventListener('touchmove', (e) => {
    setMouse({ x: e.touches[0].clientX / window.innerWidth, y: e.touches[0].clientY / window.innerHeight })
});