"use client";
import type { ReactNode } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectItemIndicator } from "@ui-sdk/react/select";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { FileInput, FileInputTrigger } from "@ui-sdk/react/file-input";
import { Progress, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator } from "@ui-sdk/react/progress";
import { Check, ChevronDown, Upload } from "lucide-react";

// Compositions of the real SDK parts; no native-control fallback.
export function Choice({value,onValueChange,disabled,children}:{value:string|number;onValueChange:(value:string)=>void;disabled?:boolean;children:ReactNode}){
  return <Select value={value===""?"__none":String(value)} disabled={disabled} onValueChange={next=>{if(typeof next==="string")onValueChange(next==="__none"?"":next)}}>
    <SelectTrigger className="studio-select-trigger"><SelectValue/><ChevronDown size={14} aria-hidden="true"/></SelectTrigger>
    <SelectContent>{children}</SelectContent>
  </Select>;
}
export function ChoiceItem({value,children}:{value:string;children:ReactNode}){
  return <SelectItem value={value}>{children}<SelectItemIndicator><Check size={14} aria-hidden="true"/></SelectItemIndicator></SelectItem>;
}
export function CheckControl({checked,onCheckedChange}:{checked:boolean;onCheckedChange:(checked:boolean)=>void}){
  return <Checkbox checked={checked} onCheckedChange={next=>onCheckedChange(next===true)}><CheckboxIndicator><Check size={13} aria-hidden="true"/></CheckboxIndicator></Checkbox>;
}
export function ImagePicker({onFile,onReject,disabled}:{onFile:(file:File)=>void;onReject:()=>void;disabled?:boolean}){
  return <FileInput accept={["image/png","image/jpeg","image/webp"]} maxSize={750000} value={[]} disabled={disabled} onValueChange={files=>{if(files[0])onFile(files[0])}} onReject={onReject}><FileInputTrigger><Upload size={14} aria-hidden="true"/> Import image</FileInputTrigger></FileInput>;
}
export function ExportProgress({value}:{value:number}){
  return <Progress value={Math.round(value*100)} className="export-progress"><ProgressLabel>Exporting</ProgressLabel><ProgressValue/><ProgressTrack><ProgressIndicator/></ProgressTrack></Progress>;
}
