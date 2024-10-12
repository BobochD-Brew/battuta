const subscribersStack: any[] = [];

const prev = Symbol("prev");

export function createSignal<T>(defaultValue: T) {

    const subscribers = new Set<Function>();
    let value = defaultValue;

    const get = () => {
        const subscriber = subscribersStack[subscribersStack.length - 1];
        if(subscriber) subscribers.add(subscriber);
        return value;
    }

    const set = (_value: T) => {
        value = _value;
        subscribers.forEach(it => (it[prev](),it[prev]=it()));
    }

    return [ get, set ] as const;
}

export function useEffect(callback: Function) {
    subscribersStack.push(callback);
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

declare global {
    interface Function {
        [prev]: Function;
    }
}