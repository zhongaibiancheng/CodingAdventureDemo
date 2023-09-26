import { Mesh, Scene } from "@babylonjs/core";

interface SceneParams{
    //scene 跳转用函数
    callback?:()=>void|undefined,
    //loading assets
    setup_game?:()=>Promise<void>|undefined,

    game_scene?:Scene,
    player_mesh?:Mesh
}

export {SceneParams};