import { AnimationGroup, Color3, Mesh, MeshBuilder, PBRMetallicRoughnessMaterial, PointLight, Scene, Vector3 } from "@babylonjs/core";

export default class Lantern{
    public _lit:boolean = false;
    private _scene:Scene;
    public mesh:Mesh;
    private _lightSphere:Mesh;
    private _lightmtl:PBRMetallicRoughnessMaterial;

    constructor(
        lightmtl: PBRMetallicRoughnessMaterial, 
        mesh: Mesh, 
        scene: Scene, 
        position: Vector3, 
        animationGroups?: AnimationGroup){
            this._lightmtl = lightmtl;
            this._scene = scene;
            
            const lightSphere = Mesh.CreateSphere("illum", 4, 20, this._scene);
            lightSphere.scaling.y = 2;
            lightSphere.setAbsolutePosition(position);
            lightSphere.parent = this.mesh;
            lightSphere.isVisible = false;
            lightSphere.isPickable = false;

            this._lightSphere = lightSphere;

        this._loadLantern(mesh,position);
    }
    /**
     * 加载灯笼model
     * @param mesh 
     * @param pos 
     */
    private _loadLantern(mesh:Mesh,pos:Vector3){
        this.mesh = mesh;
        this.mesh.scaling = new Vector3(.8, .8, .8);
        this.mesh.setAbsolutePosition(pos);
        this.mesh.isPickable = false;
    }

    public setEmissiveTexture():void{
        this._lit = true;
        this.mesh.material = this._lightmtl;

        const light = new PointLight(
            "point light",
            this.mesh.getAbsolutePivotPoint(),
            this._scene);
        light.intensity = 30;
        light.radius = 2;
        light.diffuse = new Color3(0.45, 0.56, 0.80);
        this._findNearestMeshes(light);
    }
    //???????
    //when the light is created, only include the meshes that are within the sphere of illumination
    private _findNearestMeshes(light: PointLight): void {
        // console.log(this._scene.getMeshByName("__root__"));
        this._scene.getMeshByName("__root__").getChildMeshes().forEach(m => {
            if (this._lightSphere.intersectsMesh(m)) {
                light.includedOnlyMeshes.push(m);
            }
        });

        //get rid of the sphere
        this._lightSphere.dispose();
    }
}