export declare function optimize(jsCode: string, config?: any): {
    code: string;
};

export declare function optimizeFunctions(jsCode: string): {
    code: string;
    map: {
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string | undefined;
        sourcesContent?: string[] | undefined;
        mappings: string;
        file: string;
    } | null;
};

export declare function optimizeStrings(jsCode: string): {
    code: string;
    map: {
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string | undefined;
        sourcesContent?: string[] | undefined;
        mappings: string;
        file: string;
    } | null;
};

export { }



