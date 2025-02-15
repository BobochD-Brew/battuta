
import { transformJSX } from "./jsx";
import { inferModes } from "./modes";

export function compile(jsCode: string, id: string) {
    jsCode = inferModes(jsCode, id);
    jsCode = transformJSX(jsCode).code;
    return jsCode;
}

export {
    transformJSX,
    inferModes,
}
