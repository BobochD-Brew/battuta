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
type InstanceProps<T> = T extends new (...args: any) => infer U ? Partial<Callable<Flatten<Babysitter<U>>>> : never;
type ClassProps<T> = T extends new (...args: any) => any ? ByName<ConstructorParameters<T>> : never;
type ResultProps<T> = T extends (...args: any) => infer U ? Partial<Callable<Flatten<Babysitter<U>>>> : never;
type FunctionProps<T> = T extends (...args: any) => any ? ByName<Parameters<T>> | { children: Parameters<T> } | (ByName<Parameters<T>> & { children: Parameters<T> }) : never;
type ElementsOf<T> = { [K in keyof T]: Partial<Callable<Flatten<Babysitter<T[K]>>>> }
type ElementsMap = HTMLElementTagNameMap & SVGElementTagNameMap;
type Babysitter<T> = Omit<T, "children"> & { children?: Object | Object[] | string | undefined | { toString: () => string } }
type Functions<T> = { [K in keyof T as T[K] extends ((...args: any) => any) ? K : never]: T[K] }
type Moddable = { $c?: (string | undefined)[][], $d?: boolean, $f?: (string | undefined)[][] }
type DeepKeys<T> = { [K in keyof T]: `${K & string}:${Extract<keyof T[K], string>}` }[keyof T] | keyof T;
// @ts-ignore
type Callable<T> = { [K in keyof Functions<T> as `${K}$`]: Parameters<Functions<T>[K]> } & T;
// @ts-ignore
type Flatten<T> =  { [K in DeepKeys<T>]: K extends `${infer F}:${infer S}` ? T[F][S] : T[K] }
// this is only available in this typescript version https://github.com/BobochD-Brew/TypeScript
// https://github.com/microsoft/TypeScript/issues/44939 
// @ts-ignore
type ByName<T> = { -readonly [K in keyof T["$byName"]]?: T["$byName"][K] }
type Result<T> =T extends new (...args: any) => infer U ? U
    : T extends (...args: any) => infer U ? U
// @ts-ignore
    : ElementsMap[T]