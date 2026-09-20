import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.PROPOSAL_QA_OUTPUT || path.join(os.tmpdir(), "stylematch-proposal-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const image = "/home-showcase/living-room-before.jpg"; // Isolated QA media, not a real client's plan.
    const project = { id: "delivery-qa", project_id: "delivery-qa", case_code: "QA-DELIVERY", house_type: "住宅", square_footage: 30, room_layout: "3房2廳", budget_range: "200-500萬", material_grade: "標準", special_requirements: "保留所有長文內容。".repeat(150) + "需求最後一行",
      proposal_media: { reference_photos: Array(6).fill(image), space_photos: { living_room: Array(5).fill(image), floor_plan: Array(5).fill(image) } },
      proposal_generation: { confirmed_reference_set_id: "confirmed-qa", generated_at: "2026-09-15T00:00:00Z" },
      reference_revisions: [{ revision_id: "r1", image_url: image }],
      confirmed_reference_sets: [{ confirmed_reference_set_id: "confirmed-qa", project_id: "delivery-qa", revision_ids: ["r1"], images: [{ revision_id: "r1", image_url: image, space: "採用客廳", version: 1 }] }],
    };
    project.payment = { status: 'paid_test' };
    project.proposal_versions = [{ version_id: "v1", version: 1, created_at: "2026-09-14", project_snapshot: { ...structuredClone(project), special_requirements: "歷史版本需求" } }];
    localStorage.setItem("stylematch_active_plan_v1", "pro");
    localStorage.setItem("stylematch_local_mvp_v1", JSON.stringify({ storage_schema_version: 4, projects: [project], styleTests: [], isafeCases: [], notifications: [], auditLogs: [], jobs: [], point_balance: 100, point_ledger: [] }));
  });
  await page.goto("http://127.0.0.1:4173/#/ProjectDetail?project=delivery-qa");
  await page.getByRole('heading', { name: '提案歷史版本' }).waitFor();
  await page.getByRole('link', { name: '查看此版本' }).click();
  assert.ok(page.url().includes('version=v1'));
  await page.getByText('歷史版本需求', { exact: true }).waitFor();
  await page.getByLabel('提案版本').selectOption('');
  await page.getByRole("heading", { name: "預算依據與交付核對" }).waitFor();
  assert.equal(await page.locator(".proposal-page img").count(), 18); // cover + 6 + 5 + 5 + adopted
  await page.getByLabel("提案版本").selectOption("v1");
  await page.getByText("歷史版本需求", { exact: true }).waitFor();
  assert.ok(page.url().includes('version=v1'));
  await page.reload();
  await page.getByText("歷史版本需求", { exact: true }).waitFor();
  assert.equal(await page.getByLabel('提案版本').inputValue(), 'v1');
  await page.getByLabel("提案版本").selectOption("");
  await page.getByText(/需求最後一行/).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) console.log(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(element => element.getBoundingClientRect().right > innerWidth).slice(0, 12).map(element => ({ tag: element.tagName, className: element.className, text: element.textContent.slice(0, 80), right: element.getBoundingClientRect().right }))));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: path.join(output, "proposal-mobile.png") });
  const downloadPromise = page.waitForEvent("download", { timeout: 120000 });
  await page.getByRole("button", { name: "下載完整 PDF" }).click();
  const download = await downloadPromise;
  assert.equal(await download.failure(), null);
  await download.saveAs(path.join(output, "website-proposal.pdf"));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("stylematch_local_mvp_v1")));
  assert.equal(stored.point_balance, 100);
  assert.equal(stored.point_ledger.length, 0);
  assert.equal(stored.projects[0].proposal_versions[0].project_snapshot.special_requirements, "歷史版本需求");
  // An unreadable image must fail visibly, release busy state and permit retry.
  await page.locator(".proposal-page img").first().evaluate((img) => { img.src = "data:image/png;base64,invalid"; });
  await page.getByRole("button", { name: "下載完整 PDF" }).click();
  await page.getByText(/PDF 未完成/).waitFor();
  assert.equal(await page.getByRole("button", { name: "下載完整 PDF" }).isEnabled(), true);
  assert.equal(await page.locator('div[style*="-10000px"]').count(), 0);
  assert.deepEqual(errors, []);
  console.log(`PASS: Chrome/mobile full PDF, all 18 images, long text, snapshots, no billing, image-error recovery. QA output: ${output}`);
} finally { await browser.close(); }
