import { BindingParams } from 'tweakpane';

export declare function createTweak<T extends Record<string, any>>(name: string, settings: T): DeepFunctions<T>;

export declare function createTweak<T extends Record<string, any>>(settings: T): DeepFunctions<T>;

export declare function createTweakSignal<T>(value: T, name?: string): readonly [() => T, (_value: T) => void];

declare type DeepFunctions<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends TweakFolder<T[K]> ? DeepFunctions<T[K]> : (() => T[K]);
};

export declare function Folder<T>(settings: T): TweakFolder<T>;

declare const folder: unique symbol;

declare type TweakFolder<T> = T & {
    [folder]: true;
};

export declare function useMonitor<T>(value: () => T, { name, ...opts }?: (BindingParams & {
    name?: string;
})): void;

export { }



