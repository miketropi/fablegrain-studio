import {test,expect} from "@playwright/test";
test("connected workflow: storyboard, asset library, compose and linked outputs",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires connected workflow");await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();
 const nav=page.getByRole("navigation",{name:"Workspace"});
 await nav.getByRole("button",{name:"Storyboard",exact:true}).click();await page.getByRole("button",{name:"Compose Contact",exact:true}).click();await expect(page.getByRole("heading",{name:"Scene Composer"})).toBeVisible();await expect(page.locator(".scene-object")).toHaveCount(2);
 await nav.getByRole("button",{name:"Assets",exact:true}).click();await page.getByRole("button",{name:"Use City · Background in scene",exact:true}).click();await expect(page.locator(".scene-object")).toHaveCount(2);await expect(page.locator(".scene-story-context")).toContainText("Contact");
 await page.getByRole("button",{name:"Add scene to timeline"}).click();await expect(page.getByRole("region",{name:"Timeline editor"})).toBeVisible();await page.getByRole("button",{name:"Open scene source"}).click();await page.getByRole("button",{name:"Open in video",exact:true}).click();await page.getByRole("button",{name:"Open scene source"}).click();
 await page.getByRole("button",{name:"Still to comic"}).click();await expect(page.locator(".comic-panel")).toHaveCount(1);await page.getByRole("button",{name:"Open scene source"}).click();await expect(page.locator(".scene-story-context")).toContainText("Contact");
 const project=await page.evaluate(()=>JSON.parse(localStorage.getItem("fablegrain.projects.v1")!).find((p:{id:string})=>p.id==="example-last-signal"));const scene=project.scenes.find((s:{storySceneId:string})=>s.storySceneId==="example-scene-2");expect(project.sequence.clips.filter((c:{sceneId?:string})=>c.sceneId===scene.id)).toHaveLength(1);expect(project.production.pages.at(-1).sourceCompositionId).toBe(scene.id);
 await page.screenshot({path:"test-results/connected-workflow.png"});
});
