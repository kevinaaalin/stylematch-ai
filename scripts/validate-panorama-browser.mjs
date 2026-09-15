import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = new URL("../../analysis_output/panorama-browser-20260914/", import.meta.url);
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://127.0.0.1:4173/#/Home");
  const canvas = page.locator(".pnlm-render-container canvas").first();
  await canvas.waitFor();
  await canvas.scrollIntoViewIfNeeded();
  await page.getByText("正在載入空間", { exact: true }).waitFor({ state: "hidden" });
  for (const [name, width, height] of [["desktop", 1280, 900], ["mobile", 390, 844]]) {
    await page.setViewportSize({ width, height });
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const before = await canvas.screenshot({ path: fileURLToPath(new URL(`${name}-before.png`, output)) });
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    const after = await canvas.screenshot({ path: fileURLToPath(new URL(`${name}-after.png`, output)) });
    assert.notDeepEqual(before, after, "Dragging must change the rendered view");
    assert.ok(before.length > 10000, "Rendered scene must not be a blank canvas");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByTitle("放大", { exact: true }).click();
    await page.waitForTimeout(350);
    const zoomed = await canvas.screenshot();
    await page.getByTitle("縮小", { exact: true }).click();
    await page.waitForTimeout(350);
    assert.notDeepEqual(zoomed, await canvas.screenshot(), "Zoom controls must change the view");
    await page.getByTitle("重設視角", { exact: true }).click();
    await page.waitForTimeout(450);
    await page.getByTitle("全螢幕", { exact: true }).click();
    await page.waitForFunction(() => Boolean(document.fullscreenElement));
    await page.evaluate(() => document.exitFullscreen());
  }
  console.log("Panorama desktop/mobile render and drag passed; screenshots saved.");
} finally { await browser.close(); }
