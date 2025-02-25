import parser, { ParseResult } from '@babel/parser';
import generateRaw from '@babel/generator';
import traverseRaw, { NodePath, VisitNode } from '@babel/traverse';
import * as t from '@babel/types';
import { svgTags, tags } from './tags';
const traverse = (traverseRaw as any).default as typeof traverseRaw;
const generate = (generateRaw as any).default as typeof generateRaw;

export function transformJSX(jsCode: string, dom = "battuta/dom") {
    const ast = parser.parse(jsCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators'],
    });

    traverse(ast, {
        JSXElement: (path) => {path.replaceWith(handleJSXElement(path.node) || t.nullLiteral())},
        JSXFragment: (path) => {path.replaceWith(handleJSXElement(path.node) || t.nullLiteral())},
    })

    addImport(ast, "createElement", dom);
    addImport(ast, "createSVGElement", dom);
    addImport(ast, "create", "battuta/runtime");
    addImport(ast, "assign", "battuta/runtime");
    addImport(ast, "set", "battuta/runtime");
    addImport(ast, "call", "battuta/runtime");
    addImport(ast, "append", "battuta/runtime");
    addImport(ast, "seal", "battuta/runtime");

    return generate(ast, {}, jsCode);
}

function handleJSXElement(node: t.JSXElement | t.JSXFragment): t.Expression | null {
	let mode: Mode = "$d";

	const getChilds = () => node.children.map(c=>handleChild(c, mode)!).filter(Boolean);

	if(node.type == "JSXFragment") return t.arrayExpression(getChilds());

    const openingElement = node.openingElement;

    let tagName = ""; switch(openingElement.name.type) {
        case "JSXIdentifier": tagName = openingElement.name.name; break;
        case "JSXNamespacedName": tagName = openingElement.name.name.name; break;
        // @ts-ignore
        case "JSXMemberExpression": tagName = openingElement.name.object.name + "." + openingElement.name.property.name; break;
    }

	// @ts-ignore
	const hasMode = openingElement.attributes.find(a => a.type === "JSXAttribute" && a.name.type == "JSXIdentifier" && modes[a.name.name])?.name?.name as Mode;
	if(hasMode) mode = hasMode;

    const children = getChilds();
	const isTag = tags[tagName];
	const isSVGTag = (svgTags as any)[tagName];

    const props = openingElement.attributes.map(a=>handleAttribute(a, mode)!).filter(Boolean);
	
	if(isTag) {
		return withSeal(
			withChildren(
				children,
				withAtrributes(
					props,
					t.callExpression(
						t.identifier(isSVGTag ? btt('createSVGElement') : btt('createElement')),
						[t.stringLiteral(tagName)]
					)
				)
			)
		) 
	}

	if(mode === "$c") {
		const raw = props.find(({ key }) => key[0].type == "StringLiteral" && key[0].value == "$c")?.value as t.ArrayExpression;
		const rawElements = raw.elements as t.ArrayExpression[];
		const constructorSignatures = rawElements.map(el => el.elements.map(it => (it as t.StringLiteral).value));

		const objectProps = props.reduce((p,v) => {
			if(v.key.length > 1) return p;
			p[v.key[0].value] = v.value;
			return p
		}, {} as Record<string, t.Expression>)

		const constructorCandidates = constructorSignatures.map(sig => sig.map(param => objectProps[param]))
		const bestCandidate = constructorCandidates.sort((a, b) => b.filter(Boolean).length - a.filter(Boolean).length)[0];
		const keys = constructorSignatures[constructorCandidates.indexOf(bestCandidate)];
		const args = [];
		while(children.length || bestCandidate.length) args.push(bestCandidate.shift() || children.shift());
		const lastNonNull = args.findLastIndex(Boolean);
		const constructor = args.slice(0, lastNonNull + 1).map(el => el || t.identifier("undefined"));

		return withSeal(
			withChildren(
				children,
				withAtrributes(
					props.filter(prop => prop.key.length > 1 || !keys.includes(prop.key[0].value)),
					t.callExpression(
						t.memberExpression(
							t.identifier(tagName),
							t.identifier(btt('create')),
							true
						),
						constructor
					)
				)
			)
		);
	}

	if(mode === "$f") {
		const raw = props.find(({ key }) => key[0].type == "StringLiteral" && key[0].value == "$f")?.value as t.ArrayExpression;
		const rawElements = raw.elements as t.ArrayExpression[];
		const callSignatures = rawElements.map(el => el.elements.map(it => (it as t.StringLiteral).value));

		const objectProps = props.reduce((p,v) => {
			if(v.key.length > 1) return p;
			p[v.key[0].value] = v.value;
			return p
		}, {} as Record<string, t.Expression>)

		const callCandidates = callSignatures.map(sig => sig.map(param => objectProps[param]))
		const bestCandidate = callCandidates.sort((a, b) => b.filter(Boolean).length - a.filter(Boolean).length)[0];
		const keys = callSignatures[callCandidates.indexOf(bestCandidate)];
		const args = [];
		while(children.length || bestCandidate.length) args.push(bestCandidate.shift() || children.shift());
		const lastNonNull = args.findLastIndex(Boolean);
		const call = args.slice(0, lastNonNull + 1).map(el => el || t.identifier("undefined"));

		return withSeal(
			withAtrributes(
				props.filter(prop => prop.key.length > 1 || !keys.includes(prop.key[0].value)),
				t.callExpression(
					t.identifier(tagName),
					call
				)
			)
		)
	}

	return t.callExpression(
		t.identifier(tagName),
		[t.objectExpression([
			...props
			.filter(({ key }) => key[0].value != "$d")
			.map(
				({ key, value }) => ["StringLiteral", "BooleanLiteral"].includes(value.type) ?
					t.objectProperty(t.stringLiteral(joinKeys(...key)), value) :
					t.objectMethod("get", t.identifier(joinKeys(...key)), [], t.blockStatement([t.returnStatement(value)]))
			),
			t.objectProperty(t.stringLiteral("children"), t.arrowFunctionExpression([t.identifier("_")], t.arrayExpression(children)))
		])]
	)
    
}

