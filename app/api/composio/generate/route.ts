import {timingSafeEqual} from "node:crypto";
import {Composio,SessionPreset} from "@composio/core";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {extractMedia} from "../../../../src/ai/prompt";
export const runtime="nodejs";
export const maxDuration=120;
// Developer preview only: one in-flight call and process-local duplicate protection.
// Do not auto-retry a provider call whose result is unknown.
const seen=new Set<string>();let running=false;
function authorized(request:Request,token:string){const expected=Buffer.from("Bearer "+token),actual=Buffer.from(request.headers.get("authorization")??"");return actual.length===expected.length&&timingSafeEqual(actual,expected)}
export async function POST(request:Request){
 const key=process.env.COMPOSIO_API_KEY,token=process.env.FABLEGRAIN_ADMIN_TOKEN,user=process.env.COMPOSIO_USER_ID,toolkit=process.env.COMPOSIO_MEDIA_TOOLKIT,tool=process.env.COMPOSIO_MEDIA_TOOL,field=process.env.COMPOSIO_MEDIA_PROMPT_FIELD;
 const allowed=(process.env.COMPOSIO_TOOLKITS??"").split(",").map(s=>s.trim()).filter(Boolean);
 if(!key||!token||token.length<32||!user||!toolkit||!allowed.includes(toolkit)||!tool||!field||!/^\w+$/.test(field)||["constructor","prototype","__proto__"].includes(field)||!/^\w+$/.test(tool))return Response.json({error:"Media provider is not configured"}, {status:503});
 if(!authorized(request,token))return Response.json({error:"Unauthorized"},{status:401});
 let body:{prompt?:unknown;requestId?:unknown;confirmed?:unknown};let args:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>20000)throw Error();body=JSON.parse(raw);const defaults=JSON.parse(process.env.COMPOSIO_MEDIA_DEFAULT_ARGS??"{}");if(typeof defaults!=="object"||!defaults||Array.isArray(defaults))throw Error();args=defaults}catch{return Response.json({error:"Invalid request or provider defaults"},{status:400})}
 if(body?.confirmed!==true||typeof body.prompt!=="string"||!body.prompt.trim()||body.prompt.length>12000||typeof body.requestId!=="string"||!/^[0-9a-f-]{36}$/i.test(body.requestId))return Response.json({error:"Prompt and explicit approval required"},{status:400});
 if(seen.has(body.requestId)||running||seen.size>=200)return Response.json({error:"Duplicate request or generator busy; check previous request before retrying"},{status:409});
 seen.add(body.requestId);running=true;
 let client:Client|undefined;let invoked=false;
 try{
  const composio=new Composio({apiKey:key});
  const session=await composio.sessions.create(user,{mcp:true,toolkits:[toolkit],tools:{[toolkit]:{enable:[tool]}},sessionPreset:SessionPreset.DIRECT_TOOLS,instant:false,manageConnections:{enable:false},sandbox:{enable:false}});
  // Verify the policy returned by the service before sending the prompt.
  const config=session.config as unknown as {toolkits?:{enabled?:string[]};tools?:Record<string,{enabled?:string[]}>;instant?:unknown};
  if(config.instant!==false||config.toolkits?.enabled?.length!==1||config.toolkits.enabled[0]!==toolkit||config.tools?.[toolkit]?.enabled?.length!==1||config.tools[toolkit].enabled?.[0]!==tool)return Response.json({error:"Provider did not confirm the restricted session policy"},{status:502});
  const url=new URL(session.mcp.url);if(url.protocol!=="https:"||!session.mcp.headers||session.mcp.type!=="http")return Response.json({error:"Secure MCP endpoint unavailable"},{status:502});
  const transport=new StreamableHTTPClientTransport(url,{requestInit:{headers:session.mcp.headers,redirect:"error"}});
  client=new Client({name:"fablegrain-studio",version:"0.4.0"});
  await client.connect(transport);
  const listing=await client.listTools();if(!listing.tools.some(t=>t.name===tool))return Response.json({error:"Configured media tool is not exposed by the MCP session"},{status:502});
  invoked=true;
  const result=await client.callTool({name:tool,arguments:{...args,[field]:body.prompt}},undefined,{timeout:90000});
  if(result.isError)return Response.json({error:"Provider reported an error; inspect provider job history before retrying"},{status:502});
  const hosts=(process.env.COMPOSIO_MEDIA_OUTPUT_HOSTS??"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
  const media=extractMedia(result,process.env.COMPOSIO_MEDIA_OUTPUT_PATH??"",process.env.COMPOSIO_MEDIA_JOB_PATH??"",hosts);
  return Response.json({requestId:body.requestId,tool,status:media.imageUrl||media.imageData?"media-ready":"submitted",...media});
 }catch{return Response.json({error:invoked?"MCP call ended without a verified result. Check provider history before retrying.":"Could not open the restricted MCP session"},{status:502})}
 finally{if(client)await client.close().catch(()=>{});running=false}
}
