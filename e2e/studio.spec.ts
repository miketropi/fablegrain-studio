import {test,expect,type Page} from "@playwright/test";
import {readFileSync} from "node:fs";
const {version}=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8")) as {version:string};
async function chooseComic(page:Page){const label=page.getByLabel("Format",{exact:true});const form=page.locator("form").filter({has:page.getByLabel("Project name")});const field=(await label.count())?label.first():form.getByRole("combobox").first();if(await field.evaluate(el=>el.tagName==="SELECT")){await field.selectOption("Comic")}else{await field.click();await page.getByRole("option",{name:"Comic",exact:true}).click()}}
test("deployed or local project creation, navigation and persistence",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 const response=await page.goto("/");expect(response?.ok()).toBeTruthy();
 await expect(page.getByRole("heading",{name:"New project"})).toBeVisible();
 await page.getByLabel("Project name").fill("Browser QA — temporary");
 await chooseComic(page);
 await page.getByRole("button",{name:"Create project"}).click();
 await expect(page.getByRole("main")).toContainText("Browser QA — temporary");
 await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Story",exact:true}).click();
 await page.getByRole("textbox",{name:"Story bible"}).fill("QA story");
 await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Characters",exact:true}).click();
 await page.getByLabel("Name",{exact:true}).fill("Test character");
 await page.getByLabel("Description",{exact:true}).fill("Test only");
 await page.getByRole("button",{name:"Add character"}).click();
 await expect(page.getByText("Test character",{exact:true}).first()).toBeVisible();
 await page.getByRole("button",{name:"Back to projects"}).click();
 await page.reload();
 await page.getByRole("button",{name:/Browser QA — temporary/}).click();
 await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Story",exact:true}).click();
 await expect(page.getByRole("textbox",{name:"Story bible"})).toHaveValue("QA story");
 expect(errors).toEqual([]);
});
test("local UI: compact workspace panels and timeline resize",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"New UI assertions require the newly built version");
 await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();
 await expect(page.getByRole("region",{name:"Timeline editor"})).toBeVisible();
 const libraryHandle=page.getByRole("separator",{name:"Resize library"});const initial=await page.locator(".library").boundingBox();await libraryHandle.focus();await page.keyboard.press("ArrowRight");await expect.poll(async()=> (await page.locator(".library").boundingBox())!.width).toBeGreaterThan(initial!.width);
 await page.getByRole("button",{name:"Toggle library"}).click();
 await expect(page.locator(".workspace")).toHaveAttribute("data-library","false");
 await page.getByRole("button",{name:"Toggle library"}).click();
 await expect(page.locator(".workspace")).toHaveAttribute("data-library","true");
 const resize=page.getByRole("separator",{name:"Resize timeline"});const before=await page.locator(".timeline").boundingBox();
 await resize.focus();await page.keyboard.press("ArrowUp");const after=await page.locator(".timeline").boundingBox();expect(after!.height).toBeGreaterThan(before!.height);
 await page.setViewportSize({width:390,height:844});
 await page.getByRole("button",{name:"Toggle inspector"}).click();await expect(page.locator(".inspector")).toBeVisible();
 await page.getByRole("button",{name:"Toggle inspector"}).click();await expect(page.locator(".inspector")).toBeHidden();
 await page.getByRole("button",{name:"Toggle library"}).click();await expect(page.locator(".library")).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});
test("local UI: project begins with story and hides video FPS for comic",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"New UI assertions require the newly built version");
 await page.goto("/");await chooseComic(page);await expect(page.getByLabel("Frame rate")).toHaveCount(0);
 await page.getByLabel("Project name").fill("Fresh comic");await page.getByRole("button",{name:"Create project"}).click();
 await expect(page.getByRole("textbox",{name:"Story bible"})).toBeVisible();await expect(page.getByRole("region",{name:"Timeline editor"})).toHaveCount(0);
});

test("local UI uses SDK controls and production tabs",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires new UI");
 await page.goto("/");
 await expect(page.locator('[data-slot="select-trigger"]').first()).toBeVisible();
 await expect(page.locator('select')).toHaveCount(0);
 await chooseComic(page);await page.getByLabel("Project name").fill("SDK comic");
 await page.getByRole("button",{name:"Create project"}).click();
 await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Production",exact:true}).click();
 await page.getByRole("tab",{name:"Comic pages"}).click();
 await expect(page.getByRole("tabpanel")).toBeVisible();
 await page.getByRole("button",{name:"+ Page",exact:true}).click();
 await expect(page.locator(".comic-panel")).toHaveCount(3);
 await expect(page.locator('[data-slot="number-input-control"]').first()).toBeVisible();
 await expect(page.locator('[data-slot="file-input-trigger"]')).toBeVisible();
 const bounds=await page.locator(".comic-sheet").boundingBox();expect(bounds).not.toBeNull();expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
 await page.screenshot({path:"test-results/studio-comic.png"});
});

test("local UI: SDK tree, track menu and export dialog",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires new UI");
 await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();
 const tree=page.getByRole("tree",{name:"Project library tree"});await expect(tree).toBeVisible();
 const branch=tree.getByRole("treeitem",{name:/Characters/}).first();await branch.focus();await page.keyboard.press("ArrowLeft");await expect(branch).toHaveAttribute("aria-expanded","false");await page.keyboard.press("ArrowRight");await expect(branch).toHaveAttribute("aria-expanded","true");
 await page.getByRole("button",{name:"Track",exact:true}).click();await page.getByRole("menuitem",{name:"Text track",exact:true}).click();
 await expect(page.locator(".track-label").filter({hasText:/text 2/i})).toBeVisible();
 const trigger=page.getByRole("button",{name:"Export project JSON"});await trigger.click();await expect(page.getByRole("dialog",{name:"Export project"})).toBeVisible();await page.keyboard.press("Escape");await expect(page.getByRole("dialog",{name:"Export project"})).toBeHidden();await expect(trigger).toBeFocused();
 await trigger.click();const download=page.waitForEvent("download");await page.getByRole("button",{name:"Download JSON"}).click();expect((await download).suggestedFilename()).toMatch(/\.fablegrain\.json$/);
 await page.screenshot({path:"test-results/studio-editor.png"});
});
test("deployed build identity",async({page,request})=>{
 // Verify both the local build and deployment match the source under test.
 const response=await request.get("/api/version");expect(response.ok(),"Deployment must expose its version; redeploy the latest source first").toBeTruthy();
 const identity=await response.json();console.log("Application version:",identity.version);expect(identity.version,"Build must match the checked-out source version").toBe(version);
 await page.goto("/");await expect(page.locator("main[data-app-version]")).toHaveAttribute("data-app-version",identity.version);
});

test("local comic canvas: SDK resize, keyboard move and cancel",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires new builder");
 await page.goto("/");await chooseComic(page);await page.getByLabel("Project name").fill("Canvas QA");await page.getByRole("button",{name:"Create project"}).click();
 await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Production",exact:true}).click();await page.getByRole("tab",{name:"Comic pages"}).click();await page.getByRole("button",{name:"+ Page",exact:true}).click();
 const panel=page.getByRole("button",{name:"Select panel 2",exact:true});await panel.click();
 await expect(panel).toHaveAttribute("aria-pressed","true");await expect(page.locator(".comic-handle")).toHaveCount(8);
 const shape=page.locator(".comic-panel").nth(1);const first=(await shape.boundingBox())!;
 const handle=page.getByRole("button",{name:"Resize panel 2 e",exact:true});await handle.focus();await page.keyboard.press("Shift+ArrowRight");
 await expect.poll(async()=> (await shape.boundingBox())!.width).toBeGreaterThan(first.width);
 const before=(await shape.boundingBox())!;await panel.focus();await page.keyboard.press("Shift+ArrowRight");
 await expect.poll(async()=> (await shape.boundingBox())!.x).toBeGreaterThan(before.x);
 const current=(await shape.boundingBox())!;await page.mouse.move(current.x+current.width/2,current.y+current.height/2);await page.mouse.down();await page.mouse.move(current.x+current.width/2+25,current.y+current.height/2-15,{steps:6});await page.keyboard.press("Escape");await page.mouse.up();
 await expect.poll(async()=>Math.abs((await shape.boundingBox())!.x-current.x)).toBeLessThan(1);
 await page.screenshot({path:"test-results/studio-canvas-handles.png"});
 await page.getByRole("button",{name:"Back to projects"}).click();await page.reload();await page.getByRole("button",{name:/Canvas QA/}).click();await page.getByRole("navigation",{name:"Workspace"}).getByRole("button",{name:"Production",exact:true}).click();await page.getByRole("tab",{name:"Comic pages"}).click();
 await expect.poll(async()=>Math.abs((await page.locator(".comic-panel").nth(1).boundingBox())!.width-current.width)).toBeLessThan(2);
});

test("example is populated, navigable and exports real PNG",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires the new example project");
 await page.goto("/");await expect(page.getByText(/2 pages · 2 characters/)).toBeVisible();
 await page.getByRole("button",{name:/The last signal/}).click();
 const canvas=page.locator(".stage canvas");
 await expect(canvas).toBeVisible();
 await expect.poll(async()=>canvas.evaluate(el=>{const c=el as HTMLCanvasElement;return Array.from(c.getContext("2d")!.getImageData(0,0,1,1).data).join(",")})).toBe("242,238,231,255");
 await page.getByRole("button",{name:"How to use Fablegrain"}).click();await expect(page.getByRole("dialog",{name:"Explore the workflow"})).toBeVisible();
 await page.getByRole("button",{name:"Open Comic pages",exact:true}).click();await expect(page.getByRole("tab",{name:"Comic pages"})).toHaveAttribute("aria-selected","true");
 await expect(page.locator(".comic-panel img")).toHaveCount(3);
 const download=page.waitForEvent("download");await page.getByRole("button",{name:"PNG",exact:true}).click();const png=await download;expect(png.suggestedFilename()).toMatch(/\.png$/);
 await page.getByRole("tab",{name:"Review",exact:true}).click();await expect(page.getByText("No missing references detected.")).toBeVisible();
 await page.getByRole("tab",{name:"Character sheets",exact:true}).click();await expect(page.getByAltText("Asha reference sheet")).toBeVisible();
 await page.screenshot({path:"test-results/example-character-sheets.png"});
});
test("existing browser projects are preserved when example is added",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires new example seed");
 await page.goto("/");await page.getByLabel("Project name").fill("Existing project");await page.getByRole("button",{name:"Create project"}).click();await page.getByRole("textbox",{name:"Story bible"}).fill("Keep my story");
 await page.evaluate(()=>{const k="fablegrain.projects.v1";const records=JSON.parse(localStorage.getItem(k)!);localStorage.setItem(k,JSON.stringify(records.filter((p:{id:string})=>p.id!=="example-last-signal")))});
 await page.reload();await expect(page.getByRole("button",{name:/The last signal/})).toBeVisible();
 await page.getByRole("button",{name:/Existing project/}).click();await expect(page.getByRole("textbox",{name:"Story bible"})).toHaveValue("Keep my story");
});
