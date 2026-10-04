import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const projectId = `stylemix-qa-${Date.now()}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(id => {
    localStorage.setItem('stylematch_active_plan_v1', 'business');
    localStorage.setItem('stylematch_local_mvp_v1', JSON.stringify({ storage_schema_version: 4, point_balance: 100, projects: [{ id, project_id: id, project_name: 'StyleMix live QA', case_code: id, square_footage: 20, room_layout: '客廳', primary_style: 'modern', budget_range: '100-200萬' }] }));
  }, projectId);
  const page = await context.newPage();
  page.on('response', async response => {
    if (response.url().includes('/ai/image-tasks')) {
      const payload = await response.json().catch(() => ({}));
      if (payload.task?.status === 'completed') console.log(JSON.stringify({ task: payload.task.ai_task_id, image_url: payload.task.image_url, status: payload.task.status }));
    }
  });
  await page.goto('http://127.0.0.1:4173/#/StyleMix');
  await page.getByLabel('專案', { exact: true }).selectOption(projectId);
  if (process.env.STYLEMIX_IMAGE_QA === '1') {
    await page.getByLabel('使用圖片 A／B').check();
    await page.getByLabel('A 圖片', { exact: true }).setInputFiles('public/home-showcase/living-room-before.jpg');
    await page.getByText('已核對並確認候選描述').first().waitFor({ timeout: 120000 });
    await page.getByLabel('B 圖片', { exact: true }).setInputFiles('public/home-showcase/living-room-after.jpg');
    await page.getByText('已核對並確認候選描述').nth(1).waitFor({ timeout: 120000 });
    await page.getByRole('button', { name: '產生候選圖', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'confirmation' }).waitFor();
    for (const checkbox of await page.getByLabel('已核對並確認候選描述').all()) await checkbox.check();
  }
  await page.getByRole('button', { name: '產生候選圖', exact: true }).click();
  await Promise.race([
    page.getByText('已保存 v1 · 尚未人工核准', { exact: true }).waitFor({ timeout: 240000 }),
    page.getByRole('alert').waitFor({ timeout: 240000 }).then(async () => { throw new Error(await page.getByRole('alert').innerText()); }),
  ]);
  const db = await page.evaluate(() => JSON.parse(localStorage.getItem('stylematch_local_mvp_v1')));
  const revision = db.projects.find(project => project.project_id === projectId).reference_revisions[0];
  assert.ok(revision.source_task_id);
  assert.equal(revision.task_status, 'completed');
  assert.equal(revision.stylemix.target, 'interior');
  assert.equal(db.point_balance, 95);
  assert.equal(db.point_ledger.length, 1);
  assert.equal(await page.getByAltText('StyleMix 生成候選').evaluate(image => image.complete && image.naturalWidth > 0), true);
  await mkdir('analysis_output/stylemix-live-qa', { recursive: true });
  await page.screenshot({ path: 'analysis_output/stylemix-live-qa/result.png', fullPage: true });
  await writeFile('analysis_output/stylemix-live-qa/result.json', JSON.stringify({ projectId, revision, balance: db.point_balance }, null, 2));
  await page.getByRole('link', { name: '提案圖確認', exact: true }).click();
  await page.getByRole('button', { name: '登錄／讀取目前版本的核准紀錄', exact: true }).click();
  await page.getByRole('button', { name: '人工核准資產版本', exact: true }).click();
  await page.getByText(/已人工核准，可供提案引用/).waitFor();
  await page.getByRole('button', { name: '選為採用圖片', exact: true }).click();
  await page.getByRole('button', { name: '確定採用圖片', exact: true }).click();
  await page.getByRole('button', { name: '商業方案：扣點生成正式圖像提案', exact: true }).click();
  await page.getByText(/提案草稿已生成/).waitFor();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('stylematch_local_mvp_v1')));
  assert.equal(saved.point_balance, 65);
  const version = saved.projects[0].proposal_versions[0];
  assert.equal(version.project_snapshot.proposal_asset_snapshot[0].status, 'approved');
  await page.getByRole('link', { name: '查看正式提案', exact: true }).click();
  await page.getByLabel('提案版本').selectOption(version.version_id);
  for (const format of ['docx', 'pptx', 'pdf']) {
    const downloaded = page.waitForEvent('download', { timeout: 60000 });
    await page.getByRole('button', { name: `版本 ${format.toUpperCase()}`, exact: true }).click();
    await (await downloaded).saveAs(`analysis_output/stylemix-live-qa/proposal.${format}`);
  }
  await writeFile('analysis_output/stylemix-live-qa/acceptance.json', JSON.stringify({ projectId, versionId: version.version_id, balance: saved.point_balance, assetId: version.project_snapshot.proposal_asset_snapshot[0].asset_id, formats: ['docx', 'pptx', 'pdf'] }, null, 2));
  console.log('PASS live StyleMix generation, image load, provenance, revision save and one debit');
  console.log('PASS candidate registration, human approval action, proposal snapshot and three-format export');
} finally { await browser.close(); }
