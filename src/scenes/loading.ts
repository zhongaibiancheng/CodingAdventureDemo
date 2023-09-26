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

export default class LoadingScene extends Base{
    constructor(engine:Engine,scene:Scene){
        super(engine,scene);
    }
    async init(params:SceneParams|undefined):Promise<Scene>{
        this._engine.displayLoadingUI();
        //disabled any input because loading assets
        this._scene.detachControl();

        const scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        const camera = new FreeCamera("camera1",new Vector3(0,0,0),scene);
        camera.setTarget(new Vector3(0,0,0));

        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        const next = Button.CreateSimpleButton("next", "NEXT");
        next.color = "white";
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";

        guiMenu.addControl(next);

        next.onPointerUpObservable.add(() => {
            if(params && params.callback){
                params.callback();
            }
            scene.detachControl();
        })

        //--WHEN SCENE IS FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();

        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        var finishedLoading = false;
        await params.setup_game().then(res =>{
            finishedLoading = true;
        });
        return scene;
    }

    _goToCutScene():void{
        
    }
}