import optimizeFunctions from "./functions";
import optimizeStrings from "./strings";

export function optimize(jsCode: string, config?: any) {
    if(config?.functions ?? true) jsCode = optimizeFunctions(jsCode)?.code || jsCode;
    if(config?.strings ?? true) jsCode = optimizeStrings(jsCode)?.code || jsCode;
    return { code: jsCode};
}

export {
    optimizeStrings,
    optimizeFunctions
}