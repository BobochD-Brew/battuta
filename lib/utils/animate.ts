import { untrack } from "@signals";

export const Ease = {
    linear: (t: number) => t,
    inQuad: (t: number) => t * t,
    outQuad: (t: number) => t * (2 - t),
    inOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    inCubic: (t: number) => t * t * t,
    outCubic: (t: number) => (--t) * t * t + 1,
    inOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

export function animate(get: () => number, set: (v: number) => void, to: number, duration: number, ease = Ease.linear) {
    let start = performance.now();
    let from = untrack(get) as any;
    let frame: number;

    const ps = new Promise(res => {
        function step(now: number) {
            let elapsed = now - start;
            let progress = Math.min(elapsed / duration, 1);
            let value = from + (to - from) * ease(progress);
            set(value);
            if (progress < 1) {
                frame = requestAnimationFrame(step);
            } else {
                res(null);
            }
        }
    
        frame = requestAnimationFrame(step);
    })
    //@ts-ignore
    ps.kill = () => cancelAnimationFrame(frame);
    return ps as Promise<void> & { kill: () => void }
}