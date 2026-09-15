import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/#/Home');
  await page.getByRole('button', { name: '開啟網站客服' }).click();
  async function ask(text) { await page.getByLabel('客服問題').fill(text); await page.getByRole('button', { name: '送出問題' }).click(); }
  await ask('如何風格測驗');
  await page.getByText('各風格以星數加總排名', { exact: false }).waitFor();
  await ask('然後呢');
  await page.getByText('先進入風格測驗逐張評分', { exact: false }).waitFor();
  await page.getByRole('dialog').getByRole('link', { name: '風格測驗', exact: true }).first().click();
  assert.ok(page.url().endsWith('/StyleTest'));
  await page.getByRole('button', { name: '開啟網站客服' }).click();
  await ask('找真人客服');
  await page.getByText('目前尚未接通真人客服', { exact: false }).waitFor();
  await ask('zznonexistent');
  await page.getByText('目前資訊不足', { exact: false }).waitFor();
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const box = await page.getByRole('dialog').boundingBox();
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height);
    await page.screenshot({ path: `../analysis_output/support-agent-${viewport.width}.png` });
  }
  await page.getByRole('button', { name: '清除對話' }).click();
  await ask('這一頁怎麼使用');
  await page.getByText('各風格以星數加總排名', { exact: false }).waitFor();
  await page.getByLabel('客服問題').press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.deepEqual(errors, []);
  console.log('Chrome support: guidance, follow-up, navigation, page context and responsive bounds passed.');
} finally { await browser.close(); }
