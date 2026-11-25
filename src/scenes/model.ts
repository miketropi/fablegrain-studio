import {boundPanel,type Panel,type ComicPage} from "../production/model.ts";
import type {Sequence} from "../editor/timeline.ts";
export const motions=["None","Slide in","Float","Fade in","Pulse"] as const;
export type Motion=typeof motions[number];
export type ObjectTransform={x:number;y:number;w:number;h:number;rotation:number;opacity:number;flip:boolean};
export type ObjectKeyframe={frame:number;transform:ObjectTransform};
export type SceneObject=Panel & {name:string;kind:"character"|"prop";characterId?:string;rotation:number;opacity:number;flip:boolean;motion:Motion;keyframes?:ObjectKeyframe[];poseCycle?:string[];poseFps?:number;poseLoop?:boolean;actionId?:string};
export type SceneComposition={id:string;name:string;storySceneId?:string;backgroundId?:string;seconds:number;objects:SceneObject[];camera:"None"|"Push in";caption:string};
export const emptyScene=(id:string,name:string):SceneComposition=>({id,name,seconds:4,objects:[],camera:"None",caption:""});
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function makeObject(id:string,assetId:string,name:string,kind:SceneObject["kind"],x=.5,y=.65,characterId?:string):SceneObject{
 const w=kind==="character"?.32:.23,h=kind==="character"?.44:.23;
 return {id,assetId,name,kind,characterId,x:clamp(x-w/2,0,1-w),y:clamp(y-h/2,0,1-h),w,h,dialogue:"",rotation:0,opacity:1,flip:false,motion:"None"};
}
export function canvasPage(scene:SceneComposition):ComicPage{return {id:scene.id,title:scene.name,seconds:scene.seconds,panels:scene.objects}}
export function baseTransform(o:SceneObject):ObjectTransform{return {x:o.x,y:o.y,w:o.w,h:o.h,rotation:o.rotation,opacity:o.opacity,flip:o.flip}}
export function transformAt(o:SceneObject,frame:number):ObjectTransform{
 const base=baseTransform(o),keys=[...(o.keyframes??[])].sort((a,b)=>a.frame-b.frame);if(!keys.length)return base;
 if(keys[0].frame>0)keys.unshift({frame:0,transform:base});
 if(frame<=keys[0].frame)return keys[0].transform;
 for(let i=1;i<keys.length;i++){const a=keys[i-1],b=keys[i];if(frame<=b.frame){const t=clamp((frame-a.frame)/Math.max(1,b.frame-a.frame),0,1),lerp=(k:Exclude<keyof ObjectTransform,"flip">)=>a.transform[k]+(b.transform[k]-a.transform[k])*t;
 return {x:lerp("x"),y:lerp("y"),w:lerp("w"),h:lerp("h"),rotation:lerp("rotation"),opacity:lerp("opacity"),flip:t<1?a.transform.flip:b.transform.flip}}}
 return keys.at(-1)!.transform;
}
export function setObjectKeyframe(o:SceneObject,frame:number,patch:Partial<ObjectTransform>):SceneObject{
 if(o.locked||!Number.isFinite(frame))return o;
 const at=Math.max(0,Math.round(frame)),prev=transformAt(o,at),next={...prev,...patch};
 const bounded=boundPanel({...o,...next}),transform={x:bounded.x,y:bounded.y,w:bounded.w,h:bounded.h,rotation:clamp(Number.isFinite(next.rotation)?next.rotation:prev.rotation,-180,180),opacity:clamp(Number.isFinite(next.opacity)?next.opacity:prev.opacity,0,1),flip:next.flip};
 const keys=(o.keyframes??[]).filter(k=>k.frame!==at);if(!keys.length&&at>0)keys.push({frame:0,transform:baseTransform(o)});
 return {...o,keyframes:[...keys,{frame:at,transform}].sort((a,b)=>a.frame-b.frame)};
}
export function poseAt(o:SceneObject,seconds:number):string|undefined{const cycle=o.poseCycle??[];const frame=Math.floor(Math.max(0,seconds)*clamp(o.poseFps??6,1,24));return cycle.length?cycle[o.poseLoop===false?Math.min(frame,cycle.length-1):frame%cycle.length]:o.assetId}
export function motionAt(object:SceneObject,seconds:number,duration:number,fps=30){
 const t=clamp(seconds,0,Math.max(0,duration)),u=clamp(t/Math.min(1,Math.max(.1,duration)),0,1),ease=1-(1-u)**3;
 if(object.keyframes?.length)return {...transformAt(object,t*fps),scale:1};
 let x=object.x,y=object.y,scale=1,opacity=object.opacity;
 if(object.motion==="Slide in")x-=.24*(1-ease);
 if(object.motion==="Float")y+=Math.sin(t*2*Math.PI/2)*.018;
 if(object.motion==="Fade in")opacity*=ease;
 if(object.motion==="Pulse")scale=1+.055*Math.sin(t*2*Math.PI/2);
 return {x,y,w:object.w,h:object.h,scale,opacity,rotation:object.rotation,flip:object.flip};
}
export function appendScene(sequence:Sequence,scene:SceneComposition,id:string):Sequence{
 const track=sequence.tracks.find(t=>t.kind==="video");if(!track)return sequence;
 const start=Math.max(0,...sequence.clips.filter(c=>c.trackId===track.id).map(c=>c.end)),end=start+Math.max(1,Math.round(clamp(scene.seconds,1,30)*sequence.fps));
 return {...sequence,duration:Math.max(sequence.duration,end),clips:[...sequence.clips,{id,trackId:track.id,name:scene.name,start,end,sceneId:scene.id,keyframes:[]}]};
}
