import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import { MacroContext } from "unplugin-macros";

export function css(this: any, css: TemplateStringsArray, ..._args: any[]): Record<string, string> {
    const context = this as MacroContext;
    const classMap: Record<string, string> = {};
    const root = postcss.parse(css);

    root.walkRules(rule => {
        rule.selectors = rule.selectors.map(selector => {
            return selector.replace(/\.[\w-]+/g, match => {
                const className = match.slice(1);
                classMap[className] ??= generateRandomClassName();
                return '.' + classMap[className];
            });
        });
    });

    const updatedCss = root.toString();
    // @ts-ignore
    if (!process.env.HOST_DEV) {
        const outputDir = '.temp';
        const fileName = `${generateRandomFileName()}.css`;
        const outputPath = path.join(process.cwd(), outputDir, fileName);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, updatedCss, 'utf8');
        context.magicString.prepend(`import '/${outputDir}/${fileName}';\n`)
        return new String(`(${JSON.stringify(classMap)})`) as any;
    } else {
        return new String(`
            (() => {
                const style = document.createElement("style");
                style.innerHTML = ${JSON.stringify(updatedCss)};
                document.head.appendChild(style);
                return ${JSON.stringify(classMap)};
            })();
        `) as any;
    }
}

function generateRandomClassName() {
    return 'cls-' + Math.random().toString(36).substr(2, 8);
}

function generateRandomFileName() {
    return 'style-' + Math.random().toString(36).substr(2, 8);
}