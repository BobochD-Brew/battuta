import parser, { ParseResult } from '@babel/parser';
import generateRaw from '@babel/generator';
import traverseRaw, { NodePath, VisitNode } from '@babel/traverse';
import * as t from '@babel/types';
import { svgTags, tags } from './tags';
const traverse = (traverseRaw as any).default as typeof traverseRaw;
const generate = (generateRaw as any).default as typeof generateRaw;

const module = "battuta/runtime";

export function transformJSX(jsCode: string) {
    const ast = parser.parse(jsCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
    });

    traverse(ast, {
        JSXElement: (path) => {path.replaceWith(handleJSXElement(path.node, "$d") || t.nullLiteral())},
    })

    addImport(ast, "createElement");
    addImport(ast, "createSVGElement");
    addImport(ast, "create");
    addImport(ast, "assign");
    addImport(ast, "set");
    addImport(ast, "call");
    addImport(ast, "append");

    return generate(ast, {}, jsCode);
}

function handleJSXElement(node: t.JSXElement, mode: Mode): t.Expression | null {
    const openingElement = node.openingElement;

    let tagName = ""; switch(openingElement.name.type) {
        case "JSXIdentifier": tagName = openingElement.name.name; break;
        case "JSXNamespacedName": tagName = openingElement.name.name.name; break;
        // @ts-ignore
        case "JSXMemberExpression": tagName = openingElement.name.object.name + "." + openingElement.name.property.name; break;
    }

	const isMode = modes[tagName];
	if(isMode) mode = tagName as Mode;
	// @ts-ignore
	const hasMode = openingElement.attributes.find(a => a.type === "JSXAttribute" && a.name.type == "JSXIdentifier" && modes[a.name.name])?.name?.name as Mode;
	if(hasMode) mode = hasMode;
	const isTag = tags[tagName];
	const isSVGTag = (svgTags as any)[tagName];

    const props = openingElement.attributes.map(a=>handleAttribute(a, mode)!).filter(Boolean);
	const constructor = mode == "$c" && props.find(({ key }) => key[0].type == "StringLiteral" && key[0].value == "$c")?.value;
    const children = node.children.map(c=>handleChild(c, mode)!).filter(Boolean);
	
	switch(true) {
		case isMode: return <$f>
			<switch on={children.length}>
				<case is={0} so={null}/>
				<case is={1} so={children[0]}/>
				<case default>
					<t.arrayExpression>{children}</t.arrayExpression>
				</case>
			</switch>
		</$f>

		case tagName === "array": return <$f>
			<t.arrayExpression>{children}</t.arrayExpression>
		</$f>

		case tagName === "switch": return <$f>
			<t.callExpression>
				<t.arrowFunctionExpression>
					<array>
						<t.identifier>_</t.identifier>
					</array>
					<t.blockStatement>
						<array>
							<t.switchStatement>
								{props.find(it => it.key[0].value == "on")?.value}
								{node.children
									.filter(child => child.type == "JSXElement")
									.filter(child => child.openingElement.name.type == "JSXIdentifier")
									.filter(child => (child.openingElement.name as any).name == "case")
									.map(child => {
										const isDefault = child.openingElement.attributes
											.filter(it => it.type == "JSXAttribute")
											.filter(it => it.name.type == "JSXIdentifier")
											.find(it => it.name.name == "default")

										const propValue = child.openingElement.attributes
											.filter(it => it.type == "JSXAttribute")
											.filter(it => it.name.type == "JSXIdentifier")
											.find(it => it.name.name == "is")
											?.value

										const propResult = child.openingElement.attributes
											.filter(it => it.type == "JSXAttribute")
											.filter(it => it.name.type == "JSXIdentifier")
											.find(it => it.name.name == "so")
											?.value

										const value = propValue?.type == "StringLiteral" ? propValue : propValue?.type == "JSXExpressionContainer" ? propValue.expression : t.identifier("NaN");
										const childrens = child.children.map(c => handleChild(c, mode)).filter(Boolean) as t.Expression[];
										let result = propResult?.type == "StringLiteral" ? propResult : propResult?.type == "JSXExpressionContainer" ? (propResult.expression.type == "JSXEmptyExpression" ? null : propResult.expression) : propResult?.type == "JSXElement" ? handleJSXElement(propResult, mode) : null;
										result ||= childrens.length == 1 ? childrens[0] : childrens.length == 0 ? t.nullLiteral() : t.arrayExpression(childrens);

										return <$f>
											<t.switchCase>
												{isDefault ? null : value}
												<array>
													<t.returnStatement>
														{result}
													</t.returnStatement>
												</array>
											</t.switchCase>
										</$f>
									}) as any
								}
							</t.switchStatement>
						</array>
					</t.blockStatement>
				</t.arrowFunctionExpression>
				<array/>
			</t.callExpression>
		</$f>

        case isTag: return withChildren(
			children,
			withAtrributes(
				props,
				t.callExpression(
					t.identifier(isSVGTag ? btt('createSVGElement') : btt('createElement')),
					[t.stringLiteral(tagName)]
				)
			)
		);

		case mode === "$c": return withChildren(
			children,
			withAtrributes(
				props,
				t.callExpression(
					t.memberExpression(
						t.identifier(tagName),
						t.identifier(btt('create')),
						true
					), (constructor && constructor.type == "ArrayExpression") ? constructor.elements.map(x => x ? x : t.nullLiteral()) : []
				)
			)
		);
		
		case mode === "$n": return withAtrributes(
			props,
			t.callExpression(
				t.memberExpression(
					t.identifier(tagName),
					t.identifier(btt('create')),
					true
				), children
			)
		)

		case mode === "$f": return withAtrributes(
			props,
			t.callExpression(
				t.identifier(tagName),
				children
			)
		)

        default: return t.callExpression(
			t.identifier(tagName),
			[t.objectExpression([
				...props.map(
					({ key, value }) => ["StringLiteral", "BooleanLiteral"].includes(value.type) ?
						t.objectProperty(t.stringLiteral(joinKeys(...key)), value) :
						t.objectMethod("get", t.identifier(joinKeys(...key)), [], t.blockStatement([t.returnStatement(value)]))
				),
				t.objectProperty(t.stringLiteral("children"), t.arrowFunctionExpression([t.identifier("_")], t.arrayExpression(children)))
			])]
		)
    }
    
}

