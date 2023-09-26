import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
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
    SceneLoader} from "@babylonjs/core";

export default class Environment{
    _scene:Scene;

    constructor(scene){
        this._scene = scene;
    }
    public async load(){
        const assets = await this._loadAssets();
        assets.allMeshes.forEach((child)=>{
            child.receiveShadows = true;
            child.checkCollisions = true;
        });
    }
    public async _loadAssets(){
        const result = await SceneLoader.ImportMeshAsync("","./models/","envSetting.glb");
        const env = result.meshes[0];
        const allMeshes = env.getChildMeshes();

        return {
            env:env,
            allMeshes:allMeshes
        }
    }

    public async _loadCharacterAssets():Promise<Mesh>{
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
        //body is our actual player mesh
        const body = root;
        body.parent = outer;
        body.isPickable = false; //so our raycasts dont hit ourself
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        });

        return outer;
    }
}