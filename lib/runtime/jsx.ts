import { contextStack } from "../contexts";
import { useEffect } from "../signals";

export const insert = Symbol("insert");
export const append = Symbol("append");
export const assign = Symbol("assign");
export const set = Symbol("set");
export const create = Symbol("create");
export const listeners = Symbol("listeners");
export const on = Symbol("on");
export const children = Symbol("children");
export const remove = Symbol("remove");
// export const unmount = Symbol("unmount");
export const context = Symbol("context");
export const call = Symbol("call");
export const empty = Symbol("empty");
export const parent = Symbol("parent");
export const cleanup = Symbol("cleanup");

/**
 *          DOM 
 */

const elementPrototype = Element.prototype;

elementPrototype[remove] = Text.prototype[remove] = function() {
    this.remove();
}

elementPrototype[children] = function() {
    return Array.from(this.childNodes);
}

elementPrototype[empty] = function() {
    return document.createTextNode("");
}

elementPrototype[insert] = function(child, index) {
    const currentChilds =  this[children]();
    if(!(child instanceof Node)) child = document.createTextNode(child.toString());
    this.insertBefore(child as Element, currentChilds[index] as Element);
    return child;
}

/**
 *          ABSTRACT 
 */

const objectPrototype = Object.prototype;

objectPrototype[children] = function() {
    return []
}

objectPrototype[insert] = function () {
    return this;
}

objectPrototype[remove] = function() {
    this[listeners]["remove"]?.forEach(x=>x());
}

objectPrototype[create] = function (...props) {
    return Reflect.construct(this as any, props);
}

objectPrototype[append] = function (...childs) {
    appendTo(this, childs, this);
    return this;
}

objectPrototype[cleanup] = function() {
    this[listeners]["cleanup"]?.forEach(x=>x());
    delete this[listeners]["cleanup"];
    this[remove]();
}

objectPrototype[on] = function(key: string, f: Function) {
    this[listeners][key] ??= [];
    this[listeners][key].push(f);
    return this;
}

objectPrototype[set] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    target[key] = value;
    return this;
}

objectPrototype[assign] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    useEffect(() => target[key] = value());
    return this;
}

objectPrototype[call] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    const f = target[key].bind(target);
    useEffect(() => f(...value()));
    return this;
}

const listenersObj = Symbol("l");
Object.defineProperty(objectPrototype, listeners, {
    get() {
        this[listenersObj] ??= {};
        return this[listenersObj];
    },
});

function appendTo(target: TreeNode, childs: TreeChild[], _parent: TreeNode, _index = -1): TreeNode | null {
    let result = null;
    for(let i = 0; i < childs.length; i++) {
        const child = childs[i];
        if (typeof child === "function") {
            let index = -1;
            useEffect(() => {
                const newParent = new Object();
                _parent[on]("remove", () => newParent[remove]());
                _parent[on]("cleanup", () => newParent[cleanup]());
                newParent[context] = {
                    ..._parent[context],
                    [insert]: (..._childs: any) => appendTo(target, _childs, newParent, index),
                    [parent]: newParent,
                }
                contextStack.push(newParent[context]);
                const prevChild = appendTo(target, [child()], newParent, index)!;
                contextStack.pop();
                result ??= prevChild;

                return () => {
                    index = target[children]().indexOf(prevChild || NaN);
                    newParent?.[remove]();
                }
            })
        } else if (Array.isArray(child)) {
            result ??= appendTo(target, child, _parent, _index);
        } else {
            const addedChild = target[insert](child ?? target[empty](), _index);
            addedChild[context] = _parent[context];
            _parent[on]("remove", () => addedChild[remove]())
            _parent[on]("cleanup", () => addedChild[cleanup]())
            result ??= addedChild;
        }
    }
    return result;
}

function resolveObj(target: any, keys: string[]) {
    while(keys.length) target = target[keys.shift()!];
    return target;
}

export const createElement = document.createElement.bind(document);
export const createSVGElement = document.createElementNS.bind(document, 'http://www.w3.org/2000/svg');
export const render = (node: any, root: HTMLElement) => root[append](node);

export type TreeChild = TreeNode | (() => TreeChild) | TreeChild[];

export interface TreeNode {
    [insert]: (child: TreeNode, index: number) => TreeNode;
    [append]: (...child: TreeNode[]) => TreeNode;
    [assign]: (value: () => any, ...keys: string[]) => TreeNode;
    [call]: (value: () => any, ...keys: string[]) => TreeNode;
    [set]: (value: any, ...keys: string[]) => TreeNode;
    [create]: (...props: any[]) => TreeNode;
    [children]: () => readonly TreeNode[];
    // [unmount]: () => void;
    [cleanup]: () => void;
    [remove]: () => void;
    [empty]: () => TreeNode;
    [context]?: Record<string, any>;
    [listeners]: Record<string, Function[]>;
    [on]: (event: string, f: Function) => TreeNode;
}

declare global {
    interface Object extends TreeNode {}
    var $d: <T>(arg: T) => T;
    var $c: <T>(arg: T) => T;
    var $f: <T>(arg: T) => T;
    var $n: <T>(arg: T) => T;
    var $call: <T extends Array<any>>(...args: T) => T;
}