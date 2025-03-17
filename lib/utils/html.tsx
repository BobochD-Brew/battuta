import { append, assign, call, childrenIndex, empty, insert, remove, set } from "@runtime";
import { useEffect } from "@signals";

export const createElement = (tag?: string) => new DomElement(tag);
export const createSVGElement = createElement;
export const build = (content: any) => createElement()[append](content).toString();

export const toString = Symbol("toString");
(Object.prototype as any)[toString] = function() { return this.toString() };

class DomElement  {
    childrens: DomElement[] = []
    properties: Record<string, any> = {};

    constructor(public tag?: string) {}

    [call] = () => this;
    [childrenIndex] = (child: DomElement) => this.childrens.indexOf(child);
    [remove] = () => null;
    [assign] = (value: any, ...keys: any) => (useEffect(() => this.properties[keys.join(":")] = value()), this);
    [set] = (value: any, ...keys: any) => (this.properties[keys.join(":")] = value, this);
    [empty] = () => new String("")[set](() => null, remove as any);
    [insert] = (child: any, index: any) => {
        if(index == -1) index = this.childrens.length;
        if(typeof child == "string") child = new String(child);
        this.childrens.splice(index, 0, child as never);
        child[remove] = () => this.childrens.splice(this.childrens.indexOf(child), 1);
        return child;
    }
    [toString] = (): string => {
        const content = this.childrens.map(c => c[toString]()).join("");
        if(!this.tag) return content;
        const style = [];
        const attr = [];
        for(let k in this.properties) {
            const v = this.properties[k];
            if(typeof v == "function") continue;
            else if(k.startsWith("style:")) style.push(`${this.dash(k.split(":")[1])}:${v}`);
            else if(k == "style" && typeof v == "object") style.push(...Object.entries(v).map(([k, v]) => `${this.dash(k)}:${v}`));
            else if(k == "style" && typeof v == "string") style.push(v);
            else if(k == "className") attr.push(`class="${v}"`);
            else attr.push(`${k}="${v}"`);
        }
        if(style.length) attr.push(`style="${style.join(";")}"`)
        return `<${this.tag}${attr.length ? " " : ""}${attr.join(" ")}>${content}</${this.tag}>`
    }
    toString = () => this[toString]().replace(/\s+/g, " ").trim();
    dash = (v: string) => v.split("").map(c => c.toUpperCase() == c ? "-"+c.toLowerCase() : c).join("");
}