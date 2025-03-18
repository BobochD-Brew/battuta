export declare function jsx(element: any, props: any, children: any): any;
export declare const jsxDEV: typeof jsx;
export declare function jsxFragment(): void;

export namespace JSX {
    export type ElementOf<T> = any;
    export interface IntrinsicElements extends Record<string, any> {}
    export type LibraryManagedAttributes<C, P> = Record<string, any>;

    export type ElementType = any;
    // export type LibraryManagedAttributes<C, P> = Attributes<C, P>;
    // export interface IntrinsicElements extends Elements {}
    export interface ElementAttributesProperty {}
    export interface IntrinsicAttributes {}
    export interface ElementChildrenAttribute { children: {} }
    // this is not available yet in standard typescript jsx https://github.com/microsoft/TypeScript/issues/14729
    // export type ElementOf<T> = Result<T>;
}

// @ts-ignore
type Attributes<C, P> = C extends new (...args: any) => any ? Override<InstanceProps<C>,  ClassProps<C>> : Override<ResultProps<C>, FunctionProps<C>> | P;

// @ts-ignore
type InstanceProps<T> = Partial<Callable<Flatten<NoChild<InstanceType<T>>>>>;
// @ts-ignore
type ClassProps<T> = _ClassProps<ConstructorParameters<T>>;
// @ts-ignore
type _ClassProps<T> = ByName<T> | ClassChildParams<T>;
// @ts-ignore
type ClassChildParams<T> = T extends [infer U] ? { children: U } : T extends ConstructorParameters<new (a?: infer U) => any> ? { children?: U } : { children: T };

// @ts-ignore
type ResultProps<T> = Partial<Callable<Flatten<NoChild<ReturnType<T>>>>>;
// @ts-ignore
type FunctionProps<T> = _FunctionProps<Parameters<T>>;
// @ts-ignore
type _FunctionProps<T> = ByName<T> | FunctionChildParams<T>;
// @ts-ignore
type FunctionChildParams<T> = T extends [infer U] ? { children: U } : T extends Parameters<(a?: infer U) => any> ? { children?: U } : { children: T };

type ElementsMap = HTMLElementTagNameMap & SVGElementTagNameMap;
type Elements = ElementsOf<ElementsMap>;
type ElementsOf<T> = { [K in keyof T]: Partial<Callable<Flatten<AnyChild<T[K]>>>> }

type NoChild<T> = Omit<T, "children">;
type AnyChild<T> = Omit<T, "children"> & { children?: any | any[] }
type Override<A, B> = Omit<A, keyof B> & B;
type Functions<T> = { [K in keyof T as T[K] extends ((...args: any) => any) ? K : never]: T[K] }
// type DeepKeys<T> = _DeepKeys<Extract<keyof T, string>, T>
// @ts-ignore
// type _DeepKeys<K, T> = { [k in K]: `${K & string}:${Extract<keyof T[k], string>}` }[K] | K;
// @ts-ignore
type Callable<T> = _Callable<Functions<T>, T>;
// @ts-ignore
type _Callable<T, B> = { [K in keyof T as `${K}$`]: Parameters<T[K]> } & B;
// @ts-ignore
// type Flatten<T> =  { [K in DeepKeys<T>]: K extends `${infer F}:${infer S}` ? T[F][S] : T[K] }
// @ts-ignore
type Flatten<T> = _Flatten<T, StringKeys<T>>;
// @ts-ignore
type _Flatten<T, P> = _Flatten3<T, P> & T;
// @ts-ignore
type _Flatten2<K, B, T> = { [k in K as `${B}:${k}`]: T[B][k] }
// @ts-ignore
type _Flatten3<T, P> = Merge<{ [K in P]: _Flatten2<StringKeys<T[K]>, K, T> }[P]>;
type Merge<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
// this is only available in this typescript version https://github.com/BobochD-Brew/TypeScript
// https://github.com/microsoft/TypeScript/issues/44939 
// @ts-ignore
type ByName<T> = UnRealonly<T["$byName"]>
type StringKeys<T> = Extract<keyof T, string>;
type Result<T> = T extends new (...args: any) => infer U ? U
    : T extends (...args: any) => infer U ? U
// @ts-ignore
    : ElementsMap[T]
type UnRealonly<T> = { -readonly [K in keyof T]: T[K] }

