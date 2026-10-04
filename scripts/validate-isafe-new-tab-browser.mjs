import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('stylematch_local_mvp_v1', JSON.stringify({ storage_schema_version: 4,
      projects: [{ id: 'tab-qa', project_id: 'tab-qa', case_code: 'QA', isafe_case_id: 'IS-TAB-QA' }],
      styleTests: [], isafeCases: [], notifications: [], auditLogs: [], jobs: [] }));
  });
  await page.goto('http://127.0.0.1:4173/#/ProjectDetail?project=tab-qa');
  const link = page.getByRole('link', { name: '進入 iSAFE（另開分頁）', exact: true });
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.match(await link.getAttribute('rel'), /noopener/);
  const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);
  await popup.waitForLoadState('domcontentloaded');
  assert.equal(new URL(popup.url()).searchParams.get('case'), 'IS-TAB-QA');
  assert.ok(page.url().includes('ProjectDetail?project=tab-qa'));
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  console.log('PASS: Chrome opens case-specific iSAFE tab, preserves original page and isolates opener.');
} finally { await browser.close(); }
