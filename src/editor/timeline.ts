export type TrackKind = "video" | "overlay" | "text" | "audio";
export type Track = { id: string; name: string; kind: TrackKind };
export type Keyframe = { frame: number; value: number };
export type Clip = { id: string; trackId: string; name: string; start: number; end: number; keyframes: Keyframe[] };
export type Sequence = { fps: number; duration: number; tracks: Track[]; clips: Clip[] };
export type Edit = "move" | "trim-start" | "trim-end";
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const frameAt = (x: number, pixelsPerFrame: number) => Math.round(x / pixelsPerFrame);
export function timecode(frame: number, fps: number) {
  const sec = Math.floor(frame / fps);
  return [Math.floor(sec / 60), sec % 60, frame % fps].map(n => String(n).padStart(2, "0")).join(":");
}
export function editClip(seq: Sequence, id: string, edit: Edit, delta: number, snapFrames = 0, playhead?: number): Sequence {
  const clip = seq.clips.find(c => c.id === id);
  if (!clip || !Number.isFinite(delta)) return seq;
  const siblings = seq.clips.filter(c => c.id !== id && c.trackId === clip.trackId);
  const left = Math.max(0, ...siblings.filter(c => c.end <= clip.start).map(c => c.end));
  const right = Math.min(seq.duration, ...siblings.filter(c => c.start >= clip.end).map(c => c.start));
  const edges = [0, seq.duration, ...seq.clips.filter(c => c.id !== id).flatMap(c => [c.start, c.end])];
  if (playhead !== undefined) edges.push(playhead);
  const snap = (n: number) => {
    if (snapFrames <= 0) return n;
    const nearest = edges.reduce((a,b) => Math.abs(a-n) <= Math.abs(b-n) ? a : b);
    return Math.abs(nearest-n) <= snapFrames ? nearest : n;
  };
  delta = Math.round(delta);
  let {start, end} = clip;
  if (edit === "move") {
    const length = end-start;
    const a = snap(start+delta) - (start+delta);
    const b = snap(end+delta) - (end+delta);
    const correction = a === 0 ? b : b === 0 ? a : Math.abs(a) <= Math.abs(b) ? a : b;
    start = clamp(start+delta+correction, left, right-length);
    end = start+length;
  } else if (edit === "trim-start") start = clamp(snap(start+delta), left, end-1);
  else end = clamp(snap(end+delta), start+1, right);
  if (start === clip.start && end === clip.end) return seq;
  const keyframes = clip.keyframes.map(k => ({...k, frame: edit === "move" ? k.frame : k.frame + clip.start - start}))
    .filter(k => k.frame >= 0 && k.frame < end-start);
  return {...seq, clips: seq.clips.map(c => c.id === id ? {...c, start, end, keyframes} : c)};
}
export function addKeyframe(seq: Sequence, id: string, frame: number, value = 1): Sequence {
  const clip = seq.clips.find(c => c.id === id);
  if (!clip || !Number.isInteger(frame) || frame < clip.start || frame >= clip.end || !Number.isFinite(value)) return seq;
  const local = frame-clip.start;
  return {...seq, clips: seq.clips.map(c => c.id === id ? {...c, keyframes: [...c.keyframes.filter(k => k.frame !== local), {frame:local,value}].sort((a,b) => a.frame-b.frame)} : c)};
}
export function splitClip(seq: Sequence, id: string, frame: number, newId: string): Sequence {
  const clip = seq.clips.find(c => c.id === id);
  if (!clip || !Number.isInteger(frame) || frame <= clip.start || frame >= clip.end || seq.clips.some(c => c.id === newId)) return seq;
  const offset = frame-clip.start;
  return {...seq, clips: seq.clips.flatMap(c => c.id !== id ? [c] : [
    {...c, end:frame, keyframes:c.keyframes.filter(k => k.frame < offset)},
    {...c,id:newId,start:frame,keyframes:c.keyframes.filter(k => k.frame >= offset).map(k => ({...k,frame:k.frame-offset}))}
  ])};
}
export function createSequence(fps: number): Sequence {
  const tracks: Track[] = [{id:"video",name:"Video",kind:"video"},{id:"overlay",name:"Overlay",kind:"overlay"},{id:"text",name:"Text",kind:"text"},{id:"audio",name:"Audio",kind:"audio"}];
  const c = (id:string,trackId:string,name:string,start:number,end:number): Clip => ({id,trackId,name,start:start*fps,end:end*fps,keyframes:[]});
  return {fps,duration:12*fps,tracks,clips:[c("opening","video","Opening",0,4),c("scene","video","Scene 02",4,8),c("ending","video","Ending",8,12),c("character","overlay","Character",1,9),c("title","text","Title",2,6),c("ambient","audio","Ambient audio",0,12)]};
}

/** Transfer a clip without introducing overlap. All times are integer frames. */
export function moveToTrack(seq: Sequence,id:string,trackId:string,start?:number):Sequence {
  const clip=seq.clips.find(c=>c.id===id);
  const target=seq.tracks.find(t=>t.id===trackId);
  const source=seq.tracks.find(t=>t.id===clip?.trackId);
  if(!clip||!target||!source||target.kind!==source.kind)return seq;
  const s=start??clip.start,d=clip.end-clip.start;
  if(!Number.isInteger(s)||s<0||s+d>seq.duration)return seq;
  if(seq.clips.some(c=>c.id!==id&&c.trackId===trackId&&c.start<s+d&&s<c.end))return seq;
  if(clip.trackId===trackId&&clip.start===s)return seq;
  return {...seq,clips:seq.clips.map(c=>c.id===id?{...c,trackId,start:s,end:s+d}:c)};
}
export function addTrack(seq:Sequence,track:Track):Sequence {
  return seq.tracks.some(t=>t.id===track.id)?seq:{...seq,tracks:[...seq.tracks,track]};
}
export function interpolate(keys:Keyframe[],frame:number,fallback=1):number {
  if(!keys.length)return fallback;
  const sorted=[...keys].sort((a,b)=>a.frame-b.frame);
  if(frame<=sorted[0].frame)return sorted[0].value;
  for(let i=1;i<sorted.length;i++){const l=sorted[i-1],r=sorted[i];if(frame<=r.frame)return l.value+(r.value-l.value)*(frame-l.frame)/(r.frame-l.frame||1);}
  return sorted[sorted.length-1].value;
}
