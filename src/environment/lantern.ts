import { AnimationGroup, Color3, Color4, Mesh, MeshBuilder, ParticleSystem, PBRMetallicRoughnessMaterial, PointLight, Scene, Texture, Vector3 } from "@babylonjs/core";

export default class Lantern{
    public _lit:boolean = false;
    private _scene:Scene;
    public mesh:Mesh;
    private _lightSphere:Mesh;
    private _lightmtl:PBRMetallicRoughnessMaterial;
    private _animation:AnimationGroup;
    //Particle System
    private _stars: ParticleSystem;
        
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
            this._animation = animationGroups;

            this._loadLantern(mesh,position);

            //load particle system
            this._loadStars();
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

        this._animation.play();
        this._stars.start();
        this._findNearestMeshes(light);
    }
    //???????
    //when the light is created, only include the meshes that are within the sphere of illumination
    private _findNearestMeshes(light: PointLight): void {

        this._scene.getMeshByName("__root__").getChildMeshes().forEach(m => {
            if (this._lightSphere.intersectsMesh(m)) {
                light.includedOnlyMeshes.push(m);
            }
        });

        //get rid of the sphere
        this._lightSphere.dispose();
    }

    private _loadStars(): void {
        const particleSystem = new ParticleSystem("stars", 1000, this._scene);

        particleSystem.particleTexture = new Texture("textures/solidStar.png", this._scene);
        particleSystem.emitter = new Vector3(this.mesh.position.x, this.mesh.position.y + 1.5, this.mesh.position.z);
        particleSystem.createPointEmitter(new Vector3(0.6, 1, 0), new Vector3(0, 1, 0));
        particleSystem.color1 = new Color4(1, 1, 1);
        particleSystem.color2 = new Color4(1, 1, 1);
        particleSystem.colorDead = new Color4(1, 1, 1, 1);
        particleSystem.emitRate = 12;
        particleSystem.minEmitPower = 14;
        particleSystem.maxEmitPower = 14;
        particleSystem.addStartSizeGradient(0, 2);
        particleSystem.addStartSizeGradient(1, 0.8);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = 2;
        particleSystem.addDragGradient(0, 0.7, 0.7);
        particleSystem.targetStopDuration = .25;

        this._stars = particleSystem;
    }
}