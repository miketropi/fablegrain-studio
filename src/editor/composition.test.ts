import {test} from "node:test";
import assert from "node:assert/strict";
import {createSequence} from "./timeline.ts";
import {appendPages,visualClips} from "./composition.ts";
import {makePage} from "../production/model.ts";
test("append pages without overwriting existing clips",()=>{let n=0;const base=createSequence(30);const seq=appendPages(base,[makePage("a","Page 1"),makePage("b","Page 2")],()=>String(++n));assert.equal(seq.clips.length,8);assert.equal(seq.clips[6].start,360);assert.equal(seq.clips[7].end,540);assert.equal(seq.duration,540);assert.equal(seq.clips[6].pageId,"a")});
test("visual clips use half-open ranges and exclude audio",()=>{const seq=createSequence(30);assert.deepEqual(visualClips(seq,120).map(c=>c.id),["scene","character","title"]);assert.equal(visualClips(seq,360).length,0)});
