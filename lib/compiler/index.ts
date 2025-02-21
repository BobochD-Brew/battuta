
import { transformJSX } from "./jsx";
import { inferModes } from "./modes";

export function compile(jsCode: string, id: string, opts?: { dom: string }) {
    jsCode = inferModes(jsCode, id);
    jsCode = transformJSX(jsCode, opts?.dom).code;
    return jsCode;
}

export {
    transformJSX,
    inferModes,
}
