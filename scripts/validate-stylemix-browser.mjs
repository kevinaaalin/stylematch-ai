import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173/#/StyleMix');
    await page.getByRole('heading', { name: 'StyleMix 風格混搭' }).waitFor();
    assert.equal(await page.locator('select').count(), 4);
    await page.getByRole('button', { name: '產生候選圖' }).click();
    await page.getByRole('alert').filter({ hasText: '商業方案' }).waitFor();
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `analysis_output/stylemix-${width}.png`, fullPage: true });
    await page.close();
  }
  console.log('PASS Chrome desktop/mobile route and free-plan guard; generation not tested');
} finally { await browser.close(); }
