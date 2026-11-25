import {test} from "node:test";
import assert from "node:assert/strict";
import {createSequence,editClip,splitClip,addKeyframe,timecode,frameAt} from "./timeline.ts";
test("frame math",()=>{assert.equal(frameAt(42,2),21);assert.equal(timecode(126,30),"00:04:06")});
test("move respects adjacent clips",()=>{const s=createSequence(30);assert.equal(editClip(s,"scene","move",20),s);assert.equal(editClip(s,"character","move",-100).clips.find(c=>c.id==="character")?.start,0)});
test("trim keeps a minimum of one frame",()=>{const s=editClip(createSequence(30),"opening","trim-end",-999);assert.equal(s.clips[0].end,1)});
test("snap to playhead",()=>{const s=editClip(createSequence(30),"character","move",13,3,45);assert.equal(s.clips.find(c=>c.id==="character")?.start,45)});
test("split and remap keyframes",()=>{let s=createSequence(30);s=addKeyframe(s,"opening",90);s=splitClip(s,"opening",60,"new");assert.equal(s.clips.find(c=>c.id==="new")?.keyframes[0].frame,30);assert.equal(s.clips.find(c=>c.id==="opening")?.end,60)});
test("reject invalid keyframe",()=>{const s=createSequence(30);assert.equal(addKeyframe(s,"opening",120),s)});
test("trimming start remaps retained keyframes",()=>{let s=addKeyframe(createSequence(30),"opening",40);s=editClip(s,"opening","trim-start",10);assert.equal(s.clips[0].keyframes[0].frame,30)});

import {moveToTrack,addTrack,interpolate} from "./timeline.ts";
test("transfer to compatible empty track",()=>{const seq=addTrack(createSequence(30),{id:"v2",name:"Video 2",kind:"video"});const result=moveToTrack(seq,"opening","v2",60);assert.equal(result.clips[0].trackId,"v2");assert.equal(result.clips[0].start,60);assert.equal(result.clips[0].end,180);assert.equal(moveToTrack(seq,"opening","audio"),seq)});
test("transfer rejects collisions and fractional frames",()=>{const seq=createSequence(30);assert.equal(moveToTrack(seq,"opening","video",1),seq);assert.equal(moveToTrack(seq,"opening","video",.5),seq)});
test("interpolation clamps outside keyframes",()=>{const k=[{frame:0,value:0},{frame:20,value:1}];assert.equal(interpolate(k,10),.5);assert.equal(interpolate(k,40),1);assert.equal(interpolate([],10),1)});
