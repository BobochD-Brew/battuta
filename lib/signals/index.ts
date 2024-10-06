const contextStack: any[] = [];

export function createSignal<T>(defaultValue: T) {

    const subscribers = new Set<Function>();
    let value = defaultValue;

    const get = () => {
        const context = contextStack[contextStack.length - 1];
        if(context) subscribers.add(context);
        return value;
    }

    const set = (_value: T) => {
        value = _value;
        subscribers.forEach(it => it());
    }

    return [ get, set ] as const;
}

export function useEffect(callback: Function) {
    contextStack.push(callback);
    callback();
    contextStack.pop();
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