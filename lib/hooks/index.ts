import { cleanup, insert, on, parent } from "@runtime";
import { currentContext } from "../contexts";

export const onCleanup = (f: Function) => {
    currentContext()[parent]?.[on]?.("cleanup", f);
}

export function useAppend() {
    const insertFunction = currentContext()[insert];
    return insertFunction;
}

export function useRemove() {
    const _parent = currentContext()[parent];
    if(!_parent) return;
    return () => _parent[cleanup]();
}