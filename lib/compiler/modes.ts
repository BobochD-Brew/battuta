import { JsxOpeningElement, JsxSelfClosingElement, Project, SourceFile, SyntaxKind } from "ts-morph";
import { tags } from "./tags";
import crypto from "crypto"
const project = new Project({});
const seen: Record<string, { hash: string, file: SourceFile, result: string }> = {};

export function inferModes(jsCode: string, id: string) {
    if(seen[id]) {
        const hash = seen[id].hash;
        const currentHash = crypto.createHash('md5').update(jsCode).digest('hex');
        if(currentHash != hash) {
            project.removeSourceFile(seen[id].file);
            delete seen[id];
        } else {
            return seen[id].result;
        }
    }

    const file = project.addSourceFileAtPath(id);
    const jsxOpeningElements: (JsxOpeningElement | JsxSelfClosingElement)[] = [];
    file.getDescendantsOfKind(SyntaxKind.JsxElement).forEach(el => jsxOpeningElements.push(el.getOpeningElement()));
    file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(el => jsxOpeningElements.push(el));

    jsxOpeningElements.forEach((opening) => {
        const mode = inferMode(opening);
        mode && opening.insertAttribute(0, mode);
    })
    
    const result = file.print();
    seen[id] = {
        hash: crypto.createHash('md5').update(jsCode).digest('hex'),
        file,
        result,
    }

    return result;
}

function inferMode(opening: JsxOpeningElement | JsxSelfClosingElement): { name: string, initializer?: string } | undefined {
    const name = opening.getTagNameNode();
    if(tags[name.getText()]) return;
    if(opening.getAttribute("$f")) return;
    if(opening.getAttribute("$d")) return;
    if(opening.getAttribute("$c")) return;

    const type = name.getType();

    const constructSignatures = type.getConstructSignatures()
    if(constructSignatures.length > 0) {
        const expression = constructSignatures.map(construct => 
            construct.getParameters().map(param => 
                param.getName()
            )
        );
        return { name: "$c", initializer: `{${JSON.stringify(expression)}}` }
    }

    const callSignatures = type.getCallSignatures();
    if(callSignatures.length > 0) {
        const initializer = `{${JSON.stringify(callSignatures.map(call => 
            call.getParameters().map(param => 
                param.getName()
            )
        ))}}`;
        if(callSignatures.some(sig => sig.getParameters().length > 1)) return { name: "$f", initializer };
        if(callSignatures.some(sig => sig.getParameters().some(it => !it.getDeclaredType().isObject()) )) return { name: "$f", initializer };
        if(callSignatures.some(sig => sig.getParameters().some(it => {
            const type = it.getDeclaredType();
            const symbol = type.getSymbol();
            const declarations = symbol?.getDeclarations();
            const classDeclarations = declarations?.filter(decl => decl.getKindName() === "ClassDeclaration");
            return type.isArray() || type.isClass() || !!classDeclarations?.length
        }))) return { name: "$f", initializer };
    }

    return { name: "$d" }
}