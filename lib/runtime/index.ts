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
export const seal = Symbol("seal");
export const resolve = Symbol("resolve");

const objectPrototype = Object.prototype;

objectPrototype[childrenIndex] = function() {
    return -1
}

objectPrototype[insert] = objectPrototype[seal] = function () {
    return this;
}

objectPrototype[empty] = function () {
    return undefined as any;
}

objectPrototype[create] = function (...props) {
    return Reflect.construct(this as any, props);
}

objectPrototype[append] = function (...childs) {
    appendTo(this, childs, this);
    return this;
}

objectPrototype[resolve] = function (keys: string[]) {
    let target = this as any;
    while(keys.length) target = target[keys.shift()!];
    return target;
}

objectPrototype[cleanup] = function(skipRemove) {
    const record = this[listeners];
    const subs = record?.["cleanup"];
    const hasRemove = !!this[remove];
    if(subs) for(const f of subs) f(hasRemove);
    delete record?.["cleanup"];
    !skipRemove && hasRemove && this[remove]();
}

objectPrototype[on] = function(key: string, f: Function) {
    const record = this[listeners] ??= {};    
    record[key] ??= [];
    record[key].push(f);
    return this;
}

objectPrototype[set] = function (value, ...keys) {
    const key = keys.pop()!;
    this[resolve](keys)[key] = value;
    return this;
}

objectPrototype[assign] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = this[resolve](keys);
    useEffect(() => target[key] = value());
    return this;
}

objectPrototype[call] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = this[resolve](keys);
    const f = target[key].bind(target);
    useEffect(() => f(...value()));
    return this;
}

type Child = Object | (() => Child) | Child[];
function appendTo(target: Object, childs: Child[], _parent: Object, _index = { v: -1 }): Object | undefined {
    let result = undefined;
    for(let i = 0; i < childs.length; i++) {
        const child = childs[i];
        if (typeof child === "function") {
            let index = _index;
            useEffect(() => {
                const newParent = new Object();
                _parent[on]("cleanup", () => newParent[cleanup]());
                _parent[context] ??= currentContext();
                newParent[context] = {
                    ..._parent[context],
                    [insert]: (..._childs: any) => insertTarget = appendTo(target, _childs, newParent, { v: target[childrenIndex](insertTarget) + 1 }),
                    [parent]: newParent,
                }
                contextStack.push(newParent[context]);
                let insertTarget: Object | undefined;
                const prevChild = insertTarget = appendTo(target, [child()], newParent, index)!;
                contextStack.pop();
                result ??= prevChild;

                return () => {
                    index = { v: target[childrenIndex](prevChild) };
                    newParent[cleanup]();
                }
            })
        } else if (Array.isArray(child)) {
            const addedChild = appendTo(target, child, _parent,  _index);
            result ??= addedChild;
        } else {
            const childToAdd = child ?? target[empty]();
            if(childToAdd == undefined) continue;
            const addedChild = target[insert](childToAdd, _index.v);
            if(_index.v > -1) _index.v++;
            addedChild[context] = _parent[context];
            _parent[on]("cleanup", (s: boolean) => addedChild[cleanup](s))
            result ??= addedChild;
        }
    }
    return result;
}

declare global {
    interface Object {
        [insert]: (child: this, index: number) => this;
        [append]: (...child: this[]) => this;
        [assign]: (value: () => any, ...keys: string[]) => this;
        [call]: (value: () => any, ...keys: string[]) => this;
        [set]: (value: any, ...keys: string[]) => this;
        [create]: (...props: any[]) => this;
        [childrenIndex]: (child?: this) => number;
        [cleanup]: (skipRemove?: boolean) => void;
        [remove]: () => void;
        [seal]: () => this;
        [empty]: () => this;
        [resolve]: (keys: string[]) => any;
        [context]?: Record<string, any>;
        [listeners]: Record<string, Function[]> | undefined;
        [on]: (event: string, f: Function) => this;
    }
}