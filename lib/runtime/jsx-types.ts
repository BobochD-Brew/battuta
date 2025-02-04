export declare function jsx(element: string | ((...args: any[]) => any), props: any, children: any): any;
export declare const jsxDEV: typeof jsx;
export declare function jsxFragment(): void;

type DeepPairs<T> = {
    [K in keyof T]: T[K] extends Object
        ? `${K & string}:${Extract<keyof T[K], string>}`
        : never
}[keyof T];


type HTMLElements = {
    [k in keyof HTMLElementTagNameMap]: Partial<Omit<HTMLElementTagNameMap[k], "children">> & {
        children?: any | any[];
    } & {
        // @ts-ignore
        [K in DeepPairs<HTMLElementTagNameMap[k]>]?: K extends `${infer Q}:${infer P}` ? HTMLElementTagNameMap[k][Q][P] : never;
    }
}

type WithSvg = HTMLElements & {
    [k in keyof SVGElementTagNameMap]: Partial<Omit<SVGElementTagNameMap[k], "children">> & {
        children?: any | any[];
    } & {
        [K in DeepPairs<SVGElementTagNameMap[k]>]?: K extends `${infer Q}:${infer P}` ? (
            // @ts-ignore
            SVGElementTagNameMap[k][Q][P] extends SVGAnimatedEnumeration ? string : SVGElementTagNameMap[k][Q][P]
        ) : never;
    }
}

type WithFunction<T> = {
    [K in keyof T]: T[K] extends ((...args: any) => any) ? (Parameters<T[K]> | T[K]) : T[K];
}

export namespace JSX {
    // @ts-ignore
    export interface IntrinsicElements extends WithSvg {
        switch: {
            on: any;
            children: IntrinsicElements["case"][];
        };
        case: {
            so?: any;
            children?: any;
        } & ({
            is: any;
        } | {
            default: true;
        });
        array: {
            children?: any;
        };
    }
    export interface ElementAttributesProperty {
    }
    export interface IntrinsicAttributes extends Record<string, any> {
    }
    export interface ElementChildrenAttribute {
        children: {};
    }
    export type LibraryManagedAttributes<C, P> = (C extends new (...args: any) => infer U ? Partial<Omit<WithFunction<U>, "children">> : {}) &
        (C extends (...args: any) => any ? ({ children?: Parameters<C>[number] | Parameters<C>[number][] }) : {})
        & {
            $c?: (C extends new (...args: any) => any ? ConstructorParameters<C> : []) | boolean;
        } & {
            $n?: boolean,
            $d?: boolean,
            $f?: boolean,
        } & (C extends new (...args: any) => infer U ? {
            [K in DeepPairs<U>]?: K extends `${infer Q}:${infer T}` ? (
                // @ts-ignore
                U[Q][T] extends ((...args: any) => any) ? (Parameters<U[Q][T]> | U[Q][T]) : U[Q][T]
            ) : never;
        } : C extends (...args: any) => infer U ? {
            [K in DeepPairs<U>]?: K extends `${infer Q}:${infer T}` ? (
                // @ts-ignore
                U[Q][T] extends ((...args: any) => any) ? (Parameters<U[Q][T]> | U[Q][T]) : U[Q][T]
            ) : never;
        } : {

        })
}