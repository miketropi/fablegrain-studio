import {test,expect} from "@playwright/test";
test("character actions apply, save and survive reopening the scene",async({page})=>{
 test.skip(!!process.env.E2E_BASE_URL,"Requires character actions");await page.goto("/");await page.getByRole("button",{name:/The last signal/}).click();
 await page.getByRole("button",{name:"Select object 1",exact:true}).click();await expect(page.getByRole("button",{name:"Apply action Walk in place",exact:true})).toBeVisible();await expect(page.getByRole("button",{name:"Apply action Signal pulse"})).toHaveCount(0);
 await page.getByRole("button",{name:"Apply action Walk in place",exact:true}).click();await expect(page.getByRole("img",{name:"Animated scene preview"})).toBeVisible();
 const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem("fablegrain.projects.v1")!).find((p:{id:string})=>p.id==="example-last-signal"));
 await expect.poll(async()=> (await data()).scenes[0].objects[0].poseCycle.length).toBe(4);
 await page.getByRole("button",{name:"Play scene"}).click();await expect(page.getByRole("button",{name:"Pause scene"})).toBeVisible();await page.getByRole("button",{name:"Edit scene"}).click();
 await page.getByLabel("Save action name").fill("My walk");await page.getByRole("button",{name:"Save character action",exact:true}).click();await expect(page.getByRole("button",{name:"Apply action My walk",exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Apply action Jump",exact:true}).click();await expect.poll(async()=> (await data()).scenes[0].objects[0].poseLoop).toBe(false);
 await page.getByRole("button",{name:"Edit scene"}).click();await page.screenshot({path:"test-results/character-actions.png"});
 await page.reload();await page.getByRole("button",{name:/The last signal/}).click();await page.getByRole("button",{name:"Select object 1",exact:true}).click();await expect(page.getByRole("button",{name:"Apply action My walk",exact:true})).toBeVisible();await expect(page.getByRole("button",{name:"Apply action Jump",exact:true})).toHaveAttribute("aria-pressed","true");
});