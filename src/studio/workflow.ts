import type {Project} from "./project.ts";
import {emptyScene,makeObject,type SceneComposition} from "../scenes/model.ts";
export function workflowFacts(p:Project){return {planned:p.production?.chapters.reduce((n,c)=>n+c.scenes.length,0)??0,readyAssets:p.assets.filter(a=>a.src&&["Background","Environment","Character pose","Prop","Image"].includes(a.kind)).length,composed:p.scenes?.length??0,pages:p.production?.pages.length??0,clips:p.sequence.clips.filter(c=>c.sceneId||c.pageId||c.assetId).length}}
export function openPlannedScene(p:Project,storyId:string,uid:()=>string):{sceneId:string;scenes:SceneComposition[]}|null{
 const scenes=p.scenes??[],existing=scenes.find(s=>s.storySceneId===storyId);if(existing)return {sceneId:existing.id,scenes};
 const plan=p.production?.chapters.flatMap(c=>c.scenes).find(s=>s.id===storyId);if(!plan)return null;
 const scene={...emptyScene(uid(),plan.title),storySceneId:storyId};
 const cast=plan.characterIds.flatMap(id=>{const ch=p.characters.find(c=>c.id===id),pose=p.assets.find(a=>a.characterId===id&&a.kind==="Character pose"&&a.src);return ch&&pose?[{ch,pose}]:[]});
 scene.objects=cast.map(({ch,pose},i)=>makeObject(uid(),pose.id,ch.name,"character",(i+1)/(cast.length+1),.65,ch.id));
 return {sceneId:scene.id,scenes:[...scenes,scene]};
}
export function insertSceneAsset(p:Project,focused:string,assetId:string,uid:()=>string):{sceneId:string;scenes:SceneComposition[]}|null{
 const asset=p.assets.find(a=>a.id===assetId&&a.src);if(!asset||!["Background","Environment","Character pose","Prop","Image","Scene","Scene still"].includes(asset.kind))return null;
 const scenes=p.scenes??[],scene=scenes.find(s=>s.id===focused)??scenes[0]??emptyScene(uid(),"Scene 1");
 const next=asset.kind==="Background"||asset.kind==="Environment"?{...scene,backgroundId:asset.id}:{...scene,objects:[...scene.objects,makeObject(uid(),asset.id,p.characters.find(c=>c.id===asset.characterId)?.name??asset.name,asset.kind==="Character pose"?"character":"prop",.5,.65,asset.characterId)]};
 return {sceneId:next.id,scenes:scenes.some(s=>s.id===next.id)?scenes.map(s=>s.id===next.id?next:s):[...scenes,next]};
}
