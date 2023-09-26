import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    FreeCamera,
    Vector3,
    Color4
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

import Base from './base'
import {SceneParams} from '../utils/const';

export default class StartScene extends Base{
    constructor(engine:Engine,scene:Scene){
        super(engine,scene);
    }
    async init(params:SceneParams|undefined):Promise<Scene>{
        this._engine.displayLoadingUI();
        this._scene.detachControl();

        const scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        const camera = new FreeCamera("camera1",new Vector3(0,0,0),scene);
        camera.setTarget(new Vector3(0,0,0));

        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const start_btn = Button.CreateSimpleButton("start","PLAY");
        start_btn.width = 0.2;
        start_btn.height = "40px";
        start_btn.color = "white";
        start_btn.top = "-14px";
        start_btn.thickness = 0;
        start_btn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        start_btn.onPointerDownObservable.add(()=>{
            if(params && params.callback){
                params.callback();
            }
            scene.detachControl();
        })
        guiMenu.addControl(start_btn);

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        return scene;
    }

    _goToCutScene():void{

    }
}