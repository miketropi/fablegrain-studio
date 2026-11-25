import {test} from "node:test";
import assert from "node:assert/strict";
import {makePage,movePanel,boundPanel,reorder,continuity,emptyProduction} from "./model.ts";
test("panel cannot leave page",()=>{const p=makePage("x","Page");const result=movePanel(p,"x-1",100,-100);assert.ok(Math.abs(result.panels[0].x-.08)<1e-9);assert.equal(result.panels[0].y,0)});
test("panel minimum dimensions",()=>{const p=boundPanel({id:"x",x:1,y:1,w:-5,h:NaN,dialogue:""});assert.equal(p.w,.05);assert.equal(p.h,.3);assert.equal(p.x,.95);assert.equal(p.y,.7)});
test("reorder remains bounded",()=>{const a=[{id:"a"},{id:"b"}];assert.equal(reorder(a,"a",-1),a);assert.equal(reorder(a,"b",-1)[0].id,"b")});
test("empty and dangling references",()=>{const p=emptyProduction();p.pages=[{...makePage("x","Page"),sceneId:"unknown"}];assert.equal(continuity(p,[],[]).length,4)});
