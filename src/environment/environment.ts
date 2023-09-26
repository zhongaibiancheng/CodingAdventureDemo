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
    DepthOfFieldBlurPostProcess} from "@babylonjs/core";

export default class Environment{
    _scene:Scene;

    constructor(scene){
        this._scene = scene;
    }
    public async load(){
        // const ground = Mesh.CreateBox("ground",24,this._scene);
        // ground.scaling = new Vector3(1,0.02,1);
        // const box = MeshBuilder.CreateBox("box",{},this._scene);
        const ground = MeshBuilder.CreateGround("ground",{width:15,height:16},this._scene)
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

        var box = MeshBuilder.CreateBox("Small1", { width: 0.5, depth: 0.5, height: 0.25, faceColors: [new Color4(0,0,0,1), new Color4(0,0,0,1), new Color4(0,0,0,1), new Color4(0,0,0,1),new Color4(0,0,0,1), new Color4(0,0,0,1)] }, this._scene);
        box.position.y = 1.5;
        box.position.z = 1;

        var body = Mesh.CreateCylinder("body", 3, 2,2,0,0,this._scene);
        var bodymtl = new StandardMaterial("red",this._scene);
        bodymtl.diffuseColor = new Color3(.8,.5,.5);
        body.material = bodymtl;
        body.isPickable = false;
        body.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0)); // simulates the imported mesh's origin

        //parent the meshes
        box.parent = body;
        body.parent = outer;

        return outer;
   }

}