import { createSignal } from "@signals";

const [time, setTime] = createSignal(Date.now())

requestAnimationFrame(setTime);

export { time }