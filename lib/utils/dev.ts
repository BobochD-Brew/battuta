
export function dev(f: Function) {
    if(process.env.HOST_DEV) f();
}

export function devError(shouldError: boolean, message: string) {
    if(process.env.HOST_DEV && shouldError) throw new Error(message);
}