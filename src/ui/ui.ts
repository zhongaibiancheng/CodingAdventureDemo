import { Camera, Effect, PostProcess, Scene } from "@babylonjs/core";
import { TextBlock, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control, Grid } from "@babylonjs/gui";

export default class GUI{
    private _scene:Scene;
    private _camera:Camera;

    private _lanternCnt:TextBlock;
    private _clockTime:TextBlock;
    private _sparklerLife:Image;
    private _spark:Image;

    private _startTime:number;
    private _stopTimer:boolean;
    private _prevTime:number;
    private time:number;
    private _sString = "00";
    private _mString = 11;
    private pauseBtn:Button;

    private _pauseMenu:Rectangle;

    private gamePaused:boolean;
    private _gui:AdvancedDynamicTexture;
    private _controls:Rectangle;
    private fadeLevel:number;

    private transition:boolean;
    constructor(scene,camera){
        this._scene = scene;
        this._camera = camera;

        const gui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
        const lanternCnt = new TextBlock("lantern count","");
        lanternCnt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        lanternCnt.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        lanternCnt.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
        lanternCnt.resizeToFit = true;

        lanternCnt.fontSize = "22px";
        lanternCnt.color = "white";
        lanternCnt.text = "Lanterns: 1 / 22";
        lanternCnt.top = "32px";
        lanternCnt.left = "-64px";
        lanternCnt.width = "25%";
        lanternCnt.fontFamily = "Viga";

        gui.addControl(lanternCnt);

        this._lanternCnt = lanternCnt;

        const stackPanel = new StackPanel();
        stackPanel.height = "100%";
        stackPanel.width = "100%";
        stackPanel.top = "14px";
        stackPanel.verticalAlignment = 0;
        gui.addControl(stackPanel);

        const clockTime = new TextBlock("clock time");
        // clockTime.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        clockTime.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        clockTime.resizeToFit = true;
        clockTime.fontSize = "48px";
        clockTime.color = "white";
        clockTime.text = "11:00";
        clockTime.height = "96px";
        clockTime.width = "220px";
        clockTime.fontFamily = "Viga";

        stackPanel.addControl(clockTime);

        this._clockTime = clockTime;

        //sparkler bar animation
        const sparklerLife = new Image("sparkLife", "./sprites/sparkLife.png");
        sparklerLife.width = "54px";
        sparklerLife.height = "162px";
        sparklerLife.cellId = 0;
        sparklerLife.cellHeight = 108;
        sparklerLife.cellWidth = 36;
        sparklerLife.sourceWidth = 36;
        sparklerLife.sourceHeight = 108;
        sparklerLife.horizontalAlignment = 0;
        sparklerLife.verticalAlignment = 0;
        sparklerLife.left = "14px";
        sparklerLife.top = "14px";
        gui.addControl(sparklerLife);
        this._sparklerLife = sparklerLife;

        const spark = new Image("spark", "./sprites/spark.png");
        spark.width = "40px";
        spark.height = "40px";
        spark.cellId = 0;
        spark.cellHeight = 20;
        spark.cellWidth = 20;
        spark.sourceWidth = 20;
        spark.sourceHeight = 20;
        spark.horizontalAlignment = 0;
        spark.verticalAlignment = 0;
        spark.left = "21px";
        spark.top = "20px";
        gui.addControl(spark);
        this._spark = spark;

        const pauseBtn = Button.CreateImageOnlyButton("pauseBtn", "./sprites/pauseBtn.png");
        pauseBtn.width = "48px";
        pauseBtn.height = "86px";
        pauseBtn.thickness = 0;
        pauseBtn.verticalAlignment = 0;
        pauseBtn.horizontalAlignment = 1;
        pauseBtn.top = "-16px";
        gui.addControl(pauseBtn);
        pauseBtn.zIndex = 10;
        this.pauseBtn = pauseBtn;
        //when the button is down, make pause menu visable and add control to it
        pauseBtn.onPointerDownObservable.add(() => {
            this._pauseMenu.isVisible = true;
            gui.addControl(this._pauseMenu);
            this.pauseBtn.isHitTestVisible = false;

            //when game is paused, make sure that the next start time is the time it was when paused
            this.gamePaused = true;
            this._prevTime = this.time;
        });

        this._gui = gui;
        this._createPauseMenu();
        this._createControlsMenu();
    }
    
