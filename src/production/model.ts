export type Scene={id:string;title:string;summary:string;characterIds:string[]};
export type Chapter={id:string;title:string;scenes:Scene[]};
export type Panel={id:string;x:number;y:number;w:number;h:number;assetId?:string;dialogue:string;locked?:boolean};
export type ComicPage={id:string;title:string;sceneId?:string;panels:Panel[];seconds:number};
export type StoryProduction={chapters:Chapter[];pages:ComicPage[];style:string;characterSheets:Record<string,string>};
export const emptyProduction=():StoryProduction=>({chapters:[],pages:[],style:"",characterSheets:{}});
export const makePage=(id:string,title:string):ComicPage=>({id,title,seconds:3,panels:[{id:id+"-1",x:.04,y:.04,w:.92,h:.55,dialogue:""},{id:id+"-2",x:.04,y:.62,w:.44,h:.34,dialogue:""},{id:id+"-3",x:.52,y:.62,w:.44,h:.34,dialogue:""}]});
export function boundPanel(p:Panel):Panel{
  const finite=(v:number,f:number)=>Number.isFinite(v)?v:f;
  const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
  const w=clamp(finite(p.w,.3),.05,1),h=clamp(finite(p.h,.3),.05,1);
  return {...p,w,h,x:clamp(finite(p.x,0),0,1-w),y:clamp(finite(p.y,0),0,1-h)};
}
export function movePanel(page:ComicPage,id:string,dx:number,dy:number):ComicPage{
  return {...page,panels:page.panels.map(p=>p.id===id?boundPanel({...p,x:p.x+dx,y:p.y+dy}):p)};
}
export function reorder<T extends {id:string}>(items:T[],id:string,direction:-1|1):T[]{
  const index=items.findIndex(i=>i.id===id),next=index+direction;
  if(index<0||next<0||next>=items.length)return items;
  const copy=[...items];[copy[index],copy[next]]=[copy[next],copy[index]];return copy;
}
export function continuity(p:StoryProduction,characters:string[],assets:string[]):string[]{
  const problems:string[]=[],scenes=p.chapters.flatMap(c=>c.scenes),sceneIds=new Set(scenes.map(s=>s.id));
  for(const scene of scenes)for(const id of scene.characterIds)if(!characters.includes(id))problems.push(scene.title+": missing character");
  for(const page of p.pages){if(page.sceneId&&!sceneIds.has(page.sceneId))problems.push(page.title+": missing scene");
    if(!page.panels.length)problems.push(page.title+": no panels");
    for(const panel of page.panels){if(!panel.assetId)problems.push(page.title+": empty panel");else if(!assets.includes(panel.assetId))problems.push(page.title+": missing asset");}}
  for(const [id,asset] of Object.entries(p.characterSheets))if(!characters.includes(id)||!assets.includes(asset))problems.push("Broken character sheet reference");
  return problems;
}
