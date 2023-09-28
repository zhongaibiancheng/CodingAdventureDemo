import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
    Engine, Scene,
    FreeCamera,
    Vector3,
    Color4,
    
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control,Image } from "@babylonjs/gui";

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

        let finished_anim = false;
        let anims_loaded = 0;

        //Animations
        const beginning_anim = new Image("beginning_anim","./sprites/beginning_anim.png");
        beginning_anim.stretch = Image.STRETCH_UNIFORM;
        beginning_anim.cellId = 0;
        beginning_anim.cellHeight = 480;
        beginning_anim.cellWidth = 480;
        beginning_anim.sourceWidth = 480;
        beginning_anim.sourceHeight = 480;
        guiMenu.addControl(beginning_anim);

        beginning_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })
        const working_anim = new Image("sparkLife", "./sprites/working_anim.png");
        working_anim.stretch = Image.STRETCH_UNIFORM;
        working_anim.cellId = 0;
        working_anim.cellHeight = 480;
        working_anim.cellWidth = 480;
        working_anim.sourceWidth = 480;
        working_anim.sourceHeight = 480;
        working_anim.isVisible = false;
        guiMenu.addControl(working_anim);

        working_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })
        const dropoff_anim = new Image("sparkLife", "./sprites/dropoff_anim.png");
        dropoff_anim.stretch = Image.STRETCH_UNIFORM;
        dropoff_anim.cellId = 0;
        dropoff_anim.cellHeight = 480;
        dropoff_anim.cellWidth = 480;
        dropoff_anim.sourceWidth = 480;
        dropoff_anim.sourceHeight = 480;
        dropoff_anim.isVisible = false;
        guiMenu.addControl(dropoff_anim);
        dropoff_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })
        const leaving_anim = new Image("sparkLife", "./sprites/leaving_anim.png");
        leaving_anim.stretch = Image.STRETCH_UNIFORM;
        leaving_anim.cellId = 0;
        leaving_anim.cellHeight = 480;
        leaving_anim.cellWidth = 480;
        leaving_anim.sourceWidth = 480;
        leaving_anim.sourceHeight = 480;
        leaving_anim.isVisible = false;
        guiMenu.addControl(leaving_anim);

        leaving_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })
        const watermelon_anim = new Image("sparkLife", "./sprites/watermelon_anim.png");
        watermelon_anim.stretch = Image.STRETCH_UNIFORM;
        watermelon_anim.cellId = 0;
        watermelon_anim.cellHeight = 480;
        watermelon_anim.cellWidth = 480;
        watermelon_anim.sourceWidth = 480;
        watermelon_anim.sourceHeight = 480;
        watermelon_anim.isVisible = false;
        guiMenu.addControl(watermelon_anim);

        watermelon_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })

        const reading_anim = new Image("sparkLife", "./sprites/reading_anim.png");
        reading_anim.stretch = Image.STRETCH_UNIFORM;
        reading_anim.cellId = 0;
        reading_anim.cellHeight = 480;
        reading_anim.cellWidth = 480;
        reading_anim.sourceWidth = 480;
        reading_anim.sourceHeight = 480;
        reading_anim.isVisible = false;
        guiMenu.addControl(reading_anim);
        reading_anim.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })

        //Dialogue animations
        const dialogueBg = new Image("sparkLife", "./sprites/bg_anim_text_dialogue.png");
        dialogueBg.stretch = Image.STRETCH_UNIFORM;
        dialogueBg.cellId = 0;
        dialogueBg.cellHeight = 480;
        dialogueBg.cellWidth = 480;
        dialogueBg.sourceWidth = 480;
        dialogueBg.sourceHeight = 480;
        dialogueBg.horizontalAlignment = 0;
        dialogueBg.verticalAlignment = 0;
        dialogueBg.isVisible = false;
        guiMenu.addControl(dialogueBg);
        dialogueBg.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })

        const dialogue = new Image("sparkLife", "./sprites/text_dialogue.png");
        dialogue.stretch = Image.STRETCH_UNIFORM;
        dialogue.cellId = 0;
        dialogue.cellHeight = 480;
        dialogue.cellWidth = 480;
        dialogue.sourceWidth = 480;
        dialogue.sourceHeight = 480;
        dialogue.horizontalAlignment = 0;
        dialogue.verticalAlignment = 0;
        dialogue.isVisible = false;
        guiMenu.addControl(dialogue);
        dialogue.onImageLoadedObservable.add(() => {
            anims_loaded++;
        })

        //looping animation for the dialogue background
        let dialogueTimer = setInterval(() => {
            if(finished_anim && dialogueBg.cellId < 3){
                dialogueBg.cellId++;
            } else {
                dialogueBg.cellId = 0;
            }
        }, 250);

    //--PLAYING ANIMATIONS--
    let animTimer;
    let anim2Timer;
    let transition = 0;

    let anim = 1; //keeps track of which animation we're playing
    //sets up the state machines for animations
    this._scene.onBeforeRenderObservable.add(() => {
        console.log("sets up the state machines for animations");
        if(anims_loaded == 8) {
            this._engine.hideLoadingUI();
            anims_loaded = 0;

            //animation sequence
            animTimer = setInterval(() => {
                switch(anim) {
                    case 1:
                        if(beginning_anim.cellId == 9){ //each animation could have a different number of frames
                            anim++;
                            beginning_anim.isVisible = false; // current animation hidden
                            working_anim.isVisible = true; // show the next animation
                        } else {
                            beginning_anim.cellId++;
                        }
                        break;
                    case 2:
                        if(working_anim.cellId == 11){
                            anim++;
                            working_anim.isVisible = false;
                            dropoff_anim.isVisible = true;
                        } else {
                            working_anim.cellId++;
                        }
                        break;
                    case 3:
                        if(dropoff_anim.cellId == 11){
                            anim++;
                            dropoff_anim.isVisible = false;
                            leaving_anim.isVisible = true;
                        } else {
                            dropoff_anim.cellId++;
                        }
                        break;
                    case 4:
                        if(leaving_anim.cellId == 9){
                            anim++;
                            leaving_anim.isVisible = false;
                            watermelon_anim.isVisible = true;
                        } else {
                            leaving_anim.cellId++;
                        }
                        break;
                    default:
                        break;
                }   
            }, 250);

            //animation sequence 2 that uses a different time interval
            anim2Timer = setInterval(() => {
                switch(anim) {
                    case 5:
                        if(watermelon_anim.cellId == 8){
                            anim++;
                            watermelon_anim.isVisible = false;
                            reading_anim.isVisible = true;
                        } else {
                            watermelon_anim.cellId++;
                        }
                        break;
                    case 6:
                        if(reading_anim.cellId == 11){
                            reading_anim.isVisible = false;
                            finished_anim = true;
                            dialogueBg.isVisible = true;
                            dialogue.isVisible = true;
                            next.isVisible = true;
                        } else {
                            reading_anim.cellId++;
                        }
                        break;
                }
            }, 750);
        }
    });

        //--PROGRESS DIALOGUE--
        const next = Button.CreateImageOnlyButton("next", "./sprites/arrowBtn.png");
        next.rotation = Math.PI / 2;
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";
        next.isVisible = false;
        guiMenu.addControl(next);

        next.onPointerUpObservable.add(() => {
            if (transition == 8) { //once we reach the last dialogue frame, goToGame
                this._scene.detachControl();
                this._engine.displayLoadingUI(); //if the game hasn't loaded yet, we'll see a loading screen
                transition = 0;
                // canplay = true;
                if(params && params.callback){
                    params.callback();
                }
                scene.detachControl();
            } else if(transition < 8){ // 8 frames of dialogue
                transition++;
                dialogue.cellId++;
            }
        });

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

}