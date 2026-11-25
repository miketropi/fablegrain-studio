"use client";
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from "react";
import {bindDrag} from "@ui-sdk/core";
import {Toolbar,ToolbarButton,ToolbarSeparator} from "@ui-sdk/react/toolbar";
import {Play,Pause,SkipBack,Scissors,Diamond,Magnet,Undo2,Redo2,Plus,Trash2} from "lucide-react";
import {addKeyframe,clamp,editClip,frameAt,splitClip,timecode,moveToTrack,type Clip,type Edit,type Sequence} from "./timeline";

type Props={sequence:Sequence; onCommit:(s:Sequence)=>void; frame:number; setFrame:(f:number)=>void; selected:string|null; setSelected:(id:string|null)=>void; undo:()=>void; redo:()=>void; canUndo:boolean; canRedo:boolean};
export default function Timeline({sequence,onCommit,frame,setFrame,selected,setSelected,undo,redo,canUndo,canRedo}:Props){
  const [height,setHeight]=useState(248),[zoom,setZoom]=useState(1),[snap,setSnap]=useState(true),[playing,setPlaying]=useState(false),[draft,setDraft]=useState<Sequence|null>(null);
  const cleanup=useRef<(()=>void)|undefined>(undefined);
  const pixels=zoom*3, current=draft??sequence, active=sequence.clips.find(c=>c.id===selected);
  useEffect(()=>()=>cleanup.current?.(),[]);
  useEffect(()=>{
    if(!playing)return;
    const start=performance.now(),initial=frame;
    let raf=0;
    const tick=(now:number)=>{const next=Math.min(sequence.duration,initial+Math.floor((now-start)*sequence.fps/1000));setFrame(next);if(next<sequence.duration)raf=requestAnimationFrame(tick);else setPlaying(false)};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
    // Playback captures the frame when Play is pressed, not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing,sequence.duration,sequence.fps]);
  function drag(e:ReactPointerEvent<HTMLElement>,clip:Clip,mode:Edit){
    if(e.button!==0)return;
    e.stopPropagation();setPlaying(false);setSelected(clip.id);cleanup.current?.();setDraft(null);
    const initial=e.clientX;let result=sequence; const surface=e.currentTarget.closest('.time-surface');const origin=surface?.getBoundingClientRect().left??0;
    cleanup.current=bindDrag(e.currentTarget,e.nativeEvent,{threshold:3,cancelOnEscape:true,onMove:({x,y})=>{const delta=frameAt(x-initial+origin-(surface?.getBoundingClientRect().left??origin),pixels);const target=surface?.querySelectorAll<HTMLElement>("[data-track-id]");const row=target&&Array.from(target).find(el=>{const r=el.getBoundingClientRect();return y>=r.top&&y<r.bottom});const id=row?.dataset.trackId;result=mode==="move"&&id&&id!==clip.trackId?moveToTrack(sequence,clip.id,id,clip.start+delta):editClip(sequence,clip.id,mode,delta,snap?Math.ceil(7/pixels):0,frame);setDraft(result)},onEnd:(_event,canceled)=>{setDraft(null);if(!canceled&&result!==sequence)onCommit(result);cleanup.current=undefined}});
  }
  function scrub(e:ReactPointerEvent<HTMLDivElement>){
    if(e.button!==0)return;
    setPlaying(false);cleanup.current?.();setDraft(null);
    const el=e.currentTarget, origin=el.getBoundingClientRect().left, previous=frame;
    const seek=(x:number)=>setFrame(clamp(frameAt(x-origin,pixels),0,sequence.duration));
    seek(e.clientX);
    cleanup.current=bindDrag(el,e.nativeEvent,{threshold:0,cancelOnEscape:true,onMove:({x})=>seek(x),onEnd:(_event,canceled)=>{if(canceled)setFrame(previous);cleanup.current=undefined}});
  }
  function addClip(){
    const track=sequence.tracks.find(t=>t.id===active?.trackId)??sequence.tracks[0];
    if(!track)return;
    const start=Math.max(0,...sequence.clips.filter(c=>c.trackId===track.id).map(c=>c.end));
    const end=start+sequence.fps*2,id=crypto.randomUUID();
    onCommit({...sequence,duration:Math.max(sequence.duration,end),clips:[...sequence.clips,{id,trackId:track.id,name:"New clip",start,end,keyframes:[]}]});setSelected(id);
  }
  return <section className="timeline" aria-label="Timeline editor" style={{"--timeline-height":height+"px"} as React.CSSProperties}><div className="timeline-resize" role="separator" aria-label="Resize timeline" aria-orientation="horizontal" tabIndex={0} onKeyDown={e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();setHeight(h=>clamp(h+(e.key==="ArrowUp"?16:-16),170,Math.min(500,window.innerHeight*.6)))}}} onPointerDown={e=>{if(e.button!==0)return;cleanup.current?.();const start=e.clientY,initial=height;cleanup.current=bindDrag(e.currentTarget,e.nativeEvent,{threshold:0,cancelOnEscape:true,onMove:({y})=>setHeight(clamp(initial+start-y,170,Math.max(170,Math.min(500,window.innerHeight*.6)))),onEnd:(_e,cancelled)=>{if(cancelled)setHeight(initial);cleanup.current=undefined}})}}/>
    <div className="timeline-bar"><strong>Timeline <small>{sequence.clips.length} clips</small></strong><Toolbar aria-label="Timeline tools" className="tools">
      <ToolbarButton title="Undo" aria-label="Undo" disabled={!canUndo} onClick={undo}><Undo2/></ToolbarButton>
      <ToolbarButton title="Redo" aria-label="Redo" disabled={!canRedo} onClick={redo}><Redo2/></ToolbarButton><ToolbarSeparator/>
      <ToolbarButton title="Start" aria-label="Start" onClick={()=>{setPlaying(false);setFrame(0)}}><SkipBack/></ToolbarButton>
      <ToolbarButton title={playing?"Pause":"Play"} aria-label={playing?"Pause":"Play"} onClick={()=>{if(frame>=sequence.duration)setFrame(0);setPlaying(!playing)}}>{playing?<Pause/>:<Play/>}</ToolbarButton>
      <ToolbarButton title="Split clip" aria-label="Split clip" disabled={!active||frame<=active.start||frame>=active.end} onClick={()=>active&&onCommit(splitClip(sequence,active.id,frame,crypto.randomUUID()))}><Scissors/></ToolbarButton>
      <ToolbarButton title="Add keyframe" aria-label="Add keyframe" disabled={!active||frame<active.start||frame>=active.end} onClick={()=>active&&onCommit(addKeyframe(sequence,active.id,frame))}><Diamond/></ToolbarButton>
      <ToolbarButton title="Snapping" aria-label="Snapping" aria-pressed={snap} onClick={()=>setSnap(!snap)}><Magnet/></ToolbarButton>
      <ToolbarButton title="Add placeholder clip" aria-label="Add clip" onClick={addClip}><Plus/></ToolbarButton>
      <ToolbarButton title="Delete clip" aria-label="Delete clip" disabled={!active} onClick={()=>{onCommit({...sequence,clips:sequence.clips.filter(c=>c.id!==selected)});setSelected(null)}}><Trash2/></ToolbarButton>
    </Toolbar><output className="timecode">{timecode(frame,sequence.fps)} <span>/ {timecode(sequence.duration,sequence.fps)}</span></output><label className="zoom">Zoom <input aria-label="Timeline zoom" type="range" min=".5" max="4" step=".25" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label></div>
    <div className="timeline-scroll"><div className="track-labels"><div className="ruler-label">TRACK</div>{current.tracks.map(t=><div key={t.id} className="track-label">{t.name}</div>)}</div>
    <div className="time-surface" style={{width:Math.max(1,sequence.duration*pixels),minWidth:Math.max(1,sequence.duration*pixels)}}><div className="ruler" onPointerDown={scrub} role="slider" tabIndex={0} aria-label="Playhead" aria-valuemin={0} aria-valuemax={sequence.duration} aria-valuenow={frame} onKeyDown={e=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)){e.preventDefault();setPlaying(false);setFrame(e.key==="Home"?0:e.key==="End"?sequence.duration:clamp(frame+(e.key==="ArrowLeft"?-1:1),0,sequence.duration))}}}>
      {Array.from({length:Math.floor(sequence.duration/sequence.fps)+1},(_,i)=>i).map(i=><span key={i} style={{left:i*sequence.fps*pixels}}>{i}s</span>)}</div>
      {current.tracks.map(t=><div className="track" data-track-id={t.id} key={t.id} style={{backgroundSize:sequence.fps*pixels+"px 100%"}}>{sequence.clips.filter(c=>c.trackId===t.id).map(original=>{const c=current.clips.find(x=>x.id===original.id)??original;const y=(current.tracks.findIndex(x=>x.id===c.trackId)-current.tracks.findIndex(x=>x.id===original.trackId))*39;return <div key={c.id} role="button" tabIndex={0} aria-label={c.name} aria-pressed={selected===c.id} data-kind={t.kind} className={"clip "+(selected===c.id?"selected":"")} style={{left:c.start*pixels,width:(c.end-c.start)*pixels,transform:y?"translateY("+y+"px)":undefined,zIndex:y?3:undefined}} onPointerDown={e=>drag(e,original,"move")} onFocus={()=>setSelected(c.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ") {e.preventDefault();setSelected(c.id)} else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();onCommit(editClip(sequence,c.id,"move",e.key==="ArrowLeft"?-1:1))}}}>
        <span className="trim left" onPointerDown={e=>drag(e,original,"trim-start")}/><span className="clip-name">{c.name}</span><span className="trim right" onPointerDown={e=>drag(e,original,"trim-end")}/>{c.keyframes.map(k=><i key={k.frame} className="keyframe" style={{left:k.frame*pixels}}/>)}</div>})}</div>)}
      <div className="playhead" style={{left:frame*pixels}}/>
    {!sequence.clips.length&&<div className="timeline-empty">Add a clip or append comic pages to begin.</div>}</div></div>
  </section>;
}
