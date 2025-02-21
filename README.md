# Battuta

a sketchy experimental frontend framework
highly inspired from [solidjs](https://www.solidjs.com/) and [solid-three](https://github.com/solidjs-community/solid-three)  

## Setup a new project

#### Web: `npx battuta init`

then run it with `npm run dev`

## Table of Contents

- [Setup](#setup-a-new-project)
- [JSX](#jsx)
    - [DOM](#dom)
    - [Components](#components)
    - [Constructors](#constructors)
    - [Functions](#functions)
- [Contexts](#contexts)
- [CLI](#cli)
- [Vite](#use-with-vite)
    - [All In One](#all-in-one-plugin)
    - [JSX](#jsx-1)
    - [Optimizer](#optimizer)
    - [Macros](#macros)
    - [Virtual Root](#virtual-root)
    - [Folders](#folders)
    - [Config](#config)
- [JS API](#transformation-apis)

## JSX

JSX expressions are compiled differently based on the type of tag used

### DOM

This expression:
```tsx
<div style:color={color()}>
    {value()}
</div>
```
Transforms to:
```tsx
createElement("div")
    [assign](() => color(), "style", "color")
    [append](() => value())
```

### Components

Given
```tsx
function Component(props) {
    return <div>{props.value}</div>
}
```
This expression:
```tsx
<Component value={value()}>
```
Transforms to:
```tsx
Component({ get value() { return value() } })
```

### Constructors

Given
```tsx
class A {
    prop = 0;
    constructor(arg_2);
    constructor(arg_1, arg_2, arg_3) {}
}
```
Those expressions:
```tsx
<A arg_2={value_2()} prop={value_3()}>
<A arg_2={value_2()} arg_3={value_4()} prop={value_3()}>
```
Transform to:
```tsx
A[create](value_2())
    [assign](() => value_3(), "prop")
A[create](undefined, value_2(), value_4())
    [assign](() => value_3(), "prop")
```

> The props names are matched with the args names

### Functions

Given
```tsx
function F(first: string, second: number) {}
```
Those expressions:
```tsx
<F first={value_1()} second={value_2()}>
<F second={value_2()} prop={value_3()}>
```
Transform to:
```tsx
F(value_1(), value_2())
F(undefined, value_2())
    [assign](() => value_3(), "prop")
```

for this to work some methods need to be implemented on the parent prototypes, by default Object instances define default implementations that can be overwriten, at least `insert` and `remove` need to be implemented

this is an example in the case of threejs

```ts
import { append, remove, childrenIndex, empty } from "battuta/runtime";
import { Object3D, Group } from "three";

// required 
Object3D.prototype[insert] = function(child: any, index?: number){
    this.add(child);
    return this;
}

// required 
Object3D.prototype[remove] = function(){
    this.removeFromParent();
    return this;
}

// not needed if the childrens order doesn't matter 
Object3D.prototype[childrenIndex] = function(child){
    return this.children.indexOf(child);
}

// not needed if the childrens order doesn't matter 
Object3D.prototype[empty] = function(){
    return new Group();
}

// implemented by default, can be overwriten
Object3D.prototype[create] = function (...props) {
    return Reflect.construct(this as any, props);
}

// implemented by default, can be overwriten
Object3D.prototype[set] = function (value, ...keys) {
    const key = keys.pop()!;
    resolveObj(this, keys)[key] = value;
    return this;
}

// implemented by default, can be overwriten
Object3D.prototype[assign] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    useEffect(() => target[key] = value());
    return this;
}

// implemented by default, can be overwriten
Object3D.prototype[call] = function (value, ...keys) {
    const key = keys.pop()!;
    const target = resolveObj(this, keys);
    const f = target[key].bind(target);
    useEffect(() => f(...value()));
    return this;
}
```

## Contexts

like other frameworks it also support contexts

```tsx
const [ useValue, ValueProvider ] = createContext((props) => {
    const [ getValue, setValue ] = createSignal();

    return {
        getValue,
        setValue,
    }
})

function App() {
    return <ValueProvider>
        <Component/>
    </ValueProvider>
}

const [ useEvents, EventsProvider ] = createContext(() => new EventTarget());

function Component() {

    const { getValue, setValue } = useValue();

    const child1 = <Child/>
    const child2 = () => <Child/>

    return <EventsProvider>
        <Child/> {/* run inside the EventsProvider */}
        {child1} {/* run outside the EventsProvider */}
        {child2} {/* run inside the EventsProvider */}
    <EventsProvider>
}

```

## CLI

`battuta init` create a new empty project\
`battuta bundle` use vite to bundle the app\
`battuta dev` open the vite dev server\
`battuta compile <file>` transform the given file\
`battuta compile:jsx <file>` transform the given file's jsx expressions\
`battuta optimize <file>` run the optimization steps (no terser minification)\
`battuta optimize:strings <file>`\
`battuta optimize:functions <file>`

## Use with vite

As the framework is mostly a vite wrapper you can also use it with vite directly, or by part.

### Vite plugins

#### All in one plugin

the default export of `battuta/vite` is a plugin containing all the plugins as well as the default vite config

```ts

import battutaPlugin from "battuta/vite";

export default defineConfig({
    plugins: [
        // optional config
        battutaPlugin({
            // options for the bun macros plugin
            macros: Options,
            root: "src/main.tsx",
            optimizer: {
                strings: true,
                functions: true,
            },
        })
    ]
})
```

> [sources](/lib/vite/index.ts)

#### JSX

the `battutaJSX` plugin handle the JSX transformations

```ts

import { battutaJSX, battutaInferModes } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaInferModes(),
        battutaJSX()
    ]
})
```

> [sources](/lib/compiler/jsx.tsx)

#### Optimizer

battuta mostly use the [terser]() integration in vite to optimize and minify builds, the `battutaOptimizer` act as a preparation step before terser to help improve the build.

```ts

import { battutaOptimizer } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaOptimizer({
            strings: true,
            functions: true,
        })
    ]
})
```

the strings optimizer catch all string duplicates in the codebase (happens a lot with JSX) and merge them in const declarations which can be minified

the functions optimizer raise function definitions to the highest scope it can reach, for example 

this piece of code:

```ts
function doSomething(arg) {
    return [
        () => args
            .filter(x => x > 10)
            .map(x => x ** 2)
            .filter(x => x < 1000)
            .forEach(x => console.log(x)),
        () => false
    ]
}

```

becomes this:

```ts
const f1 = x => x > 10;
const f2 = x => x ** 2;
const f3 = x => x < 1000;
const f4 = x => console.log(x);
const f5 = () => false;

function doSomething(arg) {
    return [
        () => args
            .filter(f1)
            .map(f2)
            .filter(f3)
            .forEach(f4),
        f5
    ]
}
```

I have no idea if this may break some libs or if it has any benefit, but I wanned to try that

> [sources](/lib/optimizer/index.ts)

#### Macros

the `battutaMacros` plugin is a simple fork of [unplugin-macros](https://github.com/unplugin/unplugin-macros) exposing the AST to the macro and allowing it to inject raw js code. checkout [the css macro](/lib/macros/css.ts) for an example

```ts

import { battutaMacros } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaMacros()
    ]
})
```

> [sources](https://github.com/BobochD-Brew/unplugin-macros)

#### Virtual Root

the `battutaVirtualRoot` plugin create the index.html file, for now it just allow to remove it from the repo

```ts

import { battutaVirtualRoot } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaVirtualRoot()
    ]
})
```

> [sources](/lib/vite/virtual-root.ts)

#### Folders

the `battutaFolders` plugin moves the content of the `.temp` to the `.dist` folder during the build

```ts

import { battutaFolders } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaFolders()
    ]
})
```

> [sources](/lib/vite/build-folders.ts)

#### Config

the `battutaConfig` export contain the default config plugin

```ts

import { battutaConfig } from "battuta/vite";

export default defineConfig({
    plugins: [
        battutaConfig()
    ]
})
```

> [sources](/lib/vite/index.ts)

## Transformation APIs

CLI actions are also available from javascript

```ts
import { compile, transformJSX } from "battuta/compiler";
import { optimize, optimizeStrings } from "battuta/optimizer";

const { code } = transformJSX(`
    <div></div>
`);
```