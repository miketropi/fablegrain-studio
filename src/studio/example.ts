import type { Project } from "./project";
import type { CharacterAction } from "../scenes/actions";
import type { Panel,ComicPage } from "../production/model";
export const EXAMPLE_ID="example-last-signal";

// Original, embedded graphic-novel illustrations. Self-contained, no network or AI calls.
const ink="#17252e", pale="#d5d0b9", teal="#7dc3bd", orange="#eab079";
const sky=(top:string,bottom:string)=>`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="800" height="640" fill="url(#sky)"/>`;
const stars='<g fill="#ddd9c2" opacity=".65"><circle cx="98" cy="74" r="2"/><circle cx="230" cy="113" r="3"/><circle cx="656" cy="59" r="2"/><circle cx="545" cy="153" r="2"/><circle cx="328" cy="63" r="2"/><circle cx="721" cy="139" r="3"/></g>';
const skyline='<path fill="#314651" d="M0 390V228h72v87h43V198h54v96h44V152h79v177h45v-83h74v57h41V182h51v130h67V227h65v100h45V169h67v221z"/><path fill="#22343e" d="M0 420v-98h94v-50h64v91h90v-99h48v80h105v-77h81v57h94v-61h69v100h55v-116h100v173z"/><path fill="#111f28" d="M0 405l160-14 94 23 184-8 154-23 208 23v234H0z"/><g fill="#b7bfae" opacity=".42"><path d="M132 215h8v17h-8zM229 188h11v20h-11zM255 223h8v20h-8zM466 210h8v15h-8zM694 199h12v21h-12zM718 239h10v20h-10z"/></g>';
const person=(x:number,y:number,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="0" cy="213" rx="86" ry="16" fill="#101b24" opacity=".5"/><path d="M-32 118L-40 205h25l18-79 11 79h27l-13-92" fill="#1b2832" stroke="#101c24" stroke-width="5"/><path d="M-62 108L-36 28 34 24 58 112 37 150h-79z" fill="#46636b" stroke="#14232d" stroke-width="5"/><path d="M-58 48l-32 75 21 10 37-65M42 47l40 58-19 15-38-50" fill="#405961" stroke="#14232d" stroke-width="5"/><path d="M-41 46q35 19 78-3l-6 25-67 2z" fill="#d49b67"/><path d="M-36 7q-12-42 35-53 47 9 41 54l-22 27h-42z" fill="#243b45" stroke="#14232d" stroke-width="5"/><path d="M-25-3q6-21 42-19l11 22-9 19h-30z" fill="#ccb69b"/><path d="M-23-4h47v10h-47z" fill="#1b303b"/><path d="M-8 1h11m9 0h10" stroke="#a0ded6" stroke-width="3"/><path d="M-40 76l20 50h36l-12-50z" fill="#344952"/><path d="M-21 122h15v12h-15z" fill="#e4aa73"/></g>`;
const drone=(x:number,y:number,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-86-8l32-32h108L86-8 50 38h-100z" fill="#293c48" stroke="#14232d" stroke-width="6"/><path d="M-57-9h114v22H-57z" fill="#132732"/><path d="M-37 1h74" stroke="#82e4ce" stroke-width="9"/><path d="M-65 37l-18 29M65 37l18 29M0 40v33" stroke="#7ca29f" stroke-width="5"/><circle cx="0" cy="78" r="5" fill="#8de6d2"/></g>`;
const signal=(x:number,y:number)=>`<g transform="translate(${x} ${y})"><circle r="108" fill="#74cbb8" opacity=".08"/><circle r="80" fill="none" stroke="#a2d8bd" stroke-width="2" opacity=".35"/><path d="M-54-46q54-50 108 0M-34-26q34-30 68 0M-14-6q14-12 28 0" fill="none" stroke="#a3e5c6" stroke-width="7" stroke-linecap="round"/><rect x="-36" y="16" width="72" height="94" rx="9" fill="#334c53" stroke="#14232d" stroke-width="5"/><rect x="-23" y="31" width="46" height="33" fill="#8fdec4"/><path d="M-16 48h9l7-10 8 20 7-10h8" stroke="#224745" stroke-width="3" fill="none"/><circle cy="87" r="7" fill="#e8b078"/></g>`;
const svg=(body:string)=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" viewBox="0 0 800 640">'+body+'</svg>');
const scenes=[
{id:"city",name:"01 · The silent city",kind:"Environment",src:svg(sky("#203645","#c19c7d")+stars+'<circle cx="600" cy="140" r="77" fill="#d1c4a7" opacity=".88"/>'+skyline+'<path d="M365 640l69-235 135 235z" fill="#384d54"/><path d="M0 540l292-82M800 523l-230-68" stroke="#576d72" stroke-width="4"/>'+person(395,454,.78))},
{id:"device",name:"02 · Signal detected",kind:"Prop",src:svg(sky("#172a33","#385454")+'<path d="M0 510l800-140v270H0z" fill="#192a32"/><path d="M45 590l290-162 194 83-216 129z" fill="#465e63" stroke="#14232d" stroke-width="6"/>'+signal(402,285)+'<path d="M505 520l160-68 135 51v137H588z" fill="#46636b" stroke="#14232d" stroke-width="8"/>')},
{id:"traveler-close",name:"03 · Asha hears the voice",kind:"Scene",src:svg(sky("#344e59","#a38e73")+'<circle cx="628" cy="151" r="99" fill="#b7b6a2" opacity=".5"/><path d="M0 440l130-130 84 86 110-150 144 168 100-83 232 109v200H0z" fill="#263c46"/>'+person(392,200,1.9)+'<path d="M80 75l120 25M62 100l98 30" stroke="#a7bbb7" opacity=".45" stroke-width="3"/>')},
{id:"tower",name:"04 · Beacon tower",kind:"Environment",src:svg(sky("#20323e","#7d9b95")+stars+skyline+'<path d="M325 555l38-348h74l36 348z" fill="#50686a" stroke="#17252e" stroke-width="8"/><path d="M386 207V84h26v123" stroke="#d5d0b9" stroke-width="8"/><circle cx="399" cy="85" r="54" fill="#7dc3bd" opacity=".24"/><circle cx="399" cy="85" r="10" fill="#b8f1d6"/><path d="M80 620l260-105 127-4 252 109" fill="#21333c"/>'+person(224,473,.62))},
{id:"observer",name:"05 · The observer",kind:"Scene",src:svg(sky("#253944","#526e72")+'<path d="M0 540l800-80v180H0z" fill="#1b2d36"/><circle cx="410" cy="278" r="198" fill="#9cd8ba" opacity=".1"/><circle cx="410" cy="278" r="158" fill="none" stroke="#87baae" opacity=".35" stroke-width="3"/>'+drone(408,276,2.1)+'<path d="M110 514l190-110M690 514L510 404" stroke="#638a8b" stroke-width="4" opacity=".5"/>')},
{id:"dawn",name:"06 · The city answers",kind:"Scene",src:svg(sky("#5e838d","#e1b582")+'<circle cx="522" cy="239" r="128" fill="#f3d4a3"/>'+skyline+'<path d="M0 551l216-70 143 24 135-51 306 87v99H0z" fill="#263943"/><path d="M145 535l456-32" stroke="#a6b7a2" stroke-width="3"/>'+person(317,440,.85)+drone(525,375,.8))},
{id:"asha-ref",name:"Asha · Character reference",kind:"Character",src:svg('<rect width="800" height="640" fill="#d2cec0"/><g stroke="#a7b0a9" stroke-width="2"><path d="M0 150h800M0 460h800M400 0v640" stroke-dasharray="6 8"/></g>'+person(220,235,1.45)+person(580,230,1.45)+'<path d="M515 122h125v118H515z" fill="none" stroke="#788986" stroke-width="2"/><g fill="#273c43" font-family="sans-serif" font-size="20"><text x="40" y="48">ASHA / TRAVELER</text><text x="160" y="590">FULL BODY</text><text x="525" y="590">COLOR STUDY</text></g><rect x="510" y="84" width="32" height="24" fill="#46636b"/><rect x="550" y="84" width="32" height="24" fill="#d49b67"/><rect x="590" y="84" width="32" height="24" fill="#ccb69b"/>')},
{id:"observer-ref",name:"Observer · Design reference",kind:"Character",src:svg('<rect width="800" height="640" fill="#cdd0c5"/><g stroke="#a4ada7" stroke-width="2"><path d="M0 180h800M0 460h800M400 0v640" stroke-dasharray="6 8"/></g>'+drone(205,294,1.6)+drone(594,294,1.15)+'<g fill="#273c43" font-family="sans-serif" font-size="20"><text x="40" y="48">OBSERVER / SERVICE DRONE</text><text x="160" y="530">FRONT</text><text x="525" y="530">SCALE STUDY</text></g>')}
];
const sceneAssets:Project["assets"]=[
 {id:"scene-city",name:"City · Background",kind:"Background",src:svg(sky("#203645","#c19c7d")+stars+'<circle cx="600" cy="140" r="77" fill="#d1c4a7"/>'+skyline+'<path d="M365 640l69-235 135 235z" fill="#384d54"/>')},
 {id:"scene-asha",name:"Asha · Standing",kind:"Character pose",characterId:"asha",src:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="310" viewBox="-110 -65 220 310">'+person(0,0)+'</svg>')},
 {id:"scene-observer",name:"Observer · Hover",kind:"Character pose",characterId:"observer-character",src:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="145" viewBox="-100 -50 200 145">'+drone(0,0)+'</svg>')}
];
const extraPoses:Project["assets"]=[{id:"scene-asha-reach",name:"Asha · Reaching",kind:"Character pose",characterId:"asha",src:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="310" viewBox="-110 -65 220 310">'+person(0,0).replace("M-58 48l-32 75 21 10 37-65M42 47l40 58-19 15-38-50","M-58 48l-32 75 21 10 37-65M42 47l51-41 12 15-62 58")+'</svg>')},{id:"scene-observer-dim",name:"Observer · Dim light",kind:"Character pose",characterId:"observer-character",src:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="145" viewBox="-100 -50 200 145">'+drone(0,0).replaceAll("#82e4ce","#426e71").replaceAll("#8de6d2","#426e71")+'</svg>')}];
const actorFrame=(id:string,name:string,body:string):Project["assets"][number]=>({id,name,kind:"Character action frame",characterId:"asha",src:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="310" viewBox="-110 -65 220 310">'+body+'</svg>')});
const standing=person(0,0);
const legs="M-32 118L-40 205h25l18-79 11 79h27l-13-92",arms="M-58 48l-32 75 21 10 37-65M42 47l40 58-19 15-38-50";
const actionFrames:Project["assets"]=[
 actorFrame("asha-idle-1","Idle · breathe",standing.replace('scale(1)','scale(1 .985)')),
 actorFrame("asha-walk-1","Walk · contact L",standing.replace(legs,"M-32 118L-67 202h24l39-64 35 63h25l-29-83").replace(arms,"M-58 48l-18 60 20 11 31-55M42 47l23 73 20-9-25-73")),
 actorFrame("asha-walk-2","Walk · passing L",standing.replace(legs,"M-32 118L-18 205H6l-10-72 23 45 22-8-14-52").replace(arms,"M-58 48l-18 75 20 8 27-67M42 47l29 62-20 11-23-62")),
 actorFrame("asha-walk-3","Walk · contact R",standing.replace(legs,"M-32 118L-58 202h24l38-64 37 63h25l-39-83").replace(arms,"M-58 48l-30 56 18 14 39-54M42 47l19 76 20-9-15-76").replace('scale(1)','scale(-1 1)')),
 actorFrame("asha-walk-4","Walk · passing R",standing.replace(legs,"M-32 118L-13 170 7 179l17-46-4 72h25l-18-87").replace(arms,"M-58 48l-30 60 20 11 37-55M42 47l23 76 21-8-25-70")),
 actorFrame("asha-jump-1","Jump · crouch",person(0,45).replace('scale(1)','scale(1 .78)')),
 actorFrame("asha-jump-2","Jump · lift",person(0,-12).replace(legs,"M-32 118l-29 48 20 15 40-41 36 38 21-16-29-44").replace(arms,"M-58 48l-35-32 12-17 48 39M42 47l40-49 17 14-41 60")),
 actorFrame("asha-jump-3","Jump · apex",person(0,-18).replace(legs,"M-32 118l-39 37 20 22 46-35 35 29 24-15-27-38")),
 actorFrame("asha-talk-1","Talk · gesture",standing.replace(arms,"M-58 48l-31 65 19 9 37-58M42 47l42 3 9 18-55 12")),
 actorFrame("asha-talk-2","Talk · gesture raised",standing.replace(arms,"M-58 48l-37 15 6 20 51-17M42 47l35-19 16 16-45 29"))
];
const sampleActions:CharacterAction[]=[
 {id:"action-asha-idle",characterId:"asha",name:"Idle",frames:["scene-asha","asha-idle-1","scene-asha","asha-idle-1"],fps:3,loop:true},
 {id:"action-asha-walk",characterId:"asha",name:"Walk in place",frames:["asha-walk-1","asha-walk-2","asha-walk-3","asha-walk-4"],fps:8,loop:true},
 {id:"action-asha-jump",characterId:"asha",name:"Jump",frames:["scene-asha","asha-jump-1","asha-jump-2","asha-jump-3","asha-jump-2","asha-jump-1","scene-asha"],fps:8,loop:false},
 {id:"action-asha-talk",characterId:"asha",name:"Talk gesture",frames:["scene-asha","asha-talk-1","scene-asha","asha-talk-2"],fps:4,loop:true},
 {id:"action-observer-signal",characterId:"observer-character",name:"Signal pulse",frames:["scene-observer","scene-observer-dim"],fps:3,loop:true}
];
function exampleScenes():NonNullable<Project["scenes"]>{return [{id:"composed-discovery",name:"01 · Discovery",storySceneId:"example-scene-1",backgroundId:"scene-city",seconds:4,camera:"None",caption:"Asha: Someone is still here?",objects:[
{id:"scene-actor-asha",name:"Asha",kind:"character",characterId:"asha",assetId:"scene-asha",x:.12,y:.46,w:.39,h:.47,dialogue:"",rotation:0,opacity:1,flip:false,motion:"Slide in"},
{id:"scene-actor-observer",name:"Observer",kind:"character",characterId:"observer-character",assetId:"scene-observer",x:.58,y:.35,w:.32,h:.22,dialogue:"",rotation:0,opacity:1,flip:false,motion:"Float"}
]}]}
function makePanel(id:string,x:number,y:number,w:number,h:number,assetId:string,dialogue:string):Panel{return {id,x,y,w,h,assetId,dialogue}}
export function createExampleProject(id=EXAMPLE_ID):Project {
 const pages:ComicPage[]=[
  {id:"example-page-1",title:"01 · The signal",sceneId:"example-scene-1",seconds:4,panels:[
   makePanel("e-p1-a",.035,.035,.93,.5,"city","The city had been silent for eleven years."),
   makePanel("e-p1-b",.035,.555,.45,.41,"device","Beep. Beep."),
   makePanel("e-p1-c",.515,.555,.45,.41,"traveler-close","Asha: Someone is still here?")]},
  {id:"example-page-2",title:"02 · The answer",sceneId:"example-scene-2",seconds:4,panels:[
   makePanel("e-p2-a",.035,.035,.45,.42,"tower","Follow the beacon."),
   makePanel("e-p2-b",.515,.035,.45,.42,"observer","Observer: Welcome home."),
   makePanel("e-p2-c",.035,.475,.93,.49,"dawn","For the first time, the city answered.")]}
 ];
 return {id,name:"The last signal",format:"Motion comic",width:720,height:1280,fps:30,
 story:"LOGLINE\nIn an abandoned city, Asha discovers a signal that leads to a forgotten service drone. Together they restart the city beacon.\n\nWORLD\nA quiet post-collapse city at the edge of dawn. Technology is weathered but never magical.\n\nARC\n1. Discovery — a signal breaks eleven years of silence.\n2. Contact — the beacon leads Asha to the Observer.\n3. Resolution — the city wakes up.\n\nVISUAL RULES\nMuted teal, slate, warm amber; graphic-novel silhouettes. Asha keeps the same teal coat, amber scarf and dark visor. Observer has a hexagonal shell and turquoise light.\n\nTRY IT\nChange a scene or dialogue, resize a panel, then preview the linked page in Editor.",
 characters:[{id:"asha",name:"Asha",description:"A resourceful traveler. Teal coat, amber scarf, dark visor; cautious but hopeful."},{id:"observer-character",name:"Observer",description:"A small forgotten service drone. Hexagonal shell, turquoise light; protective and curious."}],
 assets:[...scenes.map(a=>({...a})),...sceneAssets,...extraPoses,...actionFrames],characterActions:sampleActions.map(a=>({...a,frames:[...a.frames]})),scenes:exampleScenes(),
 production:{style:"Graphic novel • restrained teal/slate/amber palette • cinematic framing • consistent silhouettes",characterSheets:{asha:"asha-ref","observer-character":"observer-ref"},chapters:[{id:"example-chapter",title:"Chapter 1 · A voice in the silence",scenes:[{id:"example-scene-1",title:"Discovery",summary:"Asha crosses the empty city and detects an unexpected transmission.",characterIds:["asha"]},{id:"example-scene-2",title:"Contact",summary:"Asha follows the beacon, meets the Observer and watches the city wake.",characterIds:["asha","observer-character"]}]}],pages},
 sequence:{fps:30,duration:240,tracks:[{id:"video",name:"Video",kind:"video"},{id:"overlay",name:"Overlay",kind:"overlay"},{id:"text",name:"Text",kind:"text"},{id:"audio",name:"Audio",kind:"audio"}],clips:[
 {id:"example-clip-1",trackId:"video",name:"01 · The signal",start:0,end:120,pageId:pages[0].id,keyframes:[]},
 {id:"example-clip-2",trackId:"video",name:"02 · The answer",start:120,end:240,pageId:pages[1].id,keyframes:[]},
 {id:"example-title",trackId:"text",name:"Opening title",start:0,end:60,text:"THE LAST SIGNAL",keyframes:[{frame:0,value:0},{frame:12,value:1},{frame:45,value:1},{frame:59,value:0}]}
 ]}};
}
// Add a separate example to old local workspaces. Never replace an edited project.
export function ensureExample(projects:Project[]):Project[]{const existing=projects.find(p=>p.id===EXAMPLE_ID);if(!existing)return [createExampleProject(),...projects];const missing=[...sceneAssets,...extraPoses,...actionFrames].filter(a=>!existing.assets.some(x=>x.id===a.id));const actions=existing.characterActions??[];const missingActions=sampleActions.filter(a=>!actions.some(x=>x.id===a.id));if(existing.scenes!==undefined&&!missing.length&&!missingActions.length)return projects;return projects.map(p=>p.id!==EXAMPLE_ID?p:{...p,scenes:p.scenes??exampleScenes(),assets:[...p.assets,...missing],characterActions:[...actions,...missingActions.map(a=>({...a,frames:[...a.frames]}))]})}
