import {boundPanel,type ComicPage,type Panel} from "./model.ts";
export type PixelBox={x:number;y:number;width:number;height:number};
export type PixelBoxes=Record<string,PixelBox>;
export function pageBoxes(panels:Panel[],width:number,height:number):PixelBoxes {
  return Object.fromEntries(panels.map(p=>[p.id,{x:p.x*width,y:p.y*height,width:p.w*width,height:p.h*height}]));
}
export function applyBoxes(page:ComicPage,boxes:PixelBoxes,width:number,height:number):ComicPage{
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return page;
  let changed=false;
  const panels=page.panels.map(p=>{const b=boxes[p.id];if(!b||![b.x,b.y,b.width,b.height].every(Number.isFinite))return p;
    const next=boundPanel({...p,x:b.x/width,y:b.y/height,w:b.width/width,h:b.height/height});
    if(Math.max(Math.abs(next.x-p.x),Math.abs(next.y-p.y),Math.abs(next.w-p.w),Math.abs(next.h-p.h))<1e-8)return p;
    changed=true;return next});
  return changed?{...page,panels}:page;
}
