# Battuta

a sketchy experimental frontend framework
highly inspired from [solidjs](https://www.solidjs.com/) and [solid-three](https://github.com/solidjs-community/solid-three)  

## Setup a new project

#### Web: `npx battuta init`

then run it with `npm run dev`

## Table of Contents

- [Setup](#setup-a-new-project)
- [JSX](#jsx)
    - [Default Mode](#default-mode---d)
    - [Class Mode](#class-mode---c)
    - [Function Mode](#function-mode---f)
    - [Mixed Mode](#mixed-mode---n)
- [Contexts](#contexts)
- [Hooks](#some-hooks)
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

the JSX compiler use a mode system that change how jsx expressions are compiled.
to switch between modes you can use `$` utils like this:

```tsx
// as a separate tag
<$f> {/* Function Mode */}
    <Component>
        <Child/>  {/* affected */}
        {() => <Child/>} {/* not affected */}
    </Component>
</$f>

// inside a tag
<Component $f>
    <Child/>  {/* affected */}
    {() => <Child/>} {/* not affected */}
</Component>
```

> I hate to have to do it this way but it's the best I found yet

### Default Mode - $d

the default mode compile JSX expressions to match the react component apis, as solid it use accesors for props

```tsx
<Component key1={value()} key2="value">
    <div/>
    <div/>
</Component>

// turns into
const createElement = document.bind(document);

Component({
    get key1() { return value() },
    key2: "value",
    children: () => [ createElement("div"), createElement("div") ]
})
```

### Class Mode - $c

the class mode allow to use already existing classes in JSX and compose them

```tsx
import { create, appendMultiple, set, assign, call } from "battuta/runtime"

const group = <THREE.Group $c>
    <THREE.PointLight
        $c={[0xffff00, 2, 100]}
        color:set={$call(color())}
        position:y={positionY()}
        position:x={1}
        castShadow
    />
</THREE.Group>

// turns into

const group = THREE.Group[create]() // by default -> new THREE.Group()
    [appendMultiple](
        THREE.PointLight[create](0xffff00, 2, 100)
            [call](() => color(), "color", "set") // calls light.color.set(color()) when color get updated
            [assign](() => position(), "position", "y")
            [set](1, "position", "x")
            [set](true, "castShadow")
    )
```

for this to work some methods need to be implmented on the parent prototypes, by default Object instances define default implementations that can be overwriten, at least `empty`, `children`, `insert` and `remove` need to be implemented, those last two should never be called directly, instead use the `useAppend` & `useRemove` hooks or the `append` and `cleanup` methods

this is an example in the case of threejs

```ts
import { append, remove, children, empty } from "battuta/runtime";
import { Object3D, Group } from "three";

Object3D.prototype[insert] = function(child: any, index?: number){
    this.add(child);
    return this;
}

Object3D.prototype[remove] = function(){
    return this.removeFromParent();
}

Object3D.prototype[children] = function(){
    return this.children;
}

Object3D.prototype[empty] = function(){
    return new Group();
}
```

### Function Mode - $f

the function mode allow to compose functions with each other

```tsx
const switchCase = <t.switchCase $f>
    {value}
    <array>
        <t.returnStatement>
            {result}
        </t.returnStatement>
    </array>
</t.switchCase>

// turns into

const switchStatment = t.switchCase(value, [ t.returnStatment(result) ])
```

### Mixed Mode - $n

the mixed mode is a mix between the class mode and the function mode

```tsx
const boxMesh = <Mesh $n
    castShadow
    receiveShadow
>
    <BoxGeometry/>
    <MeshPhongMaterial
        color:set={$call(color())}
    />
</Mesh>

// turns into

const boxMesh = Mesh[create]( 
    BoxGeometry[create](), // this return new BoxGeometry()
    MeshPhongMaterial[create]()
        [call](() => color(), "color", "set")
)
    [set](true, "castShadow")
    [set](true, "receiveShadow")
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

    const child1 = <Child/> // run outside the EventsProvider so can't access the context
    const child2 = () => <Child/> // run inside the EventsProvider

    doSomething(<Child/>) // run outside the doSomething function

    return <EventsProvider>
        <Child/>
        {child1}
        {child2}
    <EventsProvider>
}

```

## Some Hooks

quick examples of some builtin hooks

```tsx

function Component() {

    const add = useAppend();
    // append the child to the closest real element
    // derivate from the current context
    // (more on this bellow) 
    add(<Child />) 

    const remove = useRemove();
    remove(); // remove this component & the elements bellow the current context

    onCleanup(() => {
        // component has been removed
        // atm there's no way to unmount -> remount
    })

    // useEffect can be used outside of components and JSX
    useEffect(() => {
        reactive() + 1;
    })

    useDebounced(() => {
        reactive() + 1;
    }, 1000)

    // for now only inside the Canvas helper in battuta/three

    const { camera, scene } = useScene();
    useFrame((delta) => {})

    // TweakPanel wrappers
    const [getValue, setValue] = createTweakSignal("#ffffff");
    useMonitor(() => Date.now())
}
```

Even tho there's no virtual dom we still has virtual relations & contexts. For example in this situation

```tsx
const Component = () => () => () => () => () => {
    return <h1>Hello</h1>
}

const div = <div/>
```

the real tree looks like

```
- div
|---- h1
```

tho in relatity the relations look like this

```
- div
|---- f1
|   |---- f2
|       |---- f3
|           |---- f4
|               |---- f5
|-------------------|---- h1
```

the real tree is still composed just of the div and the h1 elements but the intermediary contexts exist (if consumed) so here each element are bound to their parent.

one thing to keep in mind is the virtual element exist only if the real elements received an uncalled function, this happens by default to components in the normal mode as their children prop is a function but for other modes it is not the case, so for example here

```tsx
function Child() {
    return <h1/>
}

function Parent() {
    return <div>
        <Child/>
    </div>
}
```

here two uncommon things happen, first here's the relation map of this code

```
- Parent (virtual, assuming it was used in a default mode component)
|---- div
|   |---- h1
|---- Child
```

You can see the the child function don't appear where it should, this happens because the compilation result here is 


```ts
function Parent() {
    return createElement(div)[append](Child())
}
```

the div only receive the result of the child which is the second div so it never knows about the Child context, this generally don't cause issues as the div don't hold any special context.

the second uncommon behavior is that if you have a `onCleanup` hook in your Child the Child is gonna consume from the parenting context, which in this case is the Parent element, this doesn't cause issues unless you're directly removing the div separatly using the `cleanup` method, in this case the div will be removed as well as the h1 but the `onCleanup` hook won't run for the child as it's bound to the Parent component

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

import { battutaJSX } from "battuta/vite";

export default defineConfig({
    plugins: [
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