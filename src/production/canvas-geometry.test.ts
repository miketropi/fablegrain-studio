import {test} from "node:test";
import assert from "node:assert/strict";
import {makePage} from "./model.ts";
import {pageBoxes,applyBoxes} from "./canvas-geometry.ts";
test("pixel boxes round trip without changing project",()=>{const page=makePage("a","page");assert.equal(applyBoxes(page,pageBoxes(page.panels,333,592),333,592),page)});
test("geometry commits are bounded and preserve media and metadata",()=>{const page=makePage("a","page");page.panels[0].assetId="asset";page.panels[0].dialogue="Hi";const boxes=pageBoxes(page.panels,100,200);boxes["a-1"]={x:95,y:-50,width:45,height:5};const next=applyBoxes(page,boxes,100,200);assert.equal(next.panels[0].assetId,"asset");assert.equal(next.panels[0].dialogue,"Hi");assert.equal(next.panels[0].h,.05);assert.equal(next.panels[0].x,.55);assert.equal(next.panels[0].y,0);assert.equal(next.panels[1],page.panels[1]);assert.equal(page.panels[0].x,.04)});
test("invalid dimensions or nonfinite box do not corrupt page",()=>{const p=makePage("a","p");assert.equal(applyBoxes(p,{},0,1),p);assert.equal(applyBoxes(p,{"a-1":{x:NaN,y:0,width:1,height:1}},100,100),p)});

import {groupBounds,positionsToBoxes} from "./canvas-geometry.ts";
test("group bounds preserve relative geometry and locked boxes",()=>{const boxes={a:{x:10,y:20,width:20,height:20},b:{x:60,y:50,width:30,height:30}};assert.deepEqual(groupBounds(boxes,["a","b"],"a",100,100),{minX:0,minY:0,maxX:20,maxY:40});assert.deepEqual(groupBounds(boxes,["a","b"],"b",100,100),{minX:50,minY:30,maxX:70,maxY:70});const moved=positionsToBoxes(boxes,{a:{x:20,y:30},b:{x:70,y:60}},["b"]);assert.equal(moved.a.x,20);assert.equal(moved.b,boxes.b)});
