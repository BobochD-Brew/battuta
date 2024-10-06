import { PerspectiveCamera } from 'three';
import { Renderer } from 'three';
import { Scene } from 'three';

export declare function Canvas({ children, camera, scene, antialias, shadowMap, renderer, composer, controls, passes, renderPass, }: any): any;

export declare function useFrame(update: (delta: number) => void): () => ((delta: number) => void)[];

export declare const useScene: () => {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: Renderer;
    updateFunctions: ((delta: number) => void)[];
};

export { }



