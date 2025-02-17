import { useAppend } from "./tree";

export function lazy<T extends (props: any) => any>(f: () => Promise<{ default: T}>, delay?: number) {
    return (props: Parameters<T>[0]) => () => {
        const append = useAppend() as any;
        setTimeout(() => f().then(({ default: d }: any) => append(d(props))), delay ?? 0)
    }
}
