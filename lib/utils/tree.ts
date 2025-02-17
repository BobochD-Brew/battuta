import { cleanup, insert, on, parent } from "@runtime";
import { currentContext } from "../contexts";
import { devError } from "./dev";

export const onCleanup = (f: Function) => {
    const context = currentContext();
    devError(() => !context?.[parent]?.[on], "onCleanup was called from a context with no parent")
    context[parent][on]("cleanup", f);
}

export function useAppend(): (...args: any) => void {
    const appendFunction = currentContext()[insert];
    devError(() => !appendFunction, "useAppend was called from a context with no parent")
    return appendFunction;
}

export function useRemove(): () => void {
    const _parent = currentContext()[parent];
    devError(() => !_parent, "useRemove was called from a context with no parent")
    return () => _parent[cleanup]();
}