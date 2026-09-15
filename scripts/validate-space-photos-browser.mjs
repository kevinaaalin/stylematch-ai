import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/#/Requirements");
  // Isolated mounted real component, never the user's browser profile.
  await page.evaluate(async () => {
    const React = (await import("/node_modules/.vite/deps/react.js")).default;
    const { createRoot } = (await import("/node_modules/.vite/deps/react-dom_client.js")).default;
    const Photo = (await import("/src/components/requirements/PhotoUploadForm.jsx")).default;
    const host = document.createElement("div"); host.id = "upload-qa"; document.body.prepend(host);
    function Harness() { const [data, setData] = React.useState({ space_photos: {} }); return React.createElement(Photo, { formData: data, onChange: (updates) => setData((old) => ({ ...old, ...updates })) }); }
    createRoot(host).render(React.createElement(Harness));
  });
  const form = page.locator("#upload-qa");
  await form.getByRole("button", { name: /客廳/ }).click();
  const bytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9V0AAAAASUVORK5CYII=", "base64");
  const files = Array.from({ length: 4 }, (_, i) => ({ name: `photo${i}.png`, mimeType: "image/png", buffer: bytes }));
  await form.getByLabel("客廳照片上傳").setInputFiles(files);
  await form.getByRole("button", { name: "已達 4 張上限" }).waitFor();
  assert.equal(await form.getByRole("button", { name: "已達 4 張上限" }).isDisabled(), true);
  await form.getByLabel("客廳照片上傳").setInputFiles(files[0]);
  await form.getByText(/每個空間最多上傳 4 張照片/).waitFor();
  assert.equal(await form.getByRole("img", { name: /客廳照片/ }).count(), 4);
  await form.getByRole("button", { name: /餐廳/ }).click();
  await form.getByLabel("餐廳照片上傳").setInputFiles(files);
  await form.getByText("已上傳 8 張照片", { exact: true }).waitFor();
  await form.getByRole("button", { name: "移除餐廳照片 1" }).click();
  assert.equal(await form.getByRole("button", { name: "選擇照片", exact: true }).isEnabled(), true);

  await page.addInitScript(() => {
    localStorage.setItem("stylematch_active_plan_v1", "pro");
    localStorage.setItem("stylematch_local_mvp_v1", JSON.stringify({ storage_schema_version: 4, projects: [{ project_id: "photo-qa", name: "Photo QA", proposal_media: { space_photos: { living_room: ["/home-showcase/living-room-before.jpg", "/home-showcase/living-room-after.jpg"], study_room: ["/home-showcase/living-room-before.jpg"] } } }], styleTests: [], jobs: [], notifications: [], auditLogs: [], isafeCases: [], point_ledger: [], point_balance: 100 }));
  });
  const submissions = [];
  await page.route("http://127.0.0.1:4180/api/v1/ai/**", async (route) => {
    const url = new URL(route.request().url()); let body = {};
    if (url.pathname.endsWith("/health")) body = { local_image: { status: "online" } };
    else if (route.request().method() === "POST" && url.pathname.endsWith("/image-tasks")) {
      const submitted = route.request().postDataJSON(); submissions.push(submitted);
      body = { task: { ai_task_id: `qa-photo-${submissions.length}`, stylematch_project_id: "photo-qa", status: "completed", image_url: "http://127.0.0.1:4173/home-showcase/living-room-after.jpg", updated_at: "20260915", requested_output_type: "perspective_draft", operation: submitted.operation } };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto("http://127.0.0.1:4173/#/AIGenerate?project=photo-qa");
  await page.reload();
  for (let i = 1; i <= 2; i++) {
    await page.getByRole("button", { name: `選用客廳原圖 ${i}`, exact: true }).click();
    await page.getByRole("button", { name: /產生空間創意彩現/ }).click();
    await page.waitForFunction((count) => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")).point_ledger.length === count, i);
    assert.equal(submissions[i - 1].source_media_urls.length, 1);
    assert.equal(submissions[i - 1].provider, "comfyui");
    assert.equal(submissions[i - 1].operation.source_photo_number, i);
    assert.equal(submissions[i - 1].operation.source_image_url, submissions[i - 1].source_media_urls[0]);
  }
  assert.notEqual(submissions[0].source_media_urls[0], submissions[1].source_media_urls[0]);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")));
  assert.equal(saved.projects[0].reference_revisions.length, 2);
  assert.equal(saved.point_balance, 80);
  assert.ok(saved.projects[0].reference_revisions.every((r) => r.status === "candidate" && r.source_photo_room === "living_room"));
  console.log("PASS: Chrome actual upload limit, independent rooms, delete/retry, two distinct source requests and saved result pairs. Provider mocked; not GPU quality acceptance.");
} finally { await browser.close(); }
