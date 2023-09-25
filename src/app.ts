import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";

class App{
    constructor(){

        const canvas = this.createCanvas();
        const engine = new Engine(canvas,true);
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera("camera",Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);

        camera.attachControl(canvas,true);
        /* eslint-disable */
        const light = new HemisphericLight("light1",new Vector3(1,1,0),scene);
        /* eslint-disable */
        const sphere:Mesh = MeshBuilder.CreateSphere("sphere",{diameter: 1},scene)
        
        window.addEventListener("keydown",(evt)=>{
            if(evt.shiftKey && evt.ctrlKey && evt.altKey && evt.key === 'i'){
                if(scene.debugLayer.isVisible()){
                    scene.debugLayer.hide();
                }else{
                    scene.debugLayer.show();
                }
            }
        })
        engine.runRenderLoop(()=>{
            scene.render();
        })
    }
    createCanvas(){
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "game-canvas";
        document.body.appendChild(canvas);

        return canvas;
    }
}
/* eslint-disable */
const app = new App();