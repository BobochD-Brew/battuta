export declare function jsx(element: any, props: any, children: any): any;
export declare const jsxDEV: typeof jsx;
export declare function jsxFragment(): void;

export namespace JSX {
    export type ElementType = any;
    export type LibraryManagedAttributes<C, P> = Attributes<C, P>;
    export interface IntrinsicElements extends Elements {}
    export interface ElementAttributesProperty {}
    export interface IntrinsicAttributes {}
    export interface ElementChildrenAttribute { children: {} }
    // this is not available yet in standard typescript jsx https://github.com/microsoft/TypeScript/issues/14729
    export type ElementOf<T> = Result<T>;
}

type Elements = ElementsOf<ElementsMap>;
type Attributes<C, P> = (InstanceProps<C> & ClassProps<C>) | (ResultProps<C> & FunctionProps<C>) | P;
type InstanceProps<T> = T extends new (...args: any) => infer U ? Partial<Callable<Flatten<AnyChild<U>>>> : never;
type ClassProps<T> = T extends new (...args: any) => any ? ByName<ConstructorParameters<T>> : never;
type ResultProps<T> = T extends (...args: any) => infer U ? Partial<Callable<Flatten<NoChild<U>>>> : never;
type FunctionProps<T> = T extends (...args: any) => any ? ByName<Parameters<T>> | ChildParams<T> : never;
type ElementsOf<T> = { [K in keyof T]: Partial<Callable<Flatten<AnyChild<T[K]>>>> }
type ElementsMap = HTMLElementTagNameMap & SVGElementTagNameMap;
type NoChild<T> = Omit<T, "children">;
type AnyChild<T> = Omit<T, "children"> & { children?: any | any[] }
type Functions<T> = { [K in keyof T as T[K] extends ((...args: any) => any) ? K : never]: T[K] }
type Moddable = { $c?: (string | undefined)[][], $d?: boolean, $f?: (string | undefined)[][] }
type DeepKeys<T> = { [K in keyof T]: `${K & string}:${Extract<keyof T[K], string>}` }[keyof T] | Extract<keyof T, string>;
// @ts-ignore
type Callable<T> = { [K in keyof Functions<T> as `${K}$`]: Parameters<Functions<T>[K]> } & T;
// @ts-ignore
type Flatten<T> =  { [K in DeepKeys<T>]: K extends `${infer F}:${infer S}` ? T[F][S] : T[K] }
// this is only available in this typescript version https://github.com/BobochD-Brew/TypeScript
// https://github.com/microsoft/TypeScript/issues/44939 
// @ts-ignore
type ByName<T> = { -readonly [K in keyof T["$byName"]]: T["$byName"][K] }
type ChildParams<T extends (...args: any) => any> = Parameters<T> extends [infer U] ? { children: U }
    : Parameters<T> extends Parameters<(a?: infer U) => any> ? { children?: U }
    : { children: Parameters<T> };
type Result<T> =T extends new (...args: any) => infer U ? U
    : T extends (...args: any) => infer U ? U
// @ts-ignore
    : ElementsMap[T]