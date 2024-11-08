/** @internal */
export const contextStack: Record<symbol, any>[] = [];

export const currentContext = () => {
    return contextStack?.[contextStack.length-1];
}

export const createContext = <T = any, P = any>(defaultValue: (props?: P) => T) => {
    const symbol = Symbol("context");

    const consume = () => {
        return currentContext()[symbol] as T;
    }

    const cascade = ({ children, ...props }: any) => () => {
        currentContext()[symbol] = defaultValue(props);
        return children
    }

    return [ consume, cascade ] as const;
}