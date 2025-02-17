import { createSignal, useEffect } from '@signals';
import {BindingParams, FolderApi, Pane} from 'tweakpane';
import { onCleanup } from './tree';
import { useDebounced } from './signals';

const folder = Symbol("folder");
const pane = new Pane({ title: "Tweaks" });
let signalFolder: FolderApi | null = null;

let tweakPaneCount = 0;
let signalCount = 0;
let monitorCount = 0;

export function createTweak<T extends Record<string, any>>(name: string, settings: T): DeepFunctions<T>;
export function createTweak<T extends Record<string, any>>(settings: T): DeepFunctions<T>;
export function createTweak<T extends Record<string, any>>(...args: []) {
    const schema = args.pop();
    const folder = pane.addFolder({ title: args.pop() ?? `Tweak Pane ${++tweakPaneCount}` });
    onCleanup(() => folder.dispose());
    return addBindings(folder, schema) as DeepFunctions<T>;
}

export function createTweakSignal<T>(value: T, name?: string) {
    const [get, set] = createSignal(value);
    const key = name ?? `signal ${++signalCount}`;
    const ref = { [key]: value };
    if(!signalFolder) signalFolder = pane.addFolder({ title: `Signals` })
    const binding = signalFolder.addBinding(ref, key);
    binding.on("change", ({ value }) => set(value));
    onCleanup(() => binding.dispose());
    useDebounced(() => {
        ref[key] = get();
        binding.refresh();
    });
    return [get, set] as const;
}

export function useMonitor<T>(value: () => T, { name, ...opts }: (BindingParams & { name?: string }) = {}) {
    const key = name ?? `monitor ${++monitorCount}`;
    const ref: Record<string, T> = {};
    useEffect(() => ref[key] = value());
    if(!signalFolder) signalFolder = pane.addFolder({ title: `Signals` })
    const binding = signalFolder.addBinding(ref, key, {
        // @ts-ignore
        readonly: true,
        view: "graph",
        multiline: true,
        rows: 4,
        min: -1,
        ...opts,
    });
    onCleanup(() => binding.dispose());
}

export function Folder<T>(settings: T) {
    (settings as any)[folder] = true;
    return settings as TweakFolder<T>;
}

function addBindings(pane: FolderApi, obj: any) {
    const result: any = {};
    Object.entries(obj).forEach(([k, v]: any) => {
        if(v?.[folder]) {
            const folder = pane.addFolder({ title: k });
            result[k] = addBindings(folder, v);
        } else {
            const [get, set] = createSignal(v);
            const binding = pane.addBinding(obj, k as any);
            binding.on("change", ({ value }) => set(value));
            result[k] = get;
        }
    })
    return result;
}

type TweakFolder<T> = T & {
    [folder]: true;
}

type DeepFunctions<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends TweakFolder<T[K]> ? DeepFunctions<T[K]> : (() => T[K]);
}