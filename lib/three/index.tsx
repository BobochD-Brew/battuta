import { append, children, cleanup, empty, insert, remove } from "@runtime";
import { createSignal, useEffect } from "@signals";
import { aspectRatio, height, width } from "../signals/screen";
import { Clock, Controls, Group, Object3D, PCFSoftShadowMap, PerspectiveCamera, Renderer, Scene, Vector2, WebGLRenderer } from "three";
import { EffectComposer, OrbitControls, RenderPass } from "three/examples/jsm/Addons.js";
import { createContext } from "../contexts";
import { onCleanup } from "../hooks";

Object3D.prototype[insert] = function(child: any){
    this.add(child);
    return this;
}

Object3D.prototype[children] = function(){
    return this.children;
}

Object3D.prototype[remove] = function(){
    return this.removeFromParent();
}

Object3D.prototype[empty] = function(){
    return new Group()
}

const [ useScene, CanvasContext ] = createContext<{
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: Renderer,
    updateFunctions: ((delta: number) => void)[],
}>(props => props);

export {
    useScene
}

export function useFrame(update: (delta: number) => void) {
    const { updateFunctions } = useScene();
    updateFunctions.push(update);
    const dispose = () => updateFunctions.splice(updateFunctions.indexOf(update), 1);
    onCleanup(dispose);
    return dispose;
}

export function Canvas({
    children,
    camera,
    scene,
    antialias,
    shadowMap,
    renderer,
    composer,
    controls,
    passes,
    renderPass,
}: any) {

    camera ??= new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene ??= new Scene();
    renderer ??= new WebGLRenderer({ antialias });
    composer ??= new EffectComposer(renderer);
    controls ??= new OrbitControls(camera, renderer.domElement);
    passes ??= [];
    renderPass ??= new RenderPass(scene, camera);

    if(shadowMap) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;
    }

    useEffect(() => {
        camera.aspect = aspectRatio();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height());
        renderer.domElement.style.width = "100vw";
        renderer.domElement.style.height = "100vh";
        renderer.setPixelRatio(window.devicePixelRatio);
    })

    composer.addPass(renderPass);
    passes.forEach((pass: any) => composer.addPass(pass));

    const updateFunctions: ((delta: number) => void)[] = [];

    const clock = new Clock();
    let disposed = false;

    function animate() {
        if(disposed) return;
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta();
        updateFunctions.forEach(x => x(deltaTime));
        composer.render();
    }

    animate();

    onCleanup(() => {
        disposed = true;
        renderer.dispose();
        renderPass.dispose();
        composer.dispose();
        controls.dispose();
        camera[cleanup]();
        scene[cleanup]();
    })

    return <CanvasContext
        scene={scene}
        camera={camera}
        renderer={renderer}
        updateFunctions={updateFunctions}
    >
        {(scene[append](children), undefined)}
        {renderer.domElement}
    </CanvasContext>
}