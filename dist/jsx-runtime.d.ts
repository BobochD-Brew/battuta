import { TreeNode } from "./runtime";
declare type DeepPairs<T> = {
    [K in keyof T]: T[K] extends Object ? `${K & string}:${Extract<keyof T[K], string>}` : never;
}[keyof T];

declare type HTMLElements = {
    [k in keyof HTMLElementTagNameMap]: Partial<Omit<HTMLElementTagNameMap[k], "children">> & {
        children?: any | any[];
    } & {
        [K in DeepPairs<HTMLElementTagNameMap[k]>]?: K extends `${infer Q}:${infer P}` ? HTMLElementTagNameMap[k][Q][P] : never;
    };
};

export declare namespace JSX {
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
    export type LibraryManagedAttributes<C, P> = (C extends new (...args: any) => infer U ? Partial<Omit<U, "children">> : {}) & (C extends (...args: any) => any ? ({
        children?: Parameters<C>[number] | Parameters<C>[number][];
    }) : {}) & {
        $c?: (C extends new (...args: any) => any ? ConstructorParameters<C> : []) | boolean;
    } & {
        $n?: boolean;
        $d?: boolean;
        $f?: boolean;
    } & (C extends new (...args: any) => infer U ? {
        [K in DeepPairs<U>]?: K extends `${infer Q}:${infer T}` ? (U[Q][T] extends Function ? (Parameters<U[Q][T]> | U[Q][T]) : U[Q][T]) : never;
    } : C extends (...args: any) => infer U ? {
        [K in DeepPairs<U>]?: K extends `${infer Q}:${infer T}` ? (U[Q][T] extends Function ? (Parameters<U[Q][T]> | U[Q][T]) : U[Q][T]) : never;
    } : {});
}

export declare function jsx(element: string | ((...args: any[]) => any), props: any, children: any): any;

export declare const jsxDEV: typeof jsx;

export declare function jsxFragment(): void;

declare type WithSvg = HTMLElements & {
    [k in keyof SVGElementTagNameMap]: Partial<Omit<SVGElementTagNameMap[k], "children">> & {
        children?: any | any[];
    } & {
        [K in DeepPairs<SVGElementTagNameMap[k]>]?: K extends `${infer Q}:${infer P}` ? (SVGElementTagNameMap[k][Q][P] extends SVGAnimatedEnumeration ? string : SVGElementTagNameMap[k][Q][P]) : never;
    };
};

export { }


declare global {
    interface HTMLElement extends TreeNode {
    }
    interface Function extends TreeNode {
    }
    interface Object extends TreeNode {
    }
    var $d: <T>(arg: T) => T;
    var $c: <T>(arg: T) => T;
    var $f: <T>(arg: T) => T;
    var $n: <T>(arg: T) => T;
    var $call: <T extends Array<any>>(...args: T) => T;
}
