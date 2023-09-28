import { AnimationGroup, Mesh, Scene } from "@babylonjs/core";
import Environment from "../environment/environment";

interface SceneParams{
    //scene 跳转用函数
    callback?:()=>void|undefined,
    //loading assets
    setup_game?:()=>Promise<void>|undefined,

    game_scene?:Scene,
    player_mesh?:Mesh,
    environment?:Environment,
    animations?:Array<AnimationGroup>
}

export {SceneParams};