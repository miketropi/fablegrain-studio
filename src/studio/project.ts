import {createSequence,type Sequence} from "../editor/timeline";
import {createExampleProject} from "./example";
export type Format = "Comic" | "Webtoon" | "Motion comic" | "Video";
import type { StoryProduction } from "../production/model";
export type Project = { id: string; name: string; format: Format; width: number; height: number; fps: number; sequence: Sequence; story: string; characters: {id:string;name:string;description:string}[]; assets:{id:string;name:string;kind:string;src?:string;generation?:{tool:string;createdAt:string;requestId:string}}[]; production?:StoryProduction };
export function newProject(name:string,format:Format,width:number,height:number,fps:number):Project {
  return {id:crypto.randomUUID(),name:name.trim() || "Untitled story",format,width,height,fps,sequence:{...createSequence(fps),clips:[]},story:"",characters:[],assets:[]};
}
export function demoProject():Project{return createExampleProject()}
