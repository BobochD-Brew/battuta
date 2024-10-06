
import { transformJSX } from "./jsx";

export function compile(jsCode: string) {
    return transformJSX(jsCode)
}

export {
    transformJSX
}
