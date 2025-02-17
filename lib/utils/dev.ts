
export function dev(f: Function) {
    if(process.env.HOST_DEV) f();
}

export function devError(f: () => boolean, message: string) {
    if(process.env.HOST_DEV && f()) throw new Error(message);
}