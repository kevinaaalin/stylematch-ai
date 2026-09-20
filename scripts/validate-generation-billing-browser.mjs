import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("stylematch_active_plan_v1", "pro");
    localStorage.setItem("stylematch_local_mvp_v1", JSON.stringify({ storage_schema_version: 4, projects: [{ project_id: "billing-qa", name: "Billing QA", reference_revisions: [{ revision_id: "source", image_url: "http://127.0.0.1:4173/home-showcase/living-room-before.jpg", space: "客廳", status: "candidate" }] }], styleTests: [], jobs: [], notifications: [], auditLogs: [], isafeCases: [], point_ledger: [], point_balance: 100 }));
  });
  let count = 0;
  let submitted;
  await page.route("http://127.0.0.1:4180/api/v1/ai/**", async (route) => {
    const url = new URL(route.request().url());
    let body = {};
    if (url.pathname.endsWith("/health")) body = { local_image: { status: "online" } };
    else if (route.request().method() === "POST" && url.pathname.endsWith("/image-tasks")) {
      count++;
      submitted = route.request().postDataJSON();
      body = { task: { ai_task_id: `qa-${count}`, stylematch_project_id: "billing-qa", status: count === 1 ? "queued" : "completed", image_url: "http://127.0.0.1:4173/home-showcase/living-room-after.jpg", updated_at: "20260914", requested_output_type: "perspective_draft", operation: submitted.operation } };
    } else if (url.pathname.endsWith("/qa-1")) body = { task: { ai_task_id: "qa-1", stylematch_project_id: "billing-qa", status: "failed", error: "QA failure" } };
    await route.fulfill({ status: route.request().method() === "POST" ? 202 : 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto("http://127.0.0.1:4173/#/AIGenerate?project=billing-qa&revision=source");
  const generate = page.getByRole("button", { name: /產生空間創意彩現/ });
  await generate.click();
  await page.waitForFunction(() => JSON.parse(sessionStorage.getItem("stylematch_ai_current_task_v1"))?.status === "failed");
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")).point_balance), 100);
  await generate.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")).point_ledger.length === 1);
  assert.equal(submitted.source_media_urls[0], "http://127.0.0.1:4173/home-showcase/living-room-before.jpg");
  const database = await page.evaluate(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")));
  assert.equal(database.projects[0].reference_revisions[0].parent_asset_id, "source");
  assert.equal(database.point_balance, 100 + database.point_ledger[0].points);
  console.log("Mock-provider browser QA: failed task free; completed result saved/debited with source lineage.");
} finally { await browser.close(); }
