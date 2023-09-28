import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    FreeCamera,
    Vector3,
    Color4,
    ArcRotateCamera,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PointLight,
    Color3,
    ShadowGenerator
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

import Base from './base'
import {SceneParams} from '../utils/const';
import PlayerController from "../controllers/playController";
import InputController from '../controllers/inputController';

import GUI from '../ui/ui';

export default class GameScene extends Base{
    _player_mesh:Mesh;
    _player:PlayerController;

    gui:AdvancedDynamicTexture;
    constructor(engine:Engine,scene:Scene){
        super(engine,scene);
    }
    private async _initializeGameAsync(scene): Promise<void> {
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;
    
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;
    
        const input = new InputController(scene);
        //Create the player
        this._player = new PlayerController(
            this._player_mesh, 
            scene, 
            shadowGenerator,
            input);
        
        this._player.activatePlayerCamera();
    }
    async init(params:SceneParams|undefined):Promise<Scene>{
        this._player_mesh = params.player_mesh;

        this._scene.detachControl();

        const scene = params.game_scene;
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        playerUI.idealHeight = 720;

        //create a simple button
        const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
        loseBtn.width = 0.2
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);

        loseBtn.onPointerUpObservable.add(() => {
            if(params && params.callback){
                params.callback();
            }
            scene.detachControl();
        })

        await this._initializeGameAsync(scene);
        
         //--WHEN SCENE IS FINISHED LOADING--
        await scene.whenReadyAsync();
        scene.getMeshByName("outer").position = scene.getTransformNodeByName("startPosition").getAbsolutePosition(); //move the player to the start position

        params.environment.checkLanterns(this._player);

        const gui = new GUI(scene,this._player.camera);
        gui.startTimer();
        gui.startSparklerTimer();

        scene.registerBeforeRender(()=>{
            gui.updateHud();
        });


        scene.onBeforeRenderObservable.add(() => {
            // //reset the sparkler timer
            // if (this._player.sparkReset) {
            //     gui.startSparklerTimer();
            //     this._player.sparkReset = false;
            // }
            // //stop the sparkler timer after 20 seconds
            // else if (this._ui.stopSpark && this._player.sparkLit) {
            //     gui.stopSparklerTimer();
            //     this._player.sparkLit = false;
            // }
            // when the game isn't paused, update the timer
            if (!gui.gamePaused) {
                gui.updateHud();
            }
        });

        return scene;
    }

    _goToCutScene():void{
        
    }
}