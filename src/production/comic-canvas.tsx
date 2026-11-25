"use client";
import {useLayoutEffect,useRef,useState,useMemo,type CSSProperties} from "react";
import {createChange,createResize,createSelection,definePrimitive,live,type ResizeDraft} from "@ui-sdk/core";
import {createParts} from "@ui-sdk/react/primitive";
import type {Project} from "../studio/project";
import type {ComicPage} from "./model";
import {pageBoxes,applyBoxes,type PixelBoxes} from "./canvas-geometry";
type Handle="n"|"ne"|"e"|"se"|"s"|"sw"|"w"|"nw";
const handles:Handle[]=["n","ne","e","se","s","sw","w","nw"];
type Options={boxes:PixelBoxes;selected:string[];width:number;height:number;onBoxesChange?:(value:PixelBoxes)=>void;onSelectedChange?:(value:string[])=>void};
type State={boxes:PixelBoxes;selected:string[];draft:ResizeDraft|null};
const canvas=definePrimitive({
  name:"comic-canvas",
  options:{boxes:"value",selected:"list",width:"number",height:"number",onBoxesChange:"callback",onSelectedChange:"callback"},
  controlled:["boxes","selected"],
  state:(o:Options):State=>({boxes:o.boxes,selected:o.selected,draft:null}),
  sync:(o)=>({boxes:o.boxes,selected:o.selected}),
  live:["draft"],
  api:(context)=>{
    const change=createChange(context);
    const resize=createResize(context,{
      boxes:state=>state.boxes,draft:"draft",
      set:(value,details)=>change("boxes",value,details),
      bounds:()=>({left:0,top:0,right:context.options().width,bottom:context.options().height}),
      min:()=>({width:context.options().width*.05,height:context.options().height*.05}),
      step:()=>1,
      label:key=>"Panel "+(Object.keys(context.store.get().boxes).indexOf(key)+1)
    });
    const selection=createSelection(context,{key:"selected",set:(value,details)=>change("selected",value,details),order:()=>Object.keys(context.store.get().boxes)});
    return {resize,selection};
  },
  slots:slot=>({
    root:slot({attrs:()=>({role:"group","aria-label":"Comic canvas"})}),
    shape:slot<{value:string}>({
      props:{value:"string"},
      attrs:(state,{api,key})=>({style:api.resize.boxStyle(state,key),"data-selected":String(state.selected.includes(key))}),
      live:live((state,{api,key})=>({style:api.resize.style(state,key)})),
    }),
    move:slot<{value:string}>({
      props:{value:"string"},
      attrs:(state,{key})=>({type:"button","aria-pressed":String(state.selected.includes(key))}),
      on:{
        pointerdown:(event,{api,key,el})=>{if(event.button!==0||!el)return;api.selection.choose(key,{reason:"item-press",event});api.resize.pointerdown(event,key,"move",el)},
        keydown:(event,{api,key})=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();api.selection.choose(key,{reason:"item-press",event})}else api.resize.keydown(event,key,"move")},
      },
      press:({api,key},event)=>api.selection.choose(key,{reason:"item-press",event}),
    }),
    handle:slot<{value:string;panelId:string;edge:Handle}>({
      props:{value:"string",panelId:"string",edge:"string"},
      attrs:(_state,{api,props})=>({type:"button",...api.resize.handleAttrs(props.edge)}),
      on:{
        pointerdown:(event,{api,props,el})=>{if(event.button!==0||!el)return;event.stopPropagation();api.resize.pointerdown(event,props.panelId,props.edge,el)},
        keydown:(event,{api,props})=>api.resize.keydown(event,props.panelId,props.edge),
      },
    }),
  }),
});
const {Root,Shape,Move,Handle:ResizeHandle}=createParts(canvas,{root:"div",shape:"div",move:"button",handle:"button"});
type Props={page:ComicPage;width:number;height:number;assets:Project["assets"];selected:string;onSelect:(id:string)=>void;onCommit:(page:ComicPage)=>void};
export function ComicCanvas({page,width,height,assets,selected,onSelect,onCommit}:Props){
  const sheet=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:0,height:0});
  useLayoutEffect(()=>{const el=sheet.current;if(!el)return;const measure=()=>{const r=el.getBoundingClientRect();setSize(s=>s.width===r.width&&s.height===r.height?s:{width:r.width,height:r.height})};measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect()},[]);
  const boxes=useMemo(()=>pageBoxes(page.panels,size.width,size.height),[page.panels,size.width,size.height]);
  const keys=useMemo(()=>selected?[selected]:[],[selected]);
  return <div className="comic-sheet" ref={sheet} style={{aspectRatio:width+"/"+height,"--page-ratio":width/height} as CSSProperties}>
    {size.width>0&&size.height>0&&<Root className="comic-canvas" boxes={boxes} selected={keys} width={size.width} height={size.height} onSelectedChange={value=>onSelect(value[0]??"")} onBoxesChange={value=>{const next=applyBoxes(page,value,size.width,size.height);if(next!==page)onCommit(next)}}>
      {page.panels.map((panel,index)=><Shape key={panel.id} value={panel.id} className="comic-panel">
        <Move value={panel.id} className="comic-panel-content" aria-label={"Select panel "+(index+1)}>
          {assets.find(a=>a.id===panel.assetId)?.src?<img draggable={false} alt="" src={assets.find(a=>a.id===panel.assetId)!.src}/>:<span>Panel {index+1}</span>}{panel.dialogue&&<span className="speech">{panel.dialogue}</span>}
        </Move>
        {selected===panel.id&&handles.map(edge=><ResizeHandle key={edge} value={panel.id+":"+edge} panelId={panel.id} edge={edge} className="comic-handle" data-edge={edge} aria-label={"Resize panel "+(index+1)+" "+edge}/>)}
      </Shape>)}
    </Root>}
  </div>;
}
