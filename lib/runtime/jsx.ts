import { contextStack, currentContext } from "../contexts";
import { useEffect } from "../signals";

export const insert = Symbol("insert");
export const append = Symbol("append");
export const assign = Symbol("assign");
export const set = Symbol("set");
export const create = Symbol("create");
export const listeners = Symbol("listeners");
export const on = Symbol("on");
export const childrenIndex = Symbol("childrenIndex");
export const remove = Symbol("remove");
export const context = Symbol("context");
export const call = Symbol("call");
export const empty = Symbol("empty");
export const parent = Symbol("parent");
export const cleanup = Symbol("cleanup");

const objectPrototype = Object.prototype;

objectPrototype[childrenIndex] = function() {
    return -1
}

objectPrototype[insert] = function () {
    return this;
}

// HEAVY
objectPrototype[remove] = function() {
    const subs = this[listeners]["remove"];
    if(!subs) return;
    for(const f of subs) f();
}

objectPrototype[create] = function (...props) {
    return Reflect.construct(this as any, props);
}

objectPrototype[append] = function (...childs) {
    appendTo(this, childs, this);
    return this;
}

objectPrototype[cleanup] = function() {
    const record = this[listeners];
    const subs = record["cleanup"];
    if(subs) for(const f of subs) f();
    delete record["cleanup"];
    this[remove]();
}

objectPrototype[on] = function(key: string, f: Function) {
    const record = this[listeners];    
    record[key] ??= [];
    record[key].push(f);
    return this;
}

objectPrototype[set] = function (value, ...keys) {
    const key = keys.pop()!;
    resolveObj(this, keys)[key] = value;
    return this;
}

// HEAVY
objectPrototype[assign] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    useEffect(() => target[key] = value());
    return this;
}

// HEAVY
objectPrototype[call] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    const f = target[key].bind(target);
    useEffect(() => f(...value()));
    return this;
}

// HEAVY
const listenersObj = Symbol("l");
Object.defineProperty(objectPrototype, listeners, {
    get() {
        this[listenersObj] ??= {};
        return this[listenersObj];
    },
});

// HEAVY
function appendTo(target: TreeNode, childs: TreeChild[], _parent: TreeNode, _index = { v: -1 }): TreeNode | null {
    let result = null;
    for(let i = 0; i < childs.length; i++) {
        const child = childs[i];
        if (typeof child === "function") {
            let index = _index;
            // HEAVY
            useEffect(() => {
                const newParent = new Object();
                _parent[on]("remove", () => newParent[remove]());
                _parent[on]("cleanup", () => newParent[cleanup]());
                _parent[context] ??= currentContext();
                newParent[context] = {
                    ..._parent[context],
                    [insert]: (..._childs: any) => appendTo(target, _childs, newParent, index),
                    [parent]: newParent,
                }
                contextStack.push(newParent[context]);
                const prevChild = appendTo(target, [child()], newParent, index)!;
                contextStack.pop();
                result ??= prevChild;

                // HEAVY
                return () => {
                    index = { v: target[childrenIndex](prevChild) };
                    newParent[remove]();
                }
            })
        } else if (Array.isArray(child)) {
            const addedChild = appendTo(target, child, _parent,  _index);
            result ??= addedChild;
        } else {
            const addedChild = target[insert](child ?? target[empty](), _index.v);
            if(_index.v > -1) _index.v++;
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

export const render = (node: any, root: TreeNode) => root[append](node);

export type TreeChild = TreeNode | (() => TreeChild) | TreeChild[];

export interface TreeNode {
    [insert]: (child: TreeNode, index: number) => TreeNode;
    [append]: (...child: TreeNode[]) => TreeNode;
    [assign]: (value: () => any, ...keys: string[]) => TreeNode;
    [call]: (value: () => any, ...keys: string[]) => TreeNode;
    [set]: (value: any, ...keys: string[]) => TreeNode;
    [create]: (...props: any[]) => TreeNode;
    [childrenIndex]: (child?: TreeNode) => number;
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