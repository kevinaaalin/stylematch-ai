import assert from 'node:assert/strict';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { runDesignProposalWorkflow } from '../src/lib/designProposalWorkflow.js';
import { proposalExportPages } from '../src/lib/proposalExportContent.js';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const project = {
  id: 'export-qa', project_id: 'export-qa', project_name: '提案匯出驗收', case_code: 'QA-EXPORT',
  square_footage: 30, room_layout: '客廳與主臥室', budget_range: '100-200萬', primary_style: 'modern',
  created_at: '2026-09-26T00:00:00Z',
  reference_revisions: [{ revision_id: 'r1', image_url: '/home-showcase/living-room-panorama-reference.png', space: '客廳', version: 1 }],
  active_confirmed_reference_set_id: 's1',
  confirmed_reference_sets: [{ confirmed_reference_set_id: 's1', revision_ids: ['r1'], images: [{ revision_id: 'r1', space: '客廳', version: 1, image_url: '/home-showcase/living-room-panorama-reference.png' }] }],
};
const result = runDesignProposalWorkflow(project, { versionId: 'export-v1', at: project.created_at });
assert.equal(result.status, 'draft');
project.proposal_versions = [result.version];
const output = 'analysis_output/proposal-office-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  await context.addInitScript(database => localStorage.setItem('stylematch_local_mvp_v1', JSON.stringify(database)), { storage_schema_version: 4, projects: [project] });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
  await page.goto('http://127.0.0.1:4173/#/ProposalReport?project=export-qa&version=export-v1');
  for (const format of ['docx', 'pptx', 'pdf']) {
    const downloadEvent = page.waitForEvent('download', { timeout: 90000 });
    await page.getByRole('button', { name: `版本 ${format.toUpperCase()}`, exact: true }).click();
    const download = await Promise.race([downloadEvent, page.getByRole('alert').waitFor({ timeout: 90000 }).then(async () => { throw new Error(await page.getByRole('alert').innerText()); })]);
    assert.equal(await download.failure(), null);
    const file = `${output}/proposal.${format}`;
    await download.saveAs(file);
    assert.ok((await stat(file)).size > 1000);
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: `${output}/browser.png`, fullPage: false });
  const expectedPages = proposalExportPages(result.version.project_snapshot.proposal_document).length;
  await writeFile(`${output}/manifest.json`, JSON.stringify({ version: 'export-v1', expectedPages, formats: ['docx', 'pptx', 'pdf'] }, null, 2));
  await page.route('**/home-showcase/living-room-panorama-reference.png', route => route.abort());
  let unexpectedDownload = false;
  page.on('download', () => { unexpectedDownload = true; });
  await page.getByRole('button', { name: '版本 DOCX', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: '匯出未完成' }).waitFor();
  assert.equal(unexpectedDownload, false);
  console.log(`PASS Chrome DOCX/PPTX/PDF downloads and missing-image refusal; expected pages/slides: ${expectedPages}`);
} finally { await browser.close(); }
