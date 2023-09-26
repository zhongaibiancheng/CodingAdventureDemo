import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene, ArcRotateCamera, 
    FreeCamera,
    Vector3, HemisphericLight, Mesh, MeshBuilder, 
    Color4, 
    Camera,
    CubeMapToSphericalPolynomialTools} from "@babylonjs/core";

import {SceneParams} from '../utils/const';
export default abstract class Base{
    _engine:Engine;
    _scene:Scene;
    
    constructor(engine:Engine,scene:Scene){
        this._engine = engine;
        this._scene = scene;
    }
    abstract init(params:SceneParams |undefined):Promise<Scene>;
}