     //---- Pause Menu Popup ----
     private _createPauseMenu(): void {
        this.gamePaused = false;

        const pauseMenu = new Rectangle();
        pauseMenu.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        pauseMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        pauseMenu.height = 0.8;
        pauseMenu.width = 0.5;
        pauseMenu.thickness = 0;
        pauseMenu.isVisible = false;

        //background image
        const image = new Image("pause", "sprites/pause.jpeg");
        pauseMenu.addControl(image);

        //stack panel for the buttons
        const stackPanel = new StackPanel();
        stackPanel.width = .83;
        pauseMenu.addControl(stackPanel);

        const resumeBtn = Button.CreateSimpleButton("resume", "RESUME");
        resumeBtn.width = 0.18;
        resumeBtn.height = "44px";
        resumeBtn.color = "white";
        resumeBtn.fontFamily = "Viga";
        resumeBtn.paddingBottom = "14px";
        resumeBtn.cornerRadius = 14;
        resumeBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        resumeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        resumeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(resumeBtn);

        this._pauseMenu = pauseMenu;

        //when the button is down, make menu invisable and remove control of the menu
        resumeBtn.onPointerDownObservable.add(() => {
            this._pauseMenu.isVisible = false;
            this._gui.removeControl(pauseMenu);
            this.pauseBtn.isHitTestVisible = true;
            
            //game unpaused, our time is now reset
            this.gamePaused = false;
            this._startTime = new Date().getTime();
        });

        const controlsBtn = Button.CreateSimpleButton("controls", "CONTROLS");
        controlsBtn.width = 0.18;
        controlsBtn.height = "44px";
        controlsBtn.color = "white";
        controlsBtn.fontFamily = "Viga";
        controlsBtn.paddingBottom = "14px";
        controlsBtn.cornerRadius = 14;
        controlsBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        controlsBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        controlsBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        stackPanel.addControl(controlsBtn);

        //when the button is down, make menu invisable and remove control of the menu
        controlsBtn.onPointerDownObservable.add(() => {
            //open controls screen
            this._controls.isVisible = true;
            this._pauseMenu.isVisible = false;
        });

        const quitBtn = Button.CreateSimpleButton("quit", "QUIT");
        quitBtn.width = 0.18;
        quitBtn.height = "44px";
        quitBtn.color = "white";
        quitBtn.fontFamily = "Viga";
        quitBtn.paddingBottom = "12px";
        quitBtn.cornerRadius = 14;
        quitBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        quitBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        quitBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(quitBtn);

        // //set up transition effect
        // Effect.RegisterShader("fade",
        //     "precision highp float;" +
        //     "varying vec2 vUV;" +
        //     "uniform sampler2D textureSampler; " +
        //     "uniform float fadeLevel; " +
        //     "void main(void){" +
        //     "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
        //     "baseColor.a = 1.0;" +
        //     "gl_FragColor = baseColor;" +
        //     "}");
        // this.fadeLevel = 1.0;

        quitBtn.onPointerDownObservable.add(() => {
            // const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._scene.getCameraByName("cam"));
            // postProcess.onApply = (effect) => {
            //     effect.setFloat("fadeLevel", this.fadeLevel);
            // };
            // this.transition = true;
            this._pauseMenu.isVisible = false;
            this.pauseBtn.isHitTestVisible = true;
        })
    }
    public startTimer(){
        this._startTime = new Date().getTime();
        this._stopTimer = false;
    }
    public stopTimer(){
        this._stopTimer = true;
    }
    public updateHud(){
        if(!this._stopTimer && this.startTimer != null){
            let curTime = Math.floor(new Date().getTime() - this._startTime) /1000.0 + this._prevTime;
            this.time = curTime;

            this._clockTime.text = this._formatTime(this.time);
        }
    }
    public _formatTime(time:number):string{
        let minsPassed = Math.floor(time / 60); //seconds in a min 
        let secPassed = time % 240; // goes back to 0 after 4mins/240sec
        //gameclock works like: 4 mins = 1 hr
        // 4sec = 1/15 = 1min game time        
        if (secPassed % 4 == 0) {
            this._mString = Math.floor(minsPassed / 4) + 11;
            this._sString = (secPassed / 4 < 10 ? "0" : "") + secPassed / 4;
        }
        let day = (this._mString == 11 ? " PM" : " AM");
        return (this._mString + ":" + this._sString + day);
    }
    //---- Controls Menu Popup ----
    private _createControlsMenu(): void {
        const controls = new Rectangle();
        controls.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        controls.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        controls.height = 0.8;
        controls.width = 0.5;
        controls.thickness = 0;
        controls.color = "white";
        controls.isVisible = false;
        this._gui.addControl(controls);
        this._controls = controls;

        //background image
        const image = new Image("controls", "sprites/controls.jpeg");
        controls.addControl(image);

        const title = new TextBlock("title", "CONTROLS");
        title.resizeToFit = true;
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        title.fontFamily = "Viga";
        title.fontSize = "32px";
        title.top = "14px";
        controls.addControl(title);

        const backBtn = Button.CreateImageOnlyButton("back", "./sprites/lanternbutton.jpeg");
        backBtn.width = "40px";
        backBtn.height = "40px";
        backBtn.top = "14px";
        backBtn.thickness = 0;
        backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        backBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        controls.addControl(backBtn);

        //when the button is down, make menu invisable and remove control of the menu
        backBtn.onPointerDownObservable.add(() => {
            this._pauseMenu.isVisible = true;
            this._controls.isVisible = false;
        });
    }
}