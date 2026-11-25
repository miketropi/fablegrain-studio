import {version} from "../../../package.json";
export const dynamic="force-dynamic";
export function GET(){return Response.json({version},{headers:{"Cache-Control":"no-store"}})}
