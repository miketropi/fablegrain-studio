import { defineConfig } from "@playwright/test";
const live=process.env.E2E_BASE_URL;
export default defineConfig({testDir:"./e2e",timeout:45000,retries:0,workers:1,reporter:"list",use:{baseURL:live??"http://127.0.0.1:3100",browserName:"chromium",viewport:{width:1440,height:900},screenshot:"only-on-failure",trace:"retain-on-failure"},webServer:live?undefined:{command:"npm run start -- --hostname 127.0.0.1 --port 3100",url:"http://127.0.0.1:3100",timeout:60000,reuseExistingServer:false}});
