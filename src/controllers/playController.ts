import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3, Camera, Quaternion, Ray } from "@babylonjs/core";
import InputController from './inputController';

export default class PlayerController extends TransformNode {
    public camera;
    public scene: Scene;
    private _input:InputController;

    private _h:number;
    private _v:number;
    private _inputAmt: number;
    private _moveDirection:Vector3;
    private _delta_time:number;

    //Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //const values
    private static readonly PLAYER_SPEED: number = 0.45;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    
    private _gravity:Vector3 = new Vector3();
    private _lastGroundPos:Vector3 = new Vector3();
    private _grounded:Boolean = true;
    private _jumpCount:number = 1;

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets); //the player mesh will cast shadows

        this._input = input;

        this.scene.onBeforeRenderObservable.add(()=>{
            console.log(this._input.horizontal,this._input.vertical);
        });
    }

    private _floorRaycast(offsetX:number,offsetZ:number,distance:number):Vector3{
        const pos = new Vector3(
            this.mesh.position.x + offsetX,
            this.mesh.position.y + 0.5,
            this.mesh.position.z + offsetZ);

        const ray = new Ray(pos,Vector3.Up().scale(-1),distance);
        const predicate = (mesh)=>{
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray,predicate);
        if (pick.hit) { 
            return pick.pickedPoint;
        } else { 
            return Vector3.Zero();
        }
    }
    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }
    private _updateFromControll():void{
        this._delta_time = this.scene.getEngine().getDeltaTime()/1000.0;
        this._h = this._input.horizontal;
        this._v = this._input.vertical;

        this._moveDirection = Vector3.Zero();

        let fwd = this._camRoot.forward;
        let right = this._camRoot.right;

        let fwd_vec3  = fwd.scaleInPlace(this._v);
        let right_vec3 = right.scaleInPlace(this._h);

        let dir = fwd_vec3.addInPlace(right_vec3);
        let dir_nor = dir.normalize();

        this._moveDirection = new Vector3(dir_nor.x,0,dir_nor.z);

        this._inputAmt = Math.abs(this._h) + Math.abs(this._v);
        if(this._inputAmt > 1){
            this._inputAmt = 1;
        }

        this._moveDirection.scaleInPlace(this._inputAmt * PlayerController.PLAYER_SPEED);

        //检查是否旋转
        let rot = new Vector3(this._input.horizontalAxis,0,this._input.verticalAxis);
        if(rot.length() === 0){
            return;
        }

        let angle = Math.atan2(this._input.horizontalAxis,this._input.verticalAxis);
        angle +=this._camRoot.rotation.y ;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);

        this.mesh.rotationQuaternion = Quaternion.Slerp(
            this.mesh.rotationQuaternion,
            targ,
            10*this._delta_time);

        return;
    }
    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._delta_time * PlayerController.GRAVITY));
            this._grounded = false;
        }
        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -PlayerController.JUMP_FORCE) {
            this._gravity.y = -PlayerController.JUMP_FORCE;
        }
        this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);

            this._jumpCount = 1;
        }
        if(this._input.jumpKeyDown && this._jumpCount >0){
            // this._gravity.y = PlayerController.JUMP_FORCE;
            this._jumpCount--;
        }
    }

    private _updateCamera(): void {
        let centerPlayer = this.mesh.position.y + 2;
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);
    }

    private _beforeRenderUpdate(): void {
        this._updateFromControll();
        this._updateGroundDetection();
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
    
            this._beforeRenderUpdate();
            this._updateCamera();
    
        })
        return this.camera;
    }
    private _setupPlayerCamera():Camera {
        //root camera parent that handles positioning of the camera to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0); //initialized at (0,0,0)
        //to face the player from behind (180 degrees)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        //rotations along the x-axis (up/down tilting)
        let yTilt = new TransformNode("ytilt");
        //adjustments to camera view to point down at our player
        yTilt.rotation = PlayerController.ORIGINAL_TILT;
        this._yTilt = yTilt;
        yTilt.parent = this._camRoot;

        //our actual camera that's pointing at our root's position
        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -30), this.scene);
        this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.47350045992678597;
        this.camera.parent = yTilt;

        this.scene.activeCamera = this.camera;
        return this.camera;
        // var camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0,3,0), this.scene);
    }
}