function withAtrributes(props: { key: t.StringLiteral[]; value: t.Expression }[], node: t.Expression) {
	return props.reduce((acc, { key, value }) => {
		switch(true) {
			case key[0].type == "StringLiteral" && key[0].value == "$": return acc;
			case ["StringLiteral", "BooleanLiteral"].includes(value.type): return t.callExpression(
				t.memberExpression(acc, t.identifier(btt("set")), true),
				[value, ...key]
			);
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

type childType = t.JSXElement | t.JSXExpressionContainer | t.JSXFragment | t.JSXSpreadChild | t.JSXText;

function handleChild(child: childType, mode: Mode) {
    switch(child.type) {
        case "JSXElement": return handleJSXElement(child, mode);
        case "JSXText": {
            const text = child.value?.trim?.();
            if(!text) return;
            return t.stringLiteral(text);
        };
        case "JSXExpressionContainer": switch(child.expression.type) {
            case "JSXEmptyExpression": return;
            default: return ["$f", "$n"].includes(mode) ? child.expression : t.arrowFunctionExpression([t.identifier("_")], child.expression);
        }
        case "JSXFragment": return;
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
        case "JSXElement": return handleJSXElement(value, mode);
        case "JSXExpressionContainer": switch(value.expression.type) {
			case "JSXEmptyExpression": return;
            default: return value.expression;
        };
        case "StringLiteral": return value;
        case "JSXFragment": return;
		case undefined: return t.booleanLiteral(true);
    }
}

function joinKeys(...keys: t.StringLiteral[]) {
	return keys.map(s => s.value).join(":");
}

function addImport(ast: ParseResult<any>, name: string) {
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

type Mode = "$d" | "$c" | "$f" | "$n"

const modes: any = {
	"$d": true,
	"$c": true,
	"$f": true,
	"$n": true,
}