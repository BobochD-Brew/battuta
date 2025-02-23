import { untrack } from "@signals";
import { VectorResult } from "./signals";
import { onCleanup, useAppend, useRemove } from "./tree";

export function MapVector<T, P>(props: { vector: VectorResult<T, P>, render: (value: () => P, key: T) => any }) {
    const vector = props.vector;
    const comp = (key: any) => () => {
        onCleanup(vector[5](key, useRemove()));
        return props.render(() => vector[0](key), key)
    }
    return [
        untrack(vector[3]).map(comp),
        () => {
            const add = useAppend();
            onCleanup(vector[4](key => add(comp(key))));
        }
    ]
}

export function Tree<R, K>(props: { root: R, path: K[], vector: (node: R) => VectorResult<K, R>, render: (value: () => R, key: K, rest: any, path: K[], parent: R) => any }) {
    const root = props.root;
    const getChilds = props.vector;
    const vector = getChilds(root);
    if(!vector) return null;
    const render = props.render;
    const path = props.path || [];
    return <MapVector
        vector={vector}
        render={(v: () => R, k: K) => render(v, k, () => <Tree path={path.concat([k])} root={v()} render={render} vector={getChilds}/>, path.concat([k]), root)}
    />
}