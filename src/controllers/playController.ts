import { TransformNode, ShadowGenerator, Scene, Mesh, UniversalCamera, ArcRotateCamera, Vector3, Camera, Quaternion, Ray, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import InputController from './inputController';

export default class PlayerController extends TransformNode {
    public camera;
    public scene: Scene;
    private _input:InputController;

    private _h:number;
    private _v:number;
    private _inputAmt: number;
    private _moveDirection:Vector3 = new Vector3();
    private _delta_time:number = 0;

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

    private lanternsLit:number = 0;
    private win:boolean = false;

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);

        this.scene = scene;
        this.scene.collisionsEnabled = true;

        this._setupPlayerCamera();

        this.mesh = assets;
        this.mesh.parent = this;

        this.mesh.actionManager = new ActionManager(this.scene);

        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");
        
        shadowGenerator.addShadowCaster(assets); //the player mesh will cast shadows

        this._input = input;

        this.scene.onBeforeRenderObservable.add(()=>{
            // console.log(this._input.horizontal,this._input.vertical);
        });

        //destination point
        this.mesh.actionManager.registerAction(
            new ExecuteCodeAction({
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: this.scene.getMeshByName("destination"),
            },()=>{
                if(this.lanternsLit === 22){
                    this.win = true;
                    this._yTilt.rotation = new Vector3(5.689773361501514, 0.23736477827122882, 0);
                    this._yTilt.position = new Vector3(0, 6, 0);
                    this.camera.position.y = 17;
                }
            }));
        
        this.mesh.actionManager.registerAction(new ExecuteCodeAction({
            trigger:ActionManager.OnIntersectionEnterTrigger,
            parameter:this.scene.getMeshByName("ground")
        },()=>{
            this.mesh.position.copyFrom(this._lastGroundPos);
        }));
    }

    private _floorRaycast(offsetX:number,offsetZ:number,distance:number):boolean{
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
            return true;
        } else { 
            return false;
        }
    }
    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6)) {
            return true;
        } else {
            return false;
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
        const is_ground = this._isGrounded();
        console.log(is_ground);
        if (!is_ground) {
            if (this._checkSlope() && this._gravity.y <= 0) {
                //if you are considered on a slope, you're able to jump and gravity wont affect you
                this._gravity.y = 0;
                this._jumpCount = 1;
                this._grounded = true;
            } else {
                //keep applying gravity
                this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._delta_time * PlayerController.GRAVITY));
                this._grounded = false;
            }
        }
        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -PlayerController.JUMP_FORCE) {
            this._gravity.y = -PlayerController.JUMP_FORCE;
        }
        this._moveDirection = this._moveDirection.addInPlace(this._gravity);
        this.mesh.moveWithCollisions(this._moveDirection);

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);

            this._jumpCount = 1;
        }
        if(this._input.jumpKeyDown && this._jumpCount >0){
            this._gravity.y = PlayerController.JUMP_FORCE;
            this._jumpCount--;
        }
    }

    private _updateCamera(): void {
        //不错的想法
        //trigger areas for rotating camera view
        if (this.mesh.intersectsMesh(this.scene.getMeshByName("cornerTrigger"))) {
            if (this._input.horizontalAxis > 0) { //rotates to the right                
                this._camRoot.rotation = Vector3.Lerp(this._camRoot.rotation, new Vector3(this._camRoot.rotation.x, Math.PI / 2, this._camRoot.rotation.z), 0.4);
            } else if (this._input.horizontalAxis < 0) { //rotates to the left
                this._camRoot.rotation = Vector3.Lerp(this._camRoot.rotation, new Vector3(this._camRoot.rotation.x, Math.PI, this._camRoot.rotation.z), 0.4);
            }
        }

        //rotates the camera to point down at the player when they enter the area, and returns it back to normal when they exit
        if (this.mesh.intersectsMesh(this.scene.getMeshByName("festivalTrigger"))) {
            if (this._input.verticalAxis > 0) {
                this._yTilt.rotation = Vector3.Lerp(this._yTilt.rotation, Player.DOWN_TILT, 0.4);
            } else if (this._input.verticalAxis < 0) {
                this._yTilt.rotation = Vector3.Lerp(this._yTilt.rotation, Player.ORIGINAL_TILT, 0.4);
            }
        }
        //once you've reached the destination area, return back to the original orientation, if they leave rotate it to the previous orientation
        if (this.mesh.intersectsMesh(this.scene.getMeshByName("destinationTrigger"))) {
            if (this._input.verticalAxis > 0) {
                this._yTilt.rotation = Vector3.Lerp(this._yTilt.rotation, Player.ORIGINAL_TILT, 0.4);
            } else if (this._input.verticalAxis < 0) {
                this._yTilt.rotation = Vector3.Lerp(this._yTilt.rotation, Player.DOWN_TILT, 0.4);
            }
        }

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
    private _checkSlope(): boolean {
        //only check meshes that are pickable and enabled (specific for collision meshes that are invisible)
        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        //4 raycasts outward from center
        let raycast = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z + .25);
        let ray = new Ray(raycast, Vector3.Up().scale(-1), 1.5);
        let pick = this.scene.pickWithRay(ray, predicate);

        let raycast2 = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z - .25);
        let ray2 = new Ray(raycast2, Vector3.Up().scale(-1), 1.5);
        let pick2 = this.scene.pickWithRay(ray2, predicate);

        let raycast3 = new Vector3(this.mesh.position.x + .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray3 = new Ray(raycast3, Vector3.Up().scale(-1), 1.5);
        let pick3 = this.scene.pickWithRay(ray3, predicate);

        let raycast4 = new Vector3(this.mesh.position.x - .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray4 = new Ray(raycast4, Vector3.Up().scale(-1), 1.5);
        let pick4 = this.scene.pickWithRay(ray4, predicate);

        if (pick.hit && !pick.getNormal().equals(Vector3.Up())) {
            if(pick.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        } else if (pick2.hit && !pick2.getNormal().equals(Vector3.Up())) {
            if(pick2.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick3.hit && !pick3.getNormal().equals(Vector3.Up())) {
            if(pick3.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick4.hit && !pick4.getNormal().equals(Vector3.Up())) {
            if(pick4.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        return false;
    }
}