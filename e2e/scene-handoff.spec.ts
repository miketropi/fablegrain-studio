import {test,expect} from "@playwright/test";
test("scene publishing selects its clip and opens the correct comic page",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires new handoff");await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();
 await page.getByRole("button",{name:"New scene",exact:true}).click();await page.getByRole("button",{name:"Add City · Background to scene",exact:true}).click();await page.getByRole("button",{name:"Add Asha · Standing to scene",exact:true}).click();
 await expect(page.locator(".scene-object")).toHaveCount(1);
 await page.getByRole("button",{name:"Add scene to timeline"}).click();await expect(page.getByRole("region",{name:"Timeline editor"})).toBeVisible();await expect(page.getByRole("button",{name:"Open scene source"})).toBeVisible();await expect(page.getByText("00:08:00",{exact:true}).first()).toBeVisible();
 await page.getByRole("button",{name:"Open scene source"}).click();await expect(page.locator(".scene-object")).toHaveCount(1);
 await page.getByRole("button",{name:"Still to comic"}).click();await expect(page.locator(".comic-panel")).toHaveCount(1);
 const records=await page.evaluate(()=>JSON.parse(localStorage.getItem("fablegrain.projects.v1")!));const project=records.find((p:{id:string})=>p.id==="example-last-signal");expect(project.production.pages.at(-1).panels.length).toBe(1);expect(project.sequence.clips.at(-1).sceneId).toBe(project.scenes.at(-1).id);
 await page.screenshot({path:"test-results/scene-handoff-comic.png"});
});