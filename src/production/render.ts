import type {ComicPage} from "./model";
type ImageAsset={id:string;src?:string};
function loadImage(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("Could not load image"));im.src=src});
}
function cover(ctx:CanvasRenderingContext2D,im:HTMLImageElement,x:number,y:number,w:number,h:number){
  const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight),dw=im.naturalWidth*scale,dh=im.naturalHeight*scale;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);ctx.restore();
}
export async function renderPage(page:ComicPage,assets:ImageAsset[],width:number,height:number):Promise<HTMLCanvasElement>{
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
  ctx.fillStyle="#f2eee7";ctx.fillRect(0,0,width,height);
  for(const p of page.panels){const x=p.x*width,y=p.y*height,w=p.w*width,h=p.h*height;
    ctx.fillStyle="#31343a";ctx.fillRect(x,y,w,h);
    const src=assets.find(a=>a.id===p.assetId)?.src;
    if(src)await loadImage(src).then(im=>cover(ctx,im,x,y,w,h));
    if(p.dialogue.trim()){
      const font=Math.max(12,Math.min(width*.027,w*.11));ctx.font=font+"px sans-serif";
      const lines:string[]=[];let line="";
      for(const word of p.dialogue.split(/\s+/)){if(line&&ctx.measureText(line+" "+word).width>w*.78){lines.push(line);line=word}else line+=(line?" ":"")+word}
      if(line)lines.push(line);
      const visible=lines.slice(0,Math.max(1,Math.floor((h*.55-font)/ (font*1.25))));const bh=(visible.length+1)*font*1.25;
      ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle="#fff";ctx.fillRect(x+w*.06,y+h-bh-h*.04,w*.88,bh);
      ctx.fillStyle="#141414";ctx.textAlign="center";visible.forEach((l,i)=>ctx.fillText(l,x+w/2,y+h-bh-h*.04+font*(i+1.35),w*.8));ctx.restore();
    }
    ctx.strokeStyle="#111";ctx.lineWidth=Math.max(2,width*.002);ctx.strokeRect(x,y,w,h);
  }
  return canvas;
}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export async function exportPng(page:ComicPage,assets:ImageAsset[],w:number,h:number){
  const canvas=await renderPage(page,assets,w,h);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("PNG export failed")),"image/png"));download(blob,page.title.replace(/[^a-z0-9-]/gi,"-")+".png");
}
/** Silent image-page sequence. Real-time browser encoding, not the video timeline renderer. */
export async function exportMotion(pages:ComicPage[],assets:ImageAsset[],w:number,h:number,fps:number,signal:AbortSignal,progress:(n:number)=>void){
  if(!pages.length||typeof MediaRecorder==="undefined")throw Error("Browser recording unavailable");
  const total=pages.reduce((n,p)=>n+p.seconds,0);if(total>120||total<=0||pages.some(p=>p.seconds<1||p.seconds>30))throw Error("Motion export supports 1–120 seconds");
  const canvases=await Promise.all(pages.map(p=>renderPage(p,assets,w,h)));if(signal.aborted)throw Error("Canceled");
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");if(!ctx||!canvas.captureStream)throw Error("Canvas capture unavailable");
  ctx.drawImage(canvases[0],0,0);
  const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error("WebM encoding unavailable");
  const stream=canvas.captureStream(Math.min(30,fps)),chunks:Blob[]=[];
  try{
    const recorder=new MediaRecorder(stream,{mimeType:mime});
    const result=new Promise<Blob>((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>resolve(new Blob(chunks,{type:"video/webm"}));recorder.onerror=()=>reject(Error("Encoding failed"))});
    recorder.start(200);
    const start=performance.now();
    await new Promise<void>(resolve=>{function tick(now:number){if(signal.aborted||recorder.state==="inactive"){resolve();return}const elapsed=(now-start)/1000;let n=0,i=0;while(i<pages.length-1&&elapsed>=n+pages[i].seconds){n+=pages[i].seconds;i++}ctx.drawImage(canvases[i],0,0);progress(Math.min(1,elapsed/total));if(elapsed>=total)resolve();else requestAnimationFrame(tick)}requestAnimationFrame(tick)});
    if(recorder.state!=="inactive")recorder.stop();const blob=await result;if(signal.aborted)throw Error("Canceled");if(!blob.size)throw Error("No video encoded");download(blob,"motion-comic.webm");
  }finally{stream.getTracks().forEach(t=>t.stop())}
}
