import { parse } from '@babel/parser';
import generateRaw from '@babel/generator';
import traverseRaw, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
const traverse = (traverseRaw as any).default as typeof traverseRaw;
const generate = (generateRaw as any).default as typeof generateRaw;

export default function optimizeStrings(jsCode: string) {
    const ast = parse(jsCode, {
        sourceType: 'module',
        plugins: [ 'typescript', 'jsx' ],
    });

    const stringLiterals: { [key: string]: { count: number; name: string } } = {};

    const handleString = (value: string) => {
        if (value in stringLiterals) {
            stringLiterals[value].count++;
        } else {
            stringLiterals[value] = { count: 1, name: generateRandomName(value) };
        }
    }

    traverse(ast, {
        StringLiteral(path) {
            handleString(path.node.value);
        },
        ObjectProperty(path) {
            const key = path.node.key;
            if(key.type !== "Identifier") return;
            handleString(key.name);
        }
    });

    const declarations: t.VariableDeclaration[] = [];

    for (const [value, { count, name }] of Object.entries(stringLiterals)) {
        if (count > 1) {
            declarations.push(
                t.variableDeclaration('const', [
                    t.variableDeclarator(
                        t.identifier(name),
                        t.stringLiteral(value)
                    )
                ])
            );
        }
    }

    const handleReplacement = <T extends t.Node>(value: string, path: NodePath<T>, replace: (name: string, path: NodePath<T>) => t.Node) => {
        if (value in stringLiterals && stringLiterals[value].count > 1) {
            path.replaceWith(replace(stringLiterals[value].name, path));
        }
    }

    if (declarations.length > 0) {
        traverse(ast, {
            StringLiteral(path) {
                handleReplacement(path.node.value, path, (name, _path) => {
                    if(_path.parent.type == "ObjectProperty" && _path.parent.key == _path.node) _path.parent.computed = true;
                    return t.identifier(name);
                })
            },
            ObjectProperty(path) {
                const key = path.node.key;
                if(key.type !== "Identifier") return;
                handleReplacement(key.name, path, (name) => {
                    return t.objectProperty(t.identifier(name), path.node.value, true);
                })
            }
        });

        ast.program.body.unshift(...declarations);
    }

    const output = generate(ast, { retainLines: true }, jsCode);

    return {
        code: output.code,
        map: output.map,
    };
}

function generateRandomName(base: string = "", length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return 's_' + base.split("").filter(x => characters.includes(x)).join("") + "_" + Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

