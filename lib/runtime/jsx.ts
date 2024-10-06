import { useEffect } from "../signals";

const append = Symbol("+");
const appendMultiple = Symbol("+");
const assign = Symbol("<");
const set = Symbol("=");
const create = Symbol("m");
const cleanupListeners = Symbol("l");
const onRemove = Symbol("d");
const children = Symbol("c");
const remove = Symbol("r");
const unmount = Symbol("u");
const context = Symbol("x");
const call = Symbol("call");

const elementPrototype = Element.prototype;

elementPrototype[append] = function(child) {
    this.append(child as any);
    return this;
}

elementPrototype[children] = function() {
    return Array.from(this.children);
}

elementPrototype[remove] = function() {
    this.remove();
}

const objectPrototype = Object.prototype;

objectPrototype[create] = function (...props) {
    return Reflect.construct(this as any, props);
}

objectPrototype[set] = function (key, value) {
    if(key.includes(":")) {
        const _key = key.split(":");
        (this as any)[_key[0]][_key[1]] = value;
    } else {
        (this as any)[key] = value;
    }
    return this;
}

objectPrototype[assign] = function (key, value) {
    if(key.includes(":")) {
        const _key = key.split(":");
        useEffect((_: any) => (this as any)[_key[0]][_key[1]] = value());
    } else {
        useEffect((_: any) => (this as any)[key] = value());
    }
    return this;
}

objectPrototype[call] = function (key, value) {
    if(key.includes(":")) {
        const _key = key.split(":");
        useEffect((_: any) => (this as any)[_key[0]][_key[1]](...value()));
    } else {
        useEffect((_: any) => (this as any)[key](...value()));
    }
    return this;
}

objectPrototype[append] = function () {
    return this;
}

const contextStack: Record<symbol, any>[] = [];
const parentStack: TreeNode[] = [];
const insertStack: ((...childs: TreeNode[]) => void)[] = [];

export const currentContext = () => {
    return contextStack?.[contextStack.length-1];
}

export const createContext = <T = any, P = any>(defaultValue: (props?: P) => T) => {
    const symbol = Symbol("context");

    const consume = () => {
        return currentContext()[symbol] as T;
    }

    const cascade = ({ children, ...props }: any) => () => {
        currentContext()[symbol] = defaultValue(props);
        return children
    }

    return [ consume, cascade ] as const;
}

export const onCleanup = (f: Function) => {
    parentStack?.[parentStack.length-1]?.[onRemove]?.(f);
}

function appendMultipleTo(target: any, childs: any[], parent: any, _context?: any) {
    for(let i = 0; i < childs.length; i++) {
        const child = childs[i];
        if (typeof child === "function") {
            contextStack.push({...(_context || currentContext())});
            const newParent = new Object();
            parent[onRemove]?.(() => newParent?.[unmount]())
            parentStack.push(newParent);
            insertStack.push((..._childs) => appendMultipleTo(target, _childs, newParent));
            appendMultipleTo(target, [child()], newParent);
            contextStack.pop();
            insertStack.pop();
            parentStack.pop();
        } else if (Array.isArray(child)) {
            appendMultipleTo(target, child, parent, _context);
        } else {
            if(!child) continue;
            parent[onRemove]?.(() => child?.[unmount]())
            if(child instanceof Object) child[context] = _context || currentContext();
            target[append](child as any);
        }
    }
}

objectPrototype[appendMultiple] = function (...childs) {
    appendMultipleTo(this, childs, this, this[context]);
    return this;
}

objectPrototype[onRemove] = function(f: Function) {
    this[cleanupListeners] ??= [];
    this[cleanupListeners].push(f);
    return this;
}

objectPrototype[children] = function() {
    return []
}

objectPrototype[remove] = function() {}

objectPrototype[unmount] = function() {
    this[cleanupListeners]?.forEach(x=>x());
    delete this[cleanupListeners];
    this[remove]();
}

export function useAppend() {
    const insertFunction = insertStack[insertStack.length - 1];
    return insertFunction;
}

export function useRemove() {
    const parent = parentStack[parentStack.length - 1];
    if(!parent) return;
    return () => parent[unmount]();
}

export const createElement = document.createElement.bind(document);
export const createSVGElement = document.createElementNS.bind(document, 'http://www.w3.org/2000/svg');

export const render = (node: any, root: HTMLElement) => root[appendMultiple](node);

export {
    create,
    append,
    appendMultiple,
    assign,
    set,
    cleanupListeners,
    onRemove,
    children,
    remove,
    unmount,
    call,
}

export interface TreeNode {
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

declare global {
    interface HTMLElement extends TreeNode {}
    interface Function extends TreeNode {}
    interface Object extends TreeNode {}
    var $d: <T>(arg: T) => T;
    var $c: <T>(arg: T) => T;
    var $f: <T>(arg: T) => T;
    var $n: <T>(arg: T) => T;
    var $call: <T extends Array<any>>(...args: T) => T;
}