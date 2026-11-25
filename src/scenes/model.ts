import type {Panel,ComicPage} from "../production/model.ts";
import type {Sequence} from "../editor/timeline.ts";
export const motions=["None","Slide in","Float","Fade in","Pulse"] as const;
export type Motion=typeof motions[number];
export type SceneObject=Panel & {name:string;kind:"character"|"prop";characterId?:string;rotation:number;opacity:number;flip:boolean;motion:Motion};
export type SceneComposition={id:string;name:string;storySceneId?:string;backgroundId?:string;seconds:number;objects:SceneObject[];camera:"None"|"Push in";caption:string};
export const emptyScene=(id:string,name:string):SceneComposition=>({id,name,seconds:4,objects:[],camera:"None",caption:""});
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function makeObject(id:string,assetId:string,name:string,kind:SceneObject["kind"],x=.5,y=.65,characterId?:string):SceneObject{
 const w=kind==="character"?.32:.23,h=kind==="character"?.44:.23;
 return {id,assetId,name,kind,characterId,x:clamp(x-w/2,0,1-w),y:clamp(y-h/2,0,1-h),w,h,dialogue:"",rotation:0,opacity:1,flip:false,motion:"None"};
}
export function canvasPage(scene:SceneComposition):ComicPage{return {id:scene.id,title:scene.name,seconds:scene.seconds,panels:scene.objects}}
export function motionAt(object:SceneObject,seconds:number,duration:number){
 const t=clamp(seconds,0,Math.max(0,duration)),u=clamp(t/Math.min(1,Math.max(.1,duration)),0,1),ease=1-(1-u)**3;
 let x=object.x,y=object.y,scale=1,opacity=object.opacity;
 if(object.motion==="Slide in")x-=.24*(1-ease);
 if(object.motion==="Float")y+=Math.sin(t*2*Math.PI/2)*.018;
 if(object.motion==="Fade in")opacity*=ease;
 if(object.motion==="Pulse")scale=1+.055*Math.sin(t*2*Math.PI/2);
 return {x,y,scale,opacity,rotation:object.rotation,flip:object.flip};
}
export function appendScene(sequence:Sequence,scene:SceneComposition,id:string):Sequence{
 const track=sequence.tracks.find(t=>t.kind==="video");if(!track)return sequence;
 const start=Math.max(0,...sequence.clips.filter(c=>c.trackId===track.id).map(c=>c.end)),end=start+Math.max(1,Math.round(clamp(scene.seconds,1,30)*sequence.fps));
 return {...sequence,duration:Math.max(sequence.duration,end),clips:[...sequence.clips,{id,trackId:track.id,name:scene.name,start,end,sceneId:scene.id,keyframes:[]}]};
}
