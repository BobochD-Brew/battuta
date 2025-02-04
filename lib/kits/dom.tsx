import { childrenIndex, empty, insert, remove } from "@runtime";

const elementPrototype = Element.prototype;

elementPrototype[remove] = Text.prototype[remove] = function() {
    // HEAVY
    this.remove();
}

elementPrototype[childrenIndex] = function(child) {
    const childs = this.childNodes;
    for(let i = 0; i < childs.length; i++) {
        if(childs[i] === child) return i;
    }
    return -1;
}

let emptyBase;
elementPrototype[empty] = function() {
    emptyBase ??= document.createTextNode("");
    return emptyBase.cloneNode();
}

// HEAVY
elementPrototype[insert] = function(child, index) {
    if(!(child instanceof Node)) child = document.createTextNode(child as string);
    // HEAVY
    this.insertBefore(child as Element, this.childNodes[index]);
    return child;
}

// HEAVY
export const createElement = document.createElement.bind(document);
export const createSVGElement = document.createElementNS.bind(document, 'http://www.w3.org/2000/svg');