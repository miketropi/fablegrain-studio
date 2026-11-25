import {test} from "node:test";
import assert from "node:assert/strict";
import {EXAMPLE_ID,createExampleProject,ensureExample} from "./example.ts";
import {continuity} from "../production/model.ts";
test("example has complete artwork and valid references",()=>{const p=createExampleProject();assert.equal(p.id,EXAMPLE_ID);assert.equal(p.production!.pages.length,2);assert.equal(p.characters.length,2);assert.deepEqual(continuity(p.production!,p.characters.map(c=>c.id),p.assets.map(a=>a.id)),[]);assert.ok(p.assets.every(a=>a.src?.startsWith("data:image/svg+xml")));for(const c of p.sequence.clips){assert.ok(c.start>=0&&c.end<=p.sequence.duration&&c.start<c.end);if(c.trackId==="video")assert.ok(p.production!.pages.some(x=>x.id===c.pageId));assert.notEqual(c.trackId,"audio")}});
test("example seeding preserves all existing edits and is idempotent",()=>{const old=createExampleProject("demo");old.story="Edited legacy story";const seeded=ensureExample([old]);assert.equal(seeded.length,2);assert.equal(seeded[1],old);assert.equal(seeded[1].story,"Edited legacy story");seeded[0].story="Edited sample";assert.equal(ensureExample(seeded),seeded);assert.equal(seeded[0].story,"Edited sample")});
