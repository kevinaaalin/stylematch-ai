import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config = readFileSync(new URL('../src/pages.config.js', import.meta.url), 'utf8');
const routes = [...config.slice(config.lastIndexOf('export const PAGES = {')).split('}')[0].matchAll(/"([^"]+)":/g)].map(match => match[1]);
const html = readFileSync(new URL('../../github_isafe2_website_work/index.html', import.meta.url), 'utf8');
const views = [...new Set([...html.matchAll(/data-view="([^"]+)"/g)].map(match => match[1]))];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const url of [...routes.map(route => `http://127.0.0.1:4173/#/${route}`), ...views.map(view => `http://127.0.0.1:4174/?view=${view}&case=IS-2026-0002`)]) {
    await page.goto(url, { waitUntil: 'networkidle' });
    if (/\/#\/(Cases|IsafeProjects)$/.test(url)) await page.waitForURL('http://127.0.0.1:4174/**');
    assert.ok((await page.locator('body').innerText()).trim().length > 30, `Blank page: ${url}`);
    assert.deepEqual(errors, [], url);
    if (/\/#\/(Cases|IsafeProjects)$/.test(url)) {
      assert.ok(page.url().startsWith('http://127.0.0.1:4174/'));
      await page.locator('#directIntakePanel').waitFor({ state: 'visible' });
    }
    console.log(`PASS page load: ${url}`);
  }
  console.log(`PASS: ${routes.length} StyleMatch routes + ${views.length} iSAFE views. Read-only smoke, not all form submissions or external services.`);
} finally { await browser.close(); }
