export declare const append: unique symbol;

export declare const appendMultiple: unique symbol;

export declare const assign: unique symbol;

export declare const call: unique symbol;

export declare const children: unique symbol;

export declare const cleanupListeners: unique symbol;

declare const context: unique symbol;

export declare const create: unique symbol;

export declare const createContext: <T = any, P = any>(defaultValue: (props?: P) => T) => readonly [() => T, ({ children, ...props }: any) => () => any];

export declare const createElement: any;

export declare const createSVGElement: any;

export declare const currentContext: () => Record<symbol, any>;

export declare const onCleanup: (f: Function) => void;

export declare const onRemove: unique symbol;

export declare const remove: unique symbol;

export declare const render: (node: any, root: HTMLElement) => TreeNode;

export declare const set: unique symbol;

export declare interface TreeNode {
    [append]: (child: TreeNode) => TreeNode;
    [appendMultiple]: (...child: TreeNode[]) => TreeNode;
    [assign]: (key: string, value: () => any) => TreeNode;
    [call]: (key: string, value: () => any) => TreeNode;
    [set]: (key: string, value: any) => TreeNode;
    [create]: (...props: any[]) => TreeNode;
    [children]: () => TreeNode[];
    [unmount]: () => void;
    [remove]: () => void;
    [onRemove]: (f: Function) => TreeNode;
    [cleanupListeners]?: Function[];
    [context]?: Record<string, any>;
}

export declare const unmount: unique symbol;

export declare function useAppend(): (...childs: TreeNode[]) => void;

export declare function useRemove(): (() => void) | undefined;

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
