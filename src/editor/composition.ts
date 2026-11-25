import type {ComicPage} from "../production/model";
import type {Sequence,Clip} from "./timeline";
export function appendPages(sequence:Sequence,pages:ComicPage[],id:()=>string):Sequence{
  if(!pages.length)return sequence;
  const track=sequence.tracks.find(t=>t.kind==="video");
  if(!track)return sequence;
  let start=Math.max(0,...sequence.clips.filter(c=>c.trackId===track.id).map(c=>c.end));
  const clips:Clip[]=[];
  for(const page of pages){
    const seconds=Number.isFinite(page.seconds)?Math.max(1,Math.min(30,page.seconds)):3;
    const end=start+Math.round(seconds*sequence.fps);
    clips.push({id:id(),trackId:track.id,name:page.title,pageId:page.id,start,end,keyframes:[]});start=end;
  }
  return {...sequence,duration:Math.max(sequence.duration,start),clips:[...sequence.clips,...clips]};
}
/** Track order from bottom to top: video, overlays, text; audio is not visual. */
export function visualClips(sequence:Sequence,frame:number):Clip[]{
  const rank={video:0,overlay:1,text:2,audio:3};
  const tracks=[...sequence.tracks].filter(t=>t.kind!=="audio").sort((a,b)=>rank[a.kind]-rank[b.kind]);
  return tracks.flatMap(t=>sequence.clips.filter(c=>c.trackId===t.id&&c.start<=frame&&frame<c.end));
}
