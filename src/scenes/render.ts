import type {Project} from "../studio/project";
import {motionAt,type SceneComposition} from "./model";
export type SceneImages=Map<string,HTMLImageElement>;
export async function loadSceneImages(scenes:SceneComposition[],assets:Project["assets"]):Promise<SceneImages>{
 const ids=new Set(scenes.flatMap(s=>[s.backgroundId,...s.objects.map(o=>o.assetId)]).filter(Boolean));
 const result:SceneImages=new Map();
 await Promise.all([...ids].map(async id=>{const src=assets.find(a=>a.id===id)?.src;if(!src)throw Error("Missing scene image: "+id);const im=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error("Could not decode scene image"));i.src=src});result.set(id!,im)}));return result;
}
function paintImage(ctx:CanvasRenderingContext2D,im:HTMLImageElement,w:number,h:number,cover:boolean){
 const s=(cover?Math.max:Math.min)(w/im.naturalWidth,h/im.naturalHeight);
 const iw=im.naturalWidth*s,ih=im.naturalHeight*s;ctx.save();ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();ctx.drawImage(im,-iw/2,-ih/2,iw,ih);ctx.restore();
}
export function drawScene(ctx:CanvasRenderingContext2D,s:SceneComposition,images:SceneImages,w:number,h:number,time:number){
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.fillStyle="#17191e";ctx.fillRect(0,0,w,h);
 const camera=s.camera==="Push in"?1+.12*Math.max(0,Math.min(1,time/s.seconds)):1;
 ctx.translate(w/2,h/2);ctx.scale(camera,camera);ctx.translate(-w/2,-h/2);
 const bg=s.backgroundId?images.get(s.backgroundId):undefined;
 if(bg){ctx.save();ctx.translate(w/2,h/2);paintImage(ctx,bg,w,h,true);ctx.restore()}
 for(const o of s.objects){const im=o.assetId?images.get(o.assetId):undefined;if(!im)continue;const a=motionAt(o,time,s.seconds);
 ctx.save();ctx.globalAlpha*=a.opacity;ctx.translate((a.x+o.w/2)*w,(a.y+o.h/2)*h);ctx.rotate(a.rotation*Math.PI/180);ctx.scale(a.scale*(a.flip?-1:1),a.scale);paintImage(ctx,im,o.w*w,o.h*h,false);ctx.restore()}
 ctx.restore();
 if(s.caption.trim()){ctx.save();ctx.font=Math.max(14,Math.round(w*.038))+"px sans-serif";ctx.textAlign="center";ctx.fillStyle="#000b";ctx.fillRect(w*.05,h*.87,w*.9,h*.1);ctx.fillStyle="#fff";ctx.fillText(s.caption,w/2,h*.928,w*.84);ctx.restore()}
}