function withAtrributes(props: { key: t.StringLiteral[]; value: t.Expression }[], node: t.Expression) {
	return props.reduce((acc, { key, value }) => {
		switch(true) {
			case ["$", "$c", "$d", "$f", "$n"].includes(key[0].value): return acc;
			case (
				value.type == "CallExpression" &&
				value.callee.type == "Identifier" &&
				value.callee.name == "$call"
			): return t.callExpression(
				t.memberExpression(acc, t.identifier(btt("call")), true),
				[t.arrowFunctionExpression(
					[t.identifier("_")],
					t.arrayExpression(value.arguments as (t.Expression | t.SpreadElement)[])
				), ...key]
			);
			case key[key.length - 1].value.endsWith("$"): return t.callExpression(
				t.memberExpression(acc, t.identifier(btt("call")), true),
				[t.arrowFunctionExpression(
					[t.identifier("_")],
					(value.type == "TupleExpression" || value.type == "ArrayExpression") ? t.arrayExpression(value.elements) : value
				), ...key.map((k, i) => i == key.length - 1 ? t.stringLiteral(k.value.slice(0, -1)) : k)]
			);
			case ["StringLiteral", "BooleanLiteral"].includes(value.type): return t.callExpression(
				t.memberExpression(acc, t.identifier(btt("set")), true),
				[value, ...key]
			);
			default:  return t.callExpression(
				t.memberExpression(acc, t.identifier(btt("assign")), true),
				[t.arrowFunctionExpression([t.identifier("_")], value), ...key]
			);
		}
	}, node)
}

function withChildren(children: t.Expression[], node: t.Expression) {
	if(!children || children.length == 0) return node;
	return t.callExpression(
		t.memberExpression(
			node,
			t.identifier(btt("append")),
			true
		),
		children
	)
}

function withSeal(node: t.Expression) {
	return node;
	return t.callExpression(
		t.memberExpression(
			node,
			t.identifier(btt("seal")),
			true
		),
		[]
	)
}

type childType = t.JSXElement | t.JSXExpressionContainer | t.JSXFragment | t.JSXSpreadChild | t.JSXText;

function handleChild(child: childType, mode: Mode) {
    switch(child.type) {
        case "JSXElement": return handleJSXElement(child);
        case "JSXText": {
            const text = child.value?.trim?.();
            if(!text) return;
            return t.stringLiteral(text);
        };
        case "JSXExpressionContainer": switch(child.expression.type) {
            case "JSXEmptyExpression": return;
            default: return ["$f", "$n"].includes(mode) ? child.expression : t.arrowFunctionExpression([t.identifier("_")], child.expression);
        }
        case "JSXFragment": return handleJSXElement(child);
        case "JSXSpreadChild": return;
        default: return;
    }
}

function handleAttribute(attribute: t.JSXSpreadAttribute | t.JSXAttribute, mode: Mode) {
    switch(attribute.type) {
        case "JSXAttribute": {
            const value = handleAttributeValue(attribute.value, mode);
			if(!value) return;
            return {
				key: handleAttributeName(attribute.name),
				value,
			}
        }
        case "JSXSpreadAttribute": return;
        default: return;
    }
}

function handleAttributeName(name: t.JSXAttribute["name"]) {
    switch(name?.type) {
        case "JSXIdentifier": return [t.stringLiteral(name.name)];
        case "JSXNamespacedName": return [t.stringLiteral(name.namespace.name), t.stringLiteral(name.name.name)];
    }
}

function handleAttributeValue(value: t.JSXAttribute["value"], mode: Mode) {
    switch(value?.type) {
        case "JSXElement": return handleJSXElement(value);
        case "JSXExpressionContainer": switch(value.expression.type) {
			case "JSXEmptyExpression": return;
            default: return value.expression;
        };
        case "StringLiteral": return value;
        case "JSXFragment": return handleJSXElement(value);
		case undefined: return t.booleanLiteral(true);
    }
}

function joinKeys(...keys: t.StringLiteral[]) {
	return keys.map(s => s.value).join(":");
}

function addImport(ast: ParseResult<any>, name: string, module: string) {
    let createElementImported = false;
	const as = btt(name);
    traverse(ast, {
        ImportDeclaration(path) {
            const { node } = path;
            if (node.specifiers.some(
                specifier => t.isImportSpecifier(specifier)
                // @ts-ignore
				&& specifier.local.name === as && specifier.imported.name === name
            )) {
                createElementImported = true;
            }
        }
    });

    if (!createElementImported) {
        ast.program.body.unshift(
            t.importDeclaration(
                [
                    t.importSpecifier(
                        t.identifier(as),
                        t.identifier(name)
                    )
                ],
                t.stringLiteral(module)
            )
        );
    }
}

function btt(name: string) {
	return `$btt_${name}`;
}

type Mode = "$d" | "$c" | "$f"

const modes: any = {
	"$d": true,
	"$c": true,
	"$f": true,
}