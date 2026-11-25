import type {Project} from "../studio/project";
export function buildMediaPrompt(project:Project,request:string,includeContext:boolean):string{
 const prompt=request.trim().slice(0,4000);
 if(!includeContext)return prompt;
 const p=project.production;
 const context={title:project.name,format:project.format,resolution:[project.width,project.height],storyBible:project.story.slice(0,2200),style:p?.style.slice(0,1200)??"",cast:project.characters.slice(0,20).map(c=>({name:c.name,description:c.description.slice(0,250)})),scenes:p?.chapters.flatMap(c=>c.scenes.map(s=>({chapter:c.title,title:s.title,summary:s.summary.slice(0,180)}))).slice(0,20)??[]};
 return (prompt+"\n\nProject context (reference only):\n"+JSON.stringify(context)).slice(0,12000);
}
export function readPath(value:unknown,path:string):unknown{
 if(!path)return undefined;
 let current=value;
 for(const segment of path.split(".")){
  if(!segment||["__proto__","prototype","constructor"].includes(segment)||typeof current!=="object"||current===null||!Object.prototype.hasOwnProperty.call(current,segment))return undefined;
  current=(current as Record<string,unknown>)[segment];
 }
 return current;
}
export function safeImageUrl(value:unknown,hosts:string[]):string|undefined{
 if(typeof value!=="string"||value.length>4096)return undefined;
 try{const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password||url.port||!hosts.some(h=>h===url.hostname))return undefined;return url.href}catch{return undefined}
}
export function extractMedia(result:unknown,outputPath:string,jobPath:string,hosts:string[]){
 const r=result as {structuredContent?:unknown;content?:{type?:string;text?:string;data?:string;mimeType?:string}[]};
 let data=r.structuredContent;
 if(data===undefined){const raw=r.content?.find(c=>c.type==="text")?.text;if(raw&&raw.length<200000){try{data=JSON.parse(raw)}catch{data=undefined}}}
 const url=safeImageUrl(readPath(data,outputPath),hosts);
 const job=readPath(data,jobPath);
 const inline=r.content?.find(c=>c.type==="image"&&typeof c.data==="string"&&c.data.length<=1000000&&/^[A-Za-z0-9+/=]+$/.test(c.data)&&["image/png","image/jpeg","image/webp"].includes(c.mimeType??""));
 return {imageUrl:url,imageData:inline?"data:"+inline.mimeType+";base64,"+inline.data:undefined,jobId:typeof job==="string"&&job.length<=200?job:undefined};
}
