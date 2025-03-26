import { minify } from "terser";

// vs extension: zjcompt.es6-string-javascript
export function javascript(this: any, code: TemplateStringsArray, ..._args: any[]): string {
    const jsCode = code as any as string;
    return minify({ "index.js": jsCode })
        .then(res => res.code) as any as string;
}