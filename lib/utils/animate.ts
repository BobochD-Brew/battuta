import { createSignal, untrack, useEffect } from "@signals";
import { createComputed } from "./signals";

export const Ease = {
    linear: (t: number) => t,
    inQuad: (t: number) => t * t,
    outQuad: (t: number) => t * (2 - t),
    inOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    inCubic: (t: number) => t * t * t,
    outCubic: (t: number) => (--t) * t * t + 1,
    inOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

export function animate(get: () => number, set: (v: number) => void, to: number, duration: number, ease = Ease.linear): Promise<void> & { kill: () => void } {
    const start = performance.now();
    const from = untrack(get) as any;
    let killed = false;
    const ps = new Promise(res => {
        function step(now: number) {
            if(killed) return;
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            set(from + (to - from) * ease(progress));
            if (progress >= 1) return res(null);
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
    return Object.assign(ps, { kill: () => killed = true }) as any;
}

export function createTransition<T>(start: T, f: () => T, anim: (current: T, next: T, set: (v: T) => void) => any): () => T;
export function createTransition<T>(f: () => T, anim: (current: T, next: T, set: (v: T) => void) => { kill: () => void } | void): () => T;
export function createTransition<T>(...args: [T, () => T, (c: T, n: T, s:(v: T) => void) => { kill: () => void } | void] | [() => T, (c: T, n: T, s:(v: T) => void) => any]) {
    const anim = args.pop() as (c: T, n: T, s:(v: T) => void) => any;
    const f = args.pop() as () => T;
    const start = args.pop() as T; 
    const [value, setValue] = createSignal<T>(start);
    useEffect(() => anim(untrack(value), f(), setValue)?.kill);
    return value;
}

export function createEase(v: () => number, duration: number, ease = Ease.linear) {
    const [value, setValue] = createSignal(untrack(v));
    useEffect(() => animate(value, setValue, v(), duration, ease).kill);
    return value;
}

export function clamp(a: number, b: number, v: number) {
    return Math.max(a, Math.min(b, v));
}

export function lerp(a: number, b: number, v: number) {
    return (b - a) * v + a;
}

export function sample(a: number, b: number, v: number) {
    return  (Math.max(a, Math.min(b, v)) - a) / (b - a);
}

export function cursor(values: number[], v: number) {
    v = clamp(0, values.length - 1.001, v);
    const indexPre = Math.floor(v);
    const indexPost = Math.ceil(v);
    const t = v - indexPre;
    return lerp(values[indexPre], values[indexPost], t);
}