import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("stylematch_active_plan_v1", "pro");
    localStorage.setItem("stylematch_local_mvp_v1", JSON.stringify({ storage_schema_version: 4, projects: [{ project_id: "direction-qa", name: "Direction QA", proposal_media: { space_photos: { living_room: ["/home-showcase/living-room-before.jpg"] } } }], styleTests: [], jobs: [], notifications: [], auditLogs: [], isafeCases: [], point_ledger: [], point_balance: 100 }));
  });
  const submissions = [];
  await page.route("http://127.0.0.1:4180/api/v1/ai/**", async (route) => {
    const url = new URL(route.request().url()); let body = {};
    if (url.pathname.endsWith("/health")) body = { local_image: { status: "online" } };
    else if (url.pathname.endsWith("/direction-references")) body = { task_id: "direction-1", known_pixels_preserved: true, shared_scene: true, inferred_directions: ["right", "back", "left"], ordered_sources: ["front", "right", "back", "left"].map((id, index) => ({ id, yaw: index * 90, media_url: `http://127.0.0.1:4173/home-showcase/living-room-after.jpg?direction=${id}` })) };
    else if (route.request().method() === "POST" && url.pathname.endsWith("/image-tasks")) {
      const submitted = route.request().postDataJSON(); submissions.push(submitted);
      body = { task: { ai_task_id: `direction-${submissions.length}`, stylematch_project_id: "direction-qa", status: "completed", image_url: "http://127.0.0.1:4173/home-showcase/living-room-after.jpg", requested_output_type: "equirectangular_2_1", operation: submitted.operation } };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto("http://127.0.0.1:4173/#/AIGenerate?project=direction-qa");
  await page.getByRole("tab", { name: "單一空間 360°" }).click();
  await page.getByRole("combobox", { name: /選用專案照片/ }).first().selectOption({ index: 1 });
  await page.getByRole("checkbox", { name: /已確認方向配置/ }).check();
  await page.getByRole("button", { name: /補生成四方向參考圖/ }).click();
  await page.getByRole("button", { name: "檢查並載入四方向參考圖", exact: true }).click();
  const review = page.getByRole("checkbox", { name: /已逐方向檢查/ });
  await review.waitFor();
  assert.equal(submissions[0].source_content.panorama_capture.ordered_sources.length, 1);
  assert.equal(submissions[0].source_content.panorama_capture.input_mode, "partial_direction_completion");
  assert.equal(await page.getByText("AI 推估方向，非現場照片", { exact: true }).count(), 3);
  const submit = page.getByRole("button", { name: /產生.*環景/ });
  assert.equal(await submit.isDisabled(), true);
  await review.check();
  await submit.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")).point_ledger.length === 2);
  assert.equal(submissions[1].source_content.panorama_capture.ordered_sources.length, 4);
  assert.equal(submissions[1].operation.derived_direction_task_id, "direction-1");
  assert.equal(submissions[1].operation.direction_review_confirmed, true);
  console.log("PASS: Chrome partial source → completion → four references → required review → stitching lineage. Provider mocked, not AI quality acceptance.");
} finally { await browser.close(); }
