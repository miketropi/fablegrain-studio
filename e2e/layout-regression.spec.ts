import {test,expect,type Page} from "@playwright/test";
async function navigationHitTargets(page:Page){
 const nav=page.getByRole("navigation",{name:"Workspace"});
 const buttons=nav.getByRole("button");const count=await buttons.count();expect(count).toBe(8);
 for(let i=0;i<count;i++){const button=buttons.nth(i);await button.scrollIntoViewIfNeeded();await expect(button).toBeVisible();const hit=await button.evaluate(el=>{const r=el.getBoundingClientRect();const target=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.width>=32&&r.height>=26&&!!target&&el.contains(target)});expect(hit,"Navigation button "+i+" has an unobstructed hit target").toBeTruthy()}
}
test("workflow navigation never overlaps and composition controls stay visible",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires updated layout");
 for(const viewport of [{width:1440,height:900},{width:1280,height:720},{width:390,height:844}]){
 await page.setViewportSize(viewport);await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();await navigationHitTargets(page);
 const nav=page.getByRole("navigation",{name:"Workspace"});await nav.getByRole("button",{name:"Assets",exact:true}).click();await expect(page.getByRole("heading",{name:"Prepare / Asset library"})).toBeVisible();await nav.getByRole("button",{name:"Scenes",exact:true}).click();
 await expect(page.locator(".scene-object")).toHaveCount(2);
 const canvas=page.locator(".scene-composer .comic-sheet");await expect(canvas).toBeVisible();
 if(viewport.width>=1050){await expect(page.getByRole("button",{name:"Play scene"})).toBeInViewport({ratio:.95});await expect(page.getByRole("button",{name:"Add scene to timeline"})).toBeInViewport({ratio:.95});await expect(canvas).toBeInViewport({ratio:.95});await expect.poll(async()=>Math.round((await canvas.boundingBox())!.height),{message:"Portrait artboard must be large enough to edit"}).toBeGreaterThanOrEqual(viewport.height>=900?320:220);}
 else{await expect.poll(async()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width+1);await canvas.scrollIntoViewIfNeeded();await expect(canvas).toBeInViewport({ratio:.9});}
 await page.screenshot({path:"test-results/layout-"+viewport.width+".png"});
 }
});
