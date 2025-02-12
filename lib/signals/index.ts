const subscribersStack: any[] = [];
let untracked = false;
const prev = Symbol("prev");

export function createSignal<T>(defaultValue: T) {

    const subscribers = new Set<Function>();
    let value = defaultValue;
    
    const get = () => {
        const subscriber = subscribersStack[subscribersStack.length - 1];
        if(subscriber && !untracked) subscribers.add(subscriber);
        return value;
    }

    const set = (_value: T) => {
        value = _value;
        // @ts-ignore
        subscribers.forEach(it => (typeof it[prev] == "function" && it[prev](), it[prev]=it()));
    }

    return [ get, set ] as const;
}

export function useEffect(callback: Function) {
    subscribersStack.push(callback);
    // @ts-ignore
    callback[prev] = callback();
    subscribersStack.pop();
}

export function useDebounced(callback: Function, debounceTime = 250) {
    let firstCall = true;
    let timeout: any;
    useEffect(() => {
        if(firstCall) {
            firstCall = false;
            callback();
        } else {
            clearTimeout(timeout);
            setTimeout(callback, debounceTime)
        }
    })
}

export function untrack<T>(f:  (...args: any) => T) {
    untracked = true;
    const res = f();
    untracked = false;
    return res;
}