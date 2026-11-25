"use client";
import {useLayoutEffect,useRef,useState,useMemo,type CSSProperties} from "react";
import {createChange,createResize,createSelection,createViewport,createMove,createLasso,definePrimitive,live,type ResizeDraft,type MoveDraft,type LassoDraft} from "@ui-sdk/core";
import {createParts} from "@ui-sdk/react/primitive";
import {Toolbar,ToolbarButton,ToolbarSeparator} from "@ui-sdk/react/toolbar";
import {ZoomIn as ZoomInIcon,ZoomOut as ZoomOutIcon,Maximize} from "lucide-react";
import type {Project} from "../studio/project";
import type {ComicPage} from "./model";
import {pageBoxes,applyBoxes,boxPositions,groupBounds,positionsToBoxes,type PixelBoxes,type PixelPoint} from "./canvas-geometry";
type Handle="n"|"ne"|"e"|"se"|"s"|"sw"|"w"|"nw";
const handles:Handle[]=["n","ne","e","se","s","sw","w","nw"];
type Options={boxes:PixelBoxes;selected:string[];locked:string[];width:number;height:number;frameWidth:number;frameHeight:number;onBoxesChange?:(value:PixelBoxes)=>void;onSelectedChange?:(value:string[])=>void};
type State={boxes:PixelBoxes;selected:string[];draft:ResizeDraft|null;moving:MoveDraft|null;lasso:LassoDraft|null;positions:Record<string,PixelPoint>;viewport:{x:number;y:number;zoom:number}};
const canvas=definePrimitive({
  name:"comic-canvas",
  options:{boxes:"value",selected:"list",locked:"list",width:"number",height:"number",frameWidth:"number",frameHeight:"number",onBoxesChange:"callback",onSelectedChange:"callback"},
  controlled:["boxes","selected"],
  state:(o:Options):State=>({boxes:o.boxes,selected:o.selected,draft:null,moving:null,lasso:null,positions:boxPositions(o.boxes),viewport:{x:(o.frameWidth-o.width)/2,y:(o.frameHeight-o.height)/2,zoom:1}}),
  sync:(o)=>({boxes:o.boxes,selected:o.selected,positions:boxPositions(o.boxes)}),
  live:["draft","viewport","moving","lasso"],
  api:(context)=>{
    const change=createChange(context);
    const viewport=createViewport(context,{key:"viewport",surface:()=>context.element("frame")});
    const resize=createResize(context,{
      boxes:state=>state.boxes,draft:"draft",
      set:(value,details)=>change("boxes",value,details),
      bounds:()=>({left:0,top:0,right:context.options().width,bottom:context.options().height}),
      min:()=>({width:context.options().width*.05,height:context.options().height*.05}),
      disabled:key=>context.options().locked.includes(key),
      step:()=>1,
      scale:()=>context.store.get().viewport.zoom,
      label:key=>"Panel "+(Object.keys(context.store.get().boxes).indexOf(key)+1)
    });
    const selection=createSelection(context,{key:"selected",multiple:()=>true,set:(value,details)=>change("selected",value,details),order:()=>Object.keys(context.store.get().boxes)});
    const group=(key:string)=>{const s=context.store.get();return (s.selected.includes(key)?s.selected:[key]).filter(k=>!context.options().locked.includes(k))};
    const move=createMove(context,{key:"positions",draft:"moving",group,disabled:key=>context.options().locked.includes(key),scale:()=>context.store.get().viewport.zoom,step:()=>1,
      bounds:key=>groupBounds(context.store.get().boxes,group(key),key,context.options().width,context.options().height),
      set:(value,details)=>change("boxes",positionsToBoxes(context.store.get().boxes,value,context.options().locked),details)});
    const lasso=createLasso(context,{slot:"shape",draft:"lasso",selected:()=>context.store.get().selected,set:(keys,details)=>change("selected",keys,details)});
    function select(key:string,event:PointerEvent|KeyboardEvent){
      const details={reason:"item-press" as const,event};
      if(event.ctrlKey||event.metaKey)selection.toggle(key,details);
      else if(event.shiftKey)selection.extend(key,details);
      else if(!selection.isSelected(key))selection.choose(key,details);
    }
    return {resize,selection,viewport,move,lasso,select,group,fit:()=>{const o=context.options();viewport.setViewport({x:(o.frameWidth-o.width)/2,y:(o.frameHeight-o.height)/2,zoom:1})}};
  },
  slots:slot=>({
    root:slot({attrs:()=>({role:"group","aria-label":"Comic canvas"})}),
    frame:slot({
      attrs:()=>({tabindex:"0",role:"region","aria-label":"Canvas viewport"}),
      on:{
        wheel:(event,{api})=>api.viewport.wheel(event),
        pointerdown:(event,{api,el})=>{if(event.button!==0||!el||event.target!==el)return;if(event.shiftKey)api.lasso.pointerdown(event,el);else api.viewport.pointerdown(event)},
        keydown:(event,{api,el})=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="a"){event.preventDefault();api.selection.toggleAll({reason:"list-navigation",event});return}if(event.target===el)api.viewport.keydown(event)}
      }
    }),
    world:slot({live:live((state,{api})=>({style:api.viewport.style(state)}))}),
    rectangle:slot({attrs:()=>({"aria-hidden":"true"}),live:live((state,{api})=>({style:api.lasso.style(state)}))}),
    zoomIn:slot({attrs:()=>({type:"button"}),press:({api})=>api.viewport.zoomBy(1.25)}),
    zoomOut:slot({attrs:()=>({type:"button"}),press:({api})=>api.viewport.zoomBy(.8)}),
    fit:slot({attrs:()=>({type:"button"}),press:({api})=>api.fit()}),
    zoomLabel:slot({attrs:()=>({"aria-label":"Canvas zoom"}),live:live(state=>({"data-zoom":Math.round(state.viewport.zoom*100)+"%"}))}),
    shape:slot<{value:string}>({
      props:{value:"string"},
      attrs:(state,{api,key})=>({style:api.resize.boxStyle(state,key),"data-selected":String(state.selected.includes(key))}),
      live:live((state,{api,key})=>({style:state.moving?api.move.style(state,key):api.resize.style(state,key),"data-lassoed":api.lasso.touches(state,key)?"true":undefined})),
    }),
    move:slot<{value:string}>({
      props:{value:"string"},
      attrs:(state,{key})=>({type:"button","aria-pressed":String(state.selected.includes(key))}),
      on:{
        pointerdown:(event,{api,key,el})=>{if(event.button!==0||!el)return;api.select(key,event);if(event.ctrlKey||event.metaKey||event.shiftKey)return;if(api.group(key).length>1)api.move.pointerdown(event,key,el);else api.resize.pointerdown(event,key,"move",el)},
        keydown:(event,{api,key})=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();api.select(key,event)}else if(api.group(key).length>1)api.move.keydown(event,key);else api.resize.keydown(event,key,"move")},
      },

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
const {Root,Frame,World,Rectangle,ZoomIn,ZoomOut,Fit,ZoomLabel,Shape,Move,Handle:ResizeHandle}=createParts(canvas,{root:"div",frame:"div",world:"div",rectangle:"div",zoomIn:"button",zoomOut:"button",fit:"button",zoomLabel:"span",shape:"div",move:"button",handle:"button"});
type Props={page:ComicPage;width:number;height:number;assets:Project["assets"];selected:string[];onSelect:(ids:string[])=>void;onCommit:(page:ComicPage)=>void};
export function ComicCanvas({page,width,height,assets,selected,onSelect,onCommit}:Props){
  const frame=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:0,height:0});
  useLayoutEffect(()=>{const el=frame.current;if(!el)return;const measure=()=>{const w=el.clientWidth,h=el.clientHeight;setSize(s=>s.width===w&&s.height===h?s:{width:w,height:h})};measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect()},[]);
  const sheetWidth=Math.max(1,Math.min(640,size.width-24,(size.height-24)*width/height)),sheetHeight=sheetWidth*height/width;
  const boxes=useMemo(()=>pageBoxes(page.panels,sheetWidth,sheetHeight),[page.panels,sheetWidth,sheetHeight]);
  const locked=useMemo(()=>page.panels.filter(p=>p.locked).map(p=>p.id),[page.panels]);
  return <div className="comic-builder">
    <div ref={frame} className="comic-frame-measure"/>
    {size.width>24&&size.height>24&&<Root key={size.width+":"+size.height} className="comic-canvas-root" boxes={boxes} selected={selected} locked={locked} width={sheetWidth} height={sheetHeight} frameWidth={size.width} frameHeight={size.height} onSelectedChange={onSelect} onBoxesChange={value=>{const next=applyBoxes(page,value,sheetWidth,sheetHeight);if(next!==page)onCommit(next)}}>
      <Toolbar aria-label="Canvas view" className="comic-view-tools">
        <ToolbarButton render={<ZoomOut/>} aria-label="Zoom out canvas"><ZoomOutIcon size={15}/></ToolbarButton>
        <ZoomLabel className="comic-zoom-label"/>
        <ToolbarButton render={<ZoomIn/>} aria-label="Zoom in canvas"><ZoomInIcon size={15}/></ToolbarButton>
        <ToolbarSeparator/>
        <ToolbarButton render={<Fit/>} aria-label="Fit comic page"><Maximize size={14}/> Fit</ToolbarButton>
        <span className="muted comic-view-hint">Drag to pan · Shift-drag to select</span>
      </Toolbar>
      <Frame className="comic-viewport" style={{height:size.height}}>
        <World className="comic-world"><div className="comic-sheet" style={{width:sheetWidth,height:sheetHeight} as CSSProperties}>
      {page.panels.map((panel,index)=><Shape key={panel.id} value={panel.id} className="comic-panel" data-locked={panel.locked?"true":undefined}>
        <Move value={panel.id} className="comic-panel-content" aria-label={"Select panel "+(index+1)}>
          {assets.find(a=>a.id===panel.assetId)?.src?<img draggable={false} alt="" src={assets.find(a=>a.id===panel.assetId)!.src}/>:<span>Panel {index+1}</span>}{panel.dialogue&&<span className="speech">{panel.dialogue}</span>}
        </Move>
        {selected.length===1&&selected.includes(panel.id)&&!panel.locked&&handles.map(edge=><ResizeHandle key={edge} value={panel.id+":"+edge} panelId={panel.id} edge={edge} className="comic-handle" data-edge={edge} aria-label={"Resize panel "+(index+1)+" "+edge}/>)}
      </Shape>)}
        </div></World><Rectangle className="comic-lasso"/>
      </Frame>
    </Root>}
  </div>;
}
