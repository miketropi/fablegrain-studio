import type {SceneObject} from "./model.ts";
export type CharacterAction={id:string;characterId:string;name:string;frames:string[];fps:number;loop:boolean};
type PoseAsset={id:string;characterId?:string;kind:string;src?:string};
export function validAction(a:CharacterAction,assets:PoseAsset[]):boolean{
 return !!a.id&&!!a.characterId&&!!a.name.trim()&&a.frames.length>=2&&a.frames.length<=60&&new Set(a.frames).size>=2&&Number.isInteger(a.fps)&&a.fps>=1&&a.fps<=24&&a.frames.every(id=>assets.some(p=>p.id===id&&p.characterId===a.characterId&&!!p.src&&["Character pose","Character action frame"].includes(p.kind)));
}
export function actionsFor(actions:CharacterAction[],characterId:string|undefined,assets:PoseAsset[]):CharacterAction[]{return actions.filter(a=>a.characterId===characterId&&validAction(a,assets))}
export function applyAction(o:SceneObject,a:CharacterAction,assets:PoseAsset[]):SceneObject{
 if(o.locked||o.kind!=="character"||o.characterId!==a.characterId||!validAction(a,assets))return o;
 return {...o,actionId:a.id,poseCycle:[...a.frames],poseFps:a.fps,poseLoop:a.loop};
}
export function saveAction(id:string,name:string,o:SceneObject,assets:PoseAsset[]):CharacterAction|null{
 const a={id,characterId:o.characterId??"",name:name.trim().slice(0,80),frames:[...(o.poseCycle??[])],fps:Math.round(o.poseFps??6),loop:o.poseLoop!==false};
 return validAction(a,assets)?a:null;
}
