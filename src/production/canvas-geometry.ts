import {boundPanel,type ComicPage,type Panel} from "./model.ts";
export type PixelBox={x:number;y:number;width:number;height:number};
export type PixelBoxes=Record<string,PixelBox>;
export function pageBoxes(panels:Panel[],width:number,height:number):PixelBoxes {
  return Object.fromEntries(panels.map(p=>[p.id,{x:p.x*width,y:p.y*height,width:p.w*width,height:p.h*height}]));
}
export function applyBoxes(page:ComicPage,boxes:PixelBoxes,width:number,height:number):ComicPage{
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return page;
  let changed=false;
  const panels=page.panels.map(p=>{const b=boxes[p.id];if(p.locked||!b||![b.x,b.y,b.width,b.height].every(Number.isFinite))return p;
    const next=boundPanel({...p,x:b.x/width,y:b.y/height,w:b.width/width,h:b.height/height});
    if(Math.max(Math.abs(next.x-p.x),Math.abs(next.y-p.y),Math.abs(next.w-p.w),Math.abs(next.h-p.h))<1e-8)return p;
    changed=true;return next});
  return changed?{...page,panels}:page;
}

export type PixelPoint={x:number;y:number};
export function boxPositions(boxes:PixelBoxes):Record<string,PixelPoint>{return Object.fromEntries(Object.entries(boxes).map(([id,b])=>[id,{x:b.x,y:b.y}]))}
export function groupBounds(boxes:PixelBoxes,keys:string[],key:string,width:number,height:number){
 const b=boxes[key];if(!b)return undefined;
 const group=keys.map(id=>boxes[id]).filter(Boolean);if(!group.length)return undefined;
 return {minX:b.x-Math.min(...group.map(x=>x.x)),minY:b.y-Math.min(...group.map(x=>x.y)),maxX:b.x+width-Math.max(...group.map(x=>x.x+x.width)),maxY:b.y+height-Math.max(...group.map(x=>x.y+x.height))};
}
export function positionsToBoxes(boxes:PixelBoxes,positions:Record<string,PixelPoint>,locked:string[]):PixelBoxes{
 return Object.fromEntries(Object.entries(boxes).map(([id,b])=>[id,positions[id]&&!locked.includes(id)?{...b,...positions[id]}:b]));
}
