import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import Lantern from './lantern';

import { 
    Engine, Scene, ArcRotateCamera, 
    FreeCamera,
    Vector3, HemisphericLight, Mesh, MeshBuilder, 
    Color4, 
    Camera,
    CubeMapToSphericalPolynomialTools,
    Matrix,
    Quaternion,
    StandardMaterial,
    Color3,
    DepthOfFieldBlurPostProcess,
    SceneLoader,
    PBRMetallicRoughnessMaterial,
    TextureTools,
    Texture,
    TransformNode,
    ExecuteCodeAction,
    AnimationGroup,
    ActionManager} from "@babylonjs/core";
import PlayerController from "../controllers/playController";

export default class Environment{
    private _scene:Scene;
    private _lightmtl:PBRMetallicRoughnessMaterial;
    private _lanternObjs:Array<Lantern>;

    private _lantern_pos:any;

    constructor(scene){
        this._scene = scene;

        this._lightmtl = new PBRMetallicRoughnessMaterial("light it material",this._scene);
        this._lightmtl.emissiveTexture = new Texture(
            "./textures/litLantern.png",
            this._scene,
            true,
            false);
        this._lightmtl.emissiveColor = new Color3(0.8784313725490196, 0.7568627450980392, 0.6235294117647059);
        this._lanternObjs = [];

        this._lantern_pos = {};
    }


    public async load(){
        const assets = await this._loadAssets();
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });

        //--LANTERNS--
        const lantern = assets.lantern;
        lantern.isVisible = false;
        
        const lanternHolder = new TransformNode("lanterns",this._scene);
        for(let i=0;i<22;i++){
            const l = lantern.clone("lantern-"+i);
            l.isVisible = true;
            l.setParent(lanternHolder);

            const pos = this._lantern_pos["lantern "+i];
            const lan = new Lantern(this._lightmtl,l,this._scene,pos);
            this._lanternObjs.push(lan);
        }
        lantern.dispose();
    }
    public async _loadAssets(){
        const result = await SceneLoader.ImportMeshAsync("","./models/","envSetting.glb");
        const env = result.meshes[0];

        const allMeshes = env.getChildMeshes();

        allMeshes.forEach(m=>{
            m.checkCollisions = true;
            m.receiveShadows = true;

            if(m.name === 'ground'){
                m.isPickable = true;
                m.checkCollisions = true;
            }

            if(m.name.includes("collision")){
                m.isPickable = true;
                m.isVisible = false;
            }

            if(m.name.includes("Trigger")){
                m.isVisible = true;
                m.checkCollisions = false;
                m.isPickable = false;
            }

            //areas that will use box collisions
            if (m.name.includes("stairs") || m.name == "cityentranceground" || m.name == "fishingground.001" || m.name.includes("lilyflwr")) {
                m.checkCollisions = false;
                m.isPickable = false;
            }
        });

        const res = await SceneLoader.ImportMeshAsync("","./models/","lantern.glb");
        let lantern = res.meshes[0].getChildren()[0];
        lantern.parent = null;
        res.meshes[0].dispose();

        let lantern_pos = env.getChildTransformNodes(false).filter(m => m.name.includes("lantern "));
        
        lantern_pos.forEach(m=>{
            this._lantern_pos[m.name] = m.getAbsolutePosition();
        })
        
        return {
            env:env,
            allMeshes:allMeshes,
            lantern:lantern as Mesh
        }
    }

    public async _loadCharacterAssets():Promise<any>{
        //collision mesh
        const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, this._scene);
        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = true;

        //move origin of box collider to the bottom of the mesh (to match player mesh)
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

        //for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

        const result = await SceneLoader.ImportMeshAsync(null, "./models/", "player.glb", this._scene)
        const root = result.meshes[0];
        const animations = result.animationGroups;
        //body is our actual player mesh
        const body = root;
        body.parent = outer;
        body.isPickable = false; //so our raycasts dont hit ourself
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        });

        return {
            outer:outer,
            animations:animations
        };
    }

    public checkLanterns(player:PlayerController){
        if(!this._lanternObjs[0]._lit){
            this._lanternObjs[0].setEmissiveTexture();
        }
        this._lanternObjs.forEach(lantern=>{
            player.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: lantern.mesh
                    },
                    (evt)=>{
                        //if the lantern is not lit, light it up & reset sparkler timer
                        // if (!lantern._lit && player.sparkLit) {
                        //     player.lanternsLit += 1; //increment the lantern count
                        //     lantern.setEmissiveTexture(); //"light up" the lantern
                        //     //reset the sparkler
                        //     player.sparkReset = true;
                        //     player.sparkLit = true;
                        // }
                        // //if the lantern is lit already, reset the sparkler
                        // else if (lantern.isLit) {
                        //     player.sparkReset = true;
                        //     player.sparkLit = true;
                        // }

                        if (!lantern._lit){
                            lantern.setEmissiveTexture(); //"light up" the lantern
                        }
                })
            )
        })
    }
}