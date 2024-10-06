import { default as battutaMacros } from 'unplugin-macros/vite';
import { Options } from 'unplugin-macros';
import { Plugin as Plugin_2 } from 'vite';

export declare function battutaConfig(): Plugin_2;

export declare function battutaFolders(config: any): Plugin_2;

export declare function battutaJSX(config?: Config["compiler"]): Plugin_2;

export { battutaMacros }

export declare function battutaOptimizer(config?: Config["optimizer"]): Plugin_2;

declare function battutaPlugin(config?: Config): Plugin_2[];
export default battutaPlugin;

export declare function battutaVirtualRoot(): Plugin_2;

declare type Config = {
    macros?: Options;
    compiler?: {};
    folders?: {};
    optimizer?: {
        strings?: boolean;
        functions?: boolean;
    };
};

export { }



