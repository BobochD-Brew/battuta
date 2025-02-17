const subscribersStack: any[] = [];
const coalesceStack: any[] = [];
const untracked = Symbol("untracked");
const prev = Symbol("prev");

export function createSignal<T>(defaultValue: T) {
    const subscribers = new Set<Function>();
    let value = defaultValue;
    
    const get = () => {
        const subscriber = subscribersStack[subscribersStack.length - 1];
        if(subscriber && !subscriber[untracked]) subscribers.add(subscriber);
        return value;
    }

    const set = (_value: T) => {
        value = _value;
        const effects = coalesceStack[coalesceStack.length - 1] as Set<any>;
        if(effects) return subscribers.forEach(it => effects.add(it));
        coalesce(() => subscribers.forEach(notify as any));
    }

    return [ get, set ] as GetSet<T>;
}

export function useEffect(callback: Function) {
    subscribersStack.push(callback);
    (callback as any)[prev] = callback();
    subscribersStack.pop();
}

export function coalesce(f: Function, depth = Infinity) {
    if(depth == 0) return f();
    coalesceStack.push(new Set()); f();
    const effects = coalesceStack.pop() as Set<any>;
    if(effects.size == 0) return;
    coalesce(() => effects.forEach(notify), depth - 1);
}

export function notify(f: Function & { [prev]: Function }) {
    if(typeof f[prev] == "function") f[prev]()
    useEffect(f);
}

export function untrack<T>(f:  (...args: any) => T) {
    (f as any)[untracked] = true;
    subscribersStack.push(f);
    const res = f();
    subscribersStack.pop();
    return res;
}

export type GetSet<T> = Parameters<(get: () => T, set: (v: T) => void) => void>;

