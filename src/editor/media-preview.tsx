"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Button} from "@ui-sdk/react/button";
import type {Project} from "../studio/project";
import {renderPage,download} from "../production/render";
import {visualClips} from "./composition";
import {interpolate} from "./timeline";
type Source=HTMLCanvasElement|HTMLImageElement;
type Cache={pages:Map<string,Source>;assets:Map<string,Source>};
const image=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error("Image could not be decoded"));im.src=src});
async function load(project:Project):Promise<Cache>{
  const pages=new Map<string,Source>(),assets=new Map<string,Source>();
  const pageIds=new Set(project.sequence.clips.map(c=>c.pageId).filter(Boolean)),assetIds=new Set(project.sequence.clips.map(c=>c.assetId).filter(Boolean));
  for(const p of project.production?.pages??[])if(pageIds.has(p.id))pages.set(p.id,await renderPage(p,project.assets,project.width,project.height));
  for(const a of project.assets)if(a.src&&assetIds.has(a.id))assets.set(a.id,await image(a.src));
  return {pages,assets};
}
function draw(ctx:CanvasRenderingContext2D,project:Project,cache:Cache,frame:number,placeholder:boolean){
  const {width:w,height:h,sequence}=project;ctx.globalAlpha=1;ctx.fillStyle="#121316";ctx.fillRect(0,0,w,h);
  for(const c of visualClips(sequence,frame)){
    const track=sequence.tracks.find(t=>t.id===c.trackId);ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,interpolate(c.keyframes,frame-c.start)));
    const src=c.pageId?cache.pages.get(c.pageId):c.assetId?cache.assets.get(c.assetId):undefined;
    if(src){const sw=src instanceof HTMLCanvasElement?src.width:src.naturalWidth,sh=src instanceof HTMLCanvasElement?src.height:src.naturalHeight;const scale=Math.min(w/sw,h/sh);ctx.drawImage(src,(w-sw*scale)/2,(h-sh*scale)/2,sw*scale,sh*scale)}
    else if(track?.kind==="text"&&c.text){ctx.font=Math.round(w*.05)+"px sans-serif";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.shadowColor="#000";ctx.shadowBlur=8;ctx.fillText(c.text,w/2,h*.85,w*.9)}
    else if(placeholder&&track?.kind==="video"){ctx.font=Math.round(w*.035)+"px sans-serif";ctx.fillStyle="#91939c";ctx.textAlign="center";ctx.fillText(c.name+" — no source",w/2,h/2,w*.9)}
    ctx.restore();
  }
}
export default function MediaPreview({project,frame}:{project:Project;frame:number}){
  const canvas=useRef<HTMLCanvasElement>(null),abort=useRef<AbortController|null>(null);
  const [cache,setCache]=useState<Cache|null>(null),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0);
  const sources=useMemo(()=>JSON.stringify(project.sequence.clips.map(c=>[c.pageId,c.assetId])),[project.sequence.clips]);
  useEffect(()=>{let live=true;setCache(null);setStatus("");load(project).then(c=>{if(live)setCache(c)}).catch(e=>{if(live)setStatus(e.message)});return()=>{live=false}},[project.production?.pages,project.assets,project.width,project.height,sources]);
  useEffect(()=>{const ctx=canvas.current?.getContext("2d");if(ctx&&cache)draw(ctx,project,cache,Math.min(frame,Math.max(0,project.sequence.duration-1)),true)},[project,cache,frame]);
  useEffect(()=>()=>abort.current?.abort(),[]);
  async function output(){
    if(!cache||busy)return;
    const sequence=project.sequence;
    if(!sequence.clips.length||sequence.duration<=0||sequence.duration/sequence.fps>120){setStatus("Export requires a sequence between 1 and 120 seconds.");return}
    if(sequence.clips.some(c=>{const kind=sequence.tracks.find(t=>t.id===c.trackId)?.kind;return kind==="audio"||kind==="text"&&!c.text||kind!=="text"&&!(c.pageId?cache.pages.has(c.pageId):c.assetId&&cache.assets.has(c.assetId))})){setStatus("Remove audio and empty clips, or assign each visual clip a source before export.");return}
    if(typeof MediaRecorder==="undefined"){setStatus("Browser recording unavailable");return}
    const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));if(!mime){setStatus("WebM encoding unavailable");return}
    const c=document.createElement("canvas");c.width=project.width;c.height=project.height;const context=c.getContext("2d");if(!context||!c.captureStream){setStatus("Canvas capture unavailable");return}const ctx:CanvasRenderingContext2D=context;
    const controller=new AbortController();abort.current=controller;setBusy(true);setStatus("");setProgress(0);
    let stream:MediaStream|undefined;
    try{
      draw(ctx,project,cache,0,false);stream=c.captureStream(Math.min(30,sequence.fps));const recorder=new MediaRecorder(stream,{mimeType:mime}),chunks:Blob[]=[];
      const result=new Promise<Blob>((res,rej)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>res(new Blob(chunks,{type:"video/webm"}));recorder.onerror=()=>rej(Error("Recording failed"))});
      recorder.start(200);const start=performance.now(),duration=sequence.duration/sequence.fps*1000;
      await new Promise<void>(resolve=>{function tick(now:number){if(controller.signal.aborted||recorder.state==="inactive"){resolve();return}const elapsed=now-start;draw(ctx,project,cache,Math.min(sequence.duration-1,Math.floor(elapsed*sequence.fps/1000)),false);setProgress(Math.min(1,elapsed/duration));if(elapsed>=duration)resolve();else requestAnimationFrame(tick)}requestAnimationFrame(tick)});
      if(recorder.state!=="inactive")recorder.stop();const blob=await result;if(controller.signal.aborted)throw Error("Canceled");if(!blob.size)throw Error("No frames recorded");download(blob,"timeline.webm");setStatus("Export complete");
    }catch(e){setStatus(e instanceof Error?e.message:"Export failed")}finally{stream?.getTracks().forEach(t=>t.stop());setBusy(false);abort.current=null}
  }
  return <><div className="stage"><canvas ref={canvas} width={project.width} height={project.height} aria-label="Timeline visual preview" style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",background:"#121316",boxShadow:"0 8px 35px #0007"}}/></div><div className="canvas-foot" style={{gap:8,flexWrap:"wrap"}}><span>{status||(!cache?"Loading visual sources…":"Image, comic and text preview · silent")}</span>{busy&&<progress value={progress} max={1}/>}<Button disabled={busy||!cache} onClick={()=>void output()}>Export timeline WebM</Button>{busy&&<Button onClick={()=>abort.current?.abort()}>Cancel</Button>}</div></>
}
