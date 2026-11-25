import {timingSafeEqual} from "node:crypto";
export const runtime="nodejs";
const base="https://backend.composio.dev/api/v3.1/tool_router/session";
function authorized(request:Request,token:string){const expected=Buffer.from("Bearer "+token),actual=Buffer.from(request.headers.get("authorization")??"");return actual.length===expected.length&&timingSafeEqual(actual,expected)}
export async function POST(request:Request){
  const key=process.env.COMPOSIO_API_KEY,token=process.env.FABLEGRAIN_ADMIN_TOKEN,user=process.env.COMPOSIO_USER_ID;
  const enabled=(process.env.COMPOSIO_TOOLKITS??"").split(",").map(x=>x.trim()).filter(x=>/^[a-z0-9_-]+$/i.test(x));
  if(!key||!token||token.length<32||!user||!enabled.length)return Response.json({error:"Composio is not configured on the server"},{status:503});
  if(!authorized(request,token))return Response.json({error:"Unauthorized"},{status:401});
  const headers={"x-api-key":key,"Content-Type":"application/json"};
  try{
    const create=await fetch(base,{method:"POST",headers,body:JSON.stringify({user_id:user,toolkits:{enable:enabled},instant:false,manage_connections:{enable:false}}),signal:AbortSignal.timeout(20000),cache:"no-store"});
    if(!create.ok)return Response.json({error:"Composio session creation failed ("+create.status+")"},{status:502});
    const data=await create.json(),id=data.session_id;
    const actual=data.config?.toolkits?.enabled;
    if(!Array.isArray(actual)||actual.length!==enabled.length||enabled.some(t=>!actual.includes(t))||data.config?.instant!==false)return Response.json({error:"Composio did not confirm the required restricted session policy"},{status:502});
    if(typeof id!=="string"||!/^trs_[a-zA-Z0-9_-]+$/.test(id))return Response.json({error:"Invalid session response"},{status:502});
    const list=await fetch(base+"/"+encodeURIComponent(id)+"/tools?limit=100",{headers,signal:AbortSignal.timeout(20000),cache:"no-store"});
    if(!list.ok)return Response.json({error:"Tool discovery failed ("+list.status+")"},{status:502});
    const payload=await list.json();
    // Return names only; never forward MCP credentials, session URLs or raw upstream headers.
    const tools=Array.isArray(payload.items)?payload.items:Array.isArray(payload.tools)?payload.tools:[];
    return Response.json({connected:true,toolkits:enabled,toolNames:tools.map((t:unknown)=>{if(typeof t!=="object"||t===null)return null;const v=t as Record<string,unknown>;return typeof v.slug==="string"?v.slug:typeof v.name==="string"?v.name:null}).filter(Boolean),hasMore:Boolean(payload.next_cursor)});
  }catch{return Response.json({error:"Composio unavailable"},{status:502})}
}
