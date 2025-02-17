import { createSignal, notify, untrack, useEffect } from "@signals";
import { onCleanup, useAppend, useRemove } from "./tree";

export function useDebounced(callback: Function, debounceTime = 250) {
    let call = true;
    useEffect(function f () {
        if(call) return (call = false, callback());
        const timeout = setTimeout(() => (call = true, notify(f as any)), debounceTime)
        return () => clearTimeout(timeout);
    });
}

export function computed<T>(f: () => T) {
    const [value, setValue] = createSignal<T>(undefined as any);
    useEffect(() => {
        const newValue = f();
        if(untrack(value) != newValue) setValue(newValue)
    });
    return value
}

export function createResource<T>(f: () => Promise<T>) {
    const [get, set] = createSignal<T | undefined>(undefined);
    const refresh = () => f().then(set);
    useEffect(refresh)
    return [ get, set, refresh ] as GetSetRefresh<T>;
}

export function createSelector<T extends string | number | symbol>(f: () => T) {
    const [get, set] = createVector<T, boolean>();
    useEffect(() => {
        const selected = f();
        set(selected, true);
        return () => set(selected, false);
    })
    return get;
}

export function createDiff<T>(f: () => T) {
    const proxy = createProxy<any>({ v: null });
    useEffect(() => proxy.v = f());
    return untrack(() => proxy.v) as T;
}

export function createVector<T extends string | number | symbol, V = any>(defaultValue: Record<T, V> = {} as any) {
    const s: Record<T, any> = {} as any;
    const [_keys, setKeys] = createSignal(new Set<T>(Object.keys(defaultValue) as T[]));
    const creationListeners = new Set<Function>();
    const removalListeners: Record<T, Set<Function>> = {} as any;

    const get = (id: T) => {
        s[id] ??= createSignal(defaultValue[id]);
        return s[id][0]() as V;
    }

    const set = (id: T, value: V) => {
        s[id] ??= createSignal(value);
        s[id][1](value);
        const k = untrack(_keys);
        if(k.has(id)) return;
        k.add(id);
        creationListeners.forEach(f => f(id));
        untrack(() => setKeys(k));
    }

    const remove = (id: T) => {
        const k = untrack(_keys);
        if(!k.has(id)) return;
        k.delete(id);
        untrack(() => setKeys(k));
        removalListeners[id]?.forEach(f => f());
        delete removalListeners[id];
        delete s[id];
    }

    const keys = () => {
        return [..._keys()] as T[];
    };

    const onNew = (f: (key: T) => void) => {
        creationListeners.add(f);
        return () => creationListeners.delete(f);
    }

    const onRemove = (id: T, f: () => void) => {
        removalListeners[id] ??= new Set<Function>();
        removalListeners[id].add(f);
        return () => removalListeners[id]?.delete(f);
    }

    const res = [ get, set, remove, keys, onNew, onRemove ] as any;
    Object.assign(res, { get, set, remove, keys, onNew, onRemove })
    return res as VectorResult<T, V>
}


export function createProxy<T extends Object = any>(defaultValue: T = {} as any) {
    const vector = createVector();
    const proxy = new Proxy(vector, proxyHandler);
    Object.entries(defaultValue).forEach(([k, v]) => proxy[k] = v);
    return proxy as ProxyVector<T>;
}

export const coreVector = Symbol("coreVector");
const proxyHandler: ProxyHandler<any> = {
    get(target, p) {
        if(p == coreVector) return target;
        return target[0](p);
    },
    set(target, p, newValue) {
        let current = untrack(() => target[0](p));
        if(typeof newValue == "object") {
            if(typeof current !== "object") (current = createProxy(), target[1](p, current));
            const pre = untrack(() => Object.keys(current));
            const post = untrack(() => Object.keys(newValue));
            const keys = new Set(pre.concat(post));
            keys.forEach(k => (pre.includes(k) && !post.includes(k) && delete current[k]) || (current[k] = newValue[k]));
        } else if(newValue !== current) {
            target[1](p, newValue);
        }
        return true;
    },
    ownKeys(target) {
        return target[3]().concat(['length']);
    },
    deleteProperty(target, p) {
        target[2](p);
        return true;
    },
    getOwnPropertyDescriptor(target, p) {
        const keys = untrack(() => target[3]());
        if(p == "length") return { value: keys.length, writable: true }
        if(!keys.includes(p)) return;
        return { enumerable: true, writable: true, configurable: true }
    },
}

export type ProxyVector<T> = { [K in keyof T]: T[K] extends Object ? ProxyVector<T[K]> : T[K]; } & { [coreVector]: VectorResult<keyof T, T[keyof T]> }
export type GetSetRefresh<T> = Parameters<(get: () => T, set: (v: T) => void, refresh: () => Promise<void>) => void>;
export type VectorResult<T, V> = Parameters<(get: (id: T) => V, set: (id: T, v: V) => void, remove: (id: T) => void, keys: () => T[], onNew: (f: (key: T) => void) => () => void, onRemove: (id: T, f: () => void) => () => void) => void> & {
    get: (id: T) => V,
    set: (id: T, v: V) => void,
    remove: (id: T) => void,
    keys: () => T[],
    onNew: (f: (key: T) => void) => () => void,
    onRemove: (id: T, f: () => void) => () => void,
}