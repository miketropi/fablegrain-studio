"use client";
import {useState} from "react";
import {Button} from "@ui-sdk/react/button";
export default function ComposioPanel(){
 const [token,setToken]=useState(""),[result,setResult]=useState<unknown>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function connect(){setBusy(true);setError("");setResult(null);try{const response=await fetch("/api/composio/session",{method:"POST",headers:{Authorization:"Bearer "+token}});const data=await response.json();if(!response.ok)throw Error(data.error||"Session request failed");setResult(data)}catch(e){setError(e instanceof Error?e.message:"Request failed")}finally{setBusy(false)}}
 return <section className="section-editor"><h1>AI Director / Composio</h1><p className="muted">Local single-owner integration preview. Create a restricted session and discover available tools. No media generation or paid tool execution is enabled here.</p><label>Studio access token<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)}/></label><Button disabled={busy||!token} onClick={()=>void connect()}>{busy?"Connecting…":"Create scoped session"}</Button>{error&&<p role="alert">{error}</p>}{result!==null&&<pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(result,null,2)}</pre>}</section>
}
