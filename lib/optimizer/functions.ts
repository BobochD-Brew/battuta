import { parse } from '@babel/parser';
import generateRaw from '@babel/generator';
import traverseRaw, { NodePath, Scope } from '@babel/traverse';
import * as t from '@babel/types';
const traverse = (traverseRaw as any).default as typeof traverseRaw;
const generate = (generateRaw as any).default as typeof generateRaw;

export default function optimizeFunctions(jsCode: string) {
    const ast = parse(jsCode, {
        sourceType: 'module',
        plugins: [ 'typescript', 'jsx' ],
    });

    const toHandle: any = [];

    function handleBlock(path: NodePath<t.BlockStatement | t.Expression>) {
        const parentNode = path.parentPath?.node;
        if(!t.isFunction(parentNode)) return;
        const scope = path.scope;
        const deps: string[] = [];

        path.parentPath.traverse({
            ReferencedIdentifier(path) {
                deps.push(path.node.name);
            },
            BindingIdentifier(path) {
                deps.push(path.node.name);
            },
            ThisExpression() {
                deps.push("this");
                // TODO allow "this" for functions & methods
                // if(["FunctionDeclaration", "FunctionExpression"].includes(path.parentPath?.node.type as string)) 
            },
            Super() {
                deps.push("super");
            }
        });
        
        const isPure = deps.every(dep => globalScope.hasOwnBinding(dep) || scope.hasOwnBinding(dep))
        // if(!isPure) return;
        let heighestViableScopePath = path.parentPath;

        function canGoUp() {
            const nextPath = heighestViableScopePath?.parentPath;
            const currentPath = heighestViableScopePath;
            if(currentPath == nextPath) return;
            if(!nextPath) return false;
            if(deps.some(dep => currentPath?.scope?.hasOwnBinding(dep) && !scope.hasOwnBinding(dep))) return false;
            if(!deps.every(dep => nextPath.scope.hasBinding(dep) || scope.hasOwnBinding(dep) || GLOBAL_API[dep])) return false;
            return true;
        }

        while(canGoUp()) {
            heighestViableScopePath = heighestViableScopePath!.parentPath!;
        }

        if(heighestViableScopePath == path.parentPath) return;
        if(!heighestViableScopePath) return;
        const blockPath = (heighestViableScopePath.isBlockStatement() || heighestViableScopePath.isProgram()) ? heighestViableScopePath : heighestViableScopePath.findParent((p) => p.isBlockStatement() || p.isProgram());
        const currentBlockPath =  (path.parentPath?.isBlockStatement() || path.parentPath?.isProgram()) ? path.parentPath : path.parentPath?.findParent((p) => p.isBlockStatement() || p.isProgram());
        if(blockPath?.node == currentBlockPath?.node) return;

        toHandle.push({
            blockPath,
            path,
        })
    }

    function moveHigher({
        blockPath,
        path,
    }: {
        blockPath: NodePath<Node>;
        path: NodePath<Node>
    }) {
        const randomName = generateRandomName()
        const parentNode = path.parentPath?.node;

        switch(parentNode.type) {
            case "ArrowFunctionExpression": {
                path.parentPath?.replaceWith(t.identifier(randomName));
                (blockPath as any)!.unshiftContainer("body",t.variableDeclaration('const', [
                    t.variableDeclarator(
                        t.identifier(randomName),
                        parentNode,
                    )
                ]));
                break;
            }
            case "ClassMethod": {
                if(parentNode.key.type == "Identifier" && parentNode.key.name == "constructor") return;
                path.parentPath?.replaceWith(t.classProperty(
                    parentNode.key,
                    t.identifier(randomName),
                    undefined,
                    parentNode.decorators,
                    parentNode.computed,
                    parentNode.static
                ));
                (blockPath as any)!.unshiftContainer("body",t.functionDeclaration(
                    t.identifier(randomName),
                    parentNode.params as any,
                    parentNode.body,
                    parentNode.generator,
                    parentNode.async
                ));
                break;
            }
            case "ClassPrivateMethod": {
                if(parentNode.key.id.name == "constructor") return;
                path.parentPath?.replaceWith(t.classPrivateProperty(
                    parentNode.key,
                    t.identifier(randomName),
                    parentNode.decorators,
                    parentNode.static
                ));
                (blockPath as any)!.unshiftContainer("body",t.functionDeclaration(
                    t.identifier(randomName),
                    parentNode.params as any,
                    parentNode.body,
                    parentNode.generator,
                    parentNode.async
                ));
                break;
            }
            case "FunctionDeclaration": {
                path.parentPath?.replaceWith(t.identifier(randomName));
                if(parentNode.id?.name) path.parentPath.scope.rename(parentNode.id?.name, randomName);
                (blockPath as any)!.unshiftContainer("body",t.functionDeclaration(
                    t.identifier(randomName),
                    parentNode.params as any,
                    parentNode.body,
                    parentNode.generator,
                    parentNode.async
                ));
                break;
            }
            case "FunctionExpression": {
                path.parentPath?.replaceWith(t.identifier(randomName));
                (blockPath as any)!.unshiftContainer("body",t.functionDeclaration(
                    t.identifier(randomName),
                    parentNode.params as any,
                    parentNode.body,
                    parentNode.generator,
                    parentNode.async
                ));
                break;
            }
            case "ObjectMethod": {
                path.parentPath?.replaceWith(t.objectProperty(
                    parentNode.key,
                    t.identifier(randomName),
                    parentNode.computed,
                    undefined,
                    parentNode.decorators
                ));
                (blockPath as any)!.unshiftContainer("body",t.functionDeclaration(
                    t.identifier(randomName),
                    parentNode.params as any,
                    parentNode.body,
                    parentNode.generator,
                    parentNode.async
                ));
                break;
            }
        }
    }

    let globalScope: Scope;

    traverse(ast, {
        Program(path) {
            globalScope = path.scope;
            path.stop();
        }
    });

    traverse(ast, {
        Function(path) {
            const node = path.node;
            if(node.type == "ObjectMethod" && ["get","set"].includes(node.kind)) return;
            handleBlock(path.get("body"));
        }
    });

    toHandle.forEach(moveHigher);

    const output = generate(ast, { retainLines: true }, jsCode);

    return {
        code: output.code,
        map: output.map,
    };
}

function generateRandomName(base: string = "", length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return 'f_' + (base || "unnamed").split("").filter(x => characters.includes(x)).join("") + "_" + Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

const GLOBAL_API: Record<string, boolean> = {
    "globalThis": true,
    "console": true,
    "document": true,
    "navigator": true,
    "window": true,
    "setTimeout": true,
}