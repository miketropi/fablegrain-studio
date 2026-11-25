import {test} from "node:test";
import assert from "node:assert/strict";
import {extractMedia,readPath,safeImageUrl} from "./prompt.ts";
test("safe media path rejects inherited properties",()=>{assert.equal(readPath({data:{images:[{url:"ok"}]}},"data.images.0.url"),"ok");assert.equal(readPath({},"constructor"),undefined);assert.equal(readPath({},"toString"),undefined)});
test("only configured HTTPS hosts are accepted",()=>{assert.equal(safeImageUrl("https://cdn.example.com/image.png",["cdn.example.com"]),"https://cdn.example.com/image.png");assert.equal(safeImageUrl("http://cdn.example.com/image.png",["cdn.example.com"]),undefined);assert.equal(safeImageUrl("https://cdn.example.com.evil.test/x",["cdn.example.com"]),undefined)});
test("extracts explicit provider output path only",()=>{const x=extractMedia({content:[{type:"text",text:'{"data":{"url":"https://cdn.example.com/a.png","job":"abc"}}'}]},"data.url","data.job",["cdn.example.com"]);assert.equal(x.imageUrl,"https://cdn.example.com/a.png");assert.equal(x.jobId,"abc");assert.equal(extractMedia({structuredContent:{url:"https://bad.test/img"}},"url","",["cdn.example.com"]).imageUrl,undefined)});
