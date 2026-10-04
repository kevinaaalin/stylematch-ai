import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildSampleProject } from '../src/lib/proposalBuilder.js';
import { completeProposalImages, completionRooms } from '../src/lib/proposalImageCompletion.js';
import { runDesignProposalWorkflow } from '../src/lib/designProposalWorkflow.js';

const output = new URL('../analysis_output/full-sample-20261004/', import.meta.url);
await mkdir(output, { recursive: true });
const stateFile = new URL('project.json', output);
let project;
try { project = JSON.parse(await readFile(stateFile, 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  project = { ...buildSampleProject(), id: 'qa-full-sample-20261004', project_id: 'qa-full-sample-20261004', project_name: '42坪透天住宅完整提案重跑（示範草稿）', primary_style: 'humanistic', reference_revisions: [] };
  Object.assign(project.proposal_media.space_photos, { master_bedroom: [], bedroom1: [], bedroom2: [], bedroom3: [], bathroom1: [], bathroom2: [], bathroom3: [] });
  project.qa_assumptions = ['沿用原範例42坪、4房2廳3衛、200至500萬元。', '人文風為範例分析推定，非使用者正式確認。', '客餐廳來源是範例庫存照片，非本案現場照片。', '其餘7空間無照片；格局、尺寸及各房使用者均未核實。', '每空間4張是設計候選方案，不是同一空間四方向重建或360環景。', '測試圖片組僅供草稿匯出，未經業主採用或正式資產核准。'];
  await writeFile(stateFile, JSON.stringify(project, null, 2));
}
const origin = 'http://127.0.0.1:4282';
const child = spawn(process.execPath, ['server.mjs'], { cwd: new URL('.', import.meta.url), env: { ...process.env, ISAFE_API_PORT: '4282', ISAFE_DB_PATH: join(fileURLToPath(output), 'qa.db') }, stdio: 'ignore' });
const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer local-dev-headquarter', 'X-Tenant-Id': 'tenant_local_tigi', 'X-Organization-Id': 'org_local_headquarter', 'X-User-Id': 'qa', 'X-Case-Role': 'designer', 'X-Server-Role': 'headquarter', 'X-Case-Authorization': '*', 'X-Purpose': 'proposal_completion_qa', 'X-Consent-Ref': 'local-qa', 'X-Trace-Id': project.project_id };
try {
  const rejectionIds = (process.argv.find(arg => arg.startsWith('--reject=')) || '').slice('--reject='.length).split(',').filter(Boolean);
  if (rejectionIds.length) {
    await writeFile(new URL(`pre-review-${Date.now()}.json`, output), JSON.stringify(project, null, 2));
    for (const id of rejectionIds) {
      const revision = project.reference_revisions.find(r => r.revision_id === id);
      assert.ok(revision, `Unknown revision ${id}`);
      revision.status = 'rejected'; revision.qa_reason = 'Visual QA: illustration or object collage rather than continuous photorealistic room';
    }
    project.qa_revised = true;
    await writeFile(stateFile, JSON.stringify(project, null, 2));
  }
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`${origin}/api/v1/health`)).ok) break; } catch { /* Isolated API startup. */ }
    await new Promise(r => setTimeout(r, 250));
  }
  const generate = async request => {
    const sources = request.sourceMediaUrls.length ? [`data:image/jpeg;base64,${(await readFile(new URL(`source-${request.operation.completion_room}.jpg`, output))).toString('base64')}`] : [];
    const response = await fetch(`${origin}/api/v1/ai/image-tasks`, { method: 'POST', headers: { ...headers, 'Idempotency-Key': request.idempotencyKey }, body: JSON.stringify({ prompt: request.prompt, negative_prompt: request.negativePrompt, seed: request.seed, provider: 'comfyui', width: 1024, height: 768, output_type: 'perspective_draft', operation: request.operation, source_media_urls: sources, source_media_count: sources.length, stylematch_project_id: project.project_id, style_id: project.primary_style }) });
    let data = await response.json();
    assert.ok(response.ok, JSON.stringify(data));
    let task = data.task;
    for (let i = 0; i < 600 && ['queued', 'running'].includes(task.status); i++) {
      await new Promise(r => setTimeout(r, 1000));
      data = await (await fetch(`${origin}/api/v1/ai/image-tasks/${task.ai_task_id}`, { headers })).json();
      task = data.task;
    }
    assert.equal(task.status, 'completed', JSON.stringify(task));
    const responseImage = await fetch(`${origin}/api/v1/ai/image-tasks/${task.ai_task_id}/image`, { headers });
    assert.ok(responseImage.ok);
    const bytes = Buffer.from(await responseImage.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'), task.output_sha256);
    const filename = `${request.operation.completion_room}-${request.operation.completion_slot + 1}${project.qa_revised ? `-${task.ai_task_id}` : ''}.png`;
    await writeFile(new URL(filename, output), bytes);
    await writeFile(new URL(`${filename}.task.json`, output), JSON.stringify(task, null, 2));
    return { url: `http://127.0.0.1:4173/analysis_output/full-sample-20261004/${filename}`, source_url: task.image_url, task, generation_source: 'local_api_comfyui', authoritative: true };
  };
  const save = async data => {
    project.reference_revisions.push({ ...data, project_id: project.project_id, revision_id: `qa-r${project.reference_revisions.length + 1}`, version: 1, status: 'candidate' });
    await writeFile(stateFile, JSON.stringify(project, null, 2));
    console.log(`SAVED ${project.reference_revisions.length}/36 ${data.completion_room}`);
  };
  await completeProposalImages({ getProject: () => project, generate, save, onProgress: console.log });
  const candidates = completionRooms(project).flatMap(room => room.revisions);
  assert.equal(candidates.length, 36);
  assert.equal(new Set(candidates.map(r => r.output_sha256)).size, 36);
  assert.ok(completionRooms(project).every(room => room.missing === 0));
  assert.equal((await completeProposalImages({ getProject: () => project, generate: () => { throw new Error('Unexpected regeneration'); }, save })).saved, 0);
  // QA selection for a draft only; never writes asset approval or governance records.
  const set = { confirmed_reference_set_id: 'qa-draft-selection', project_id: project.project_id, revision_ids: candidates.map(r => r.revision_id), images: candidates, qa_only: true };
  project.confirmed_reference_sets = [set];
  project.active_confirmed_reference_set_id = set.confirmed_reference_set_id;
  const revision = process.argv.find(arg => arg.startsWith('--version='))?.slice('--version='.length) || (project.qa_revised ? 'R3' : 'R2');
  const result = runDesignProposalWorkflow(project, { versionId: `SM-SAMPLE-0001-QA-20261004-${revision}`, at: new Date().toISOString() });
  assert.equal(result.status, 'draft', JSON.stringify(result.missing_inputs));
  const document = result.version.project_snapshot.proposal_document;
  document.proposal.references = [1, 2].map(i => `http://127.0.0.1:4173/analysis_output/full-sample-20261004/reference-${i}.jpg`);
  document.delivery.pending.unshift(...project.qa_assumptions);
  document.proposal.disclaimer += ' 本次為完整範例重跑，36張皆為候選概念圖，非已核准設計。';
  await writeFile(stateFile, JSON.stringify(project, null, 2));
  await writeFile(new URL('frozen-proposal.json', output), JSON.stringify(document, null, 2));
  await writeFile(new URL('generation-qa.json', output), JSON.stringify({ status: 'generation_and_draft_assembly_passed', rooms: completionRooms(project).map(({ room, missing, revisions }) => ({ room, missing, count: revisions.length })), unique_hashes: 36, retry_generated: 0, browser_export: 'pending', visual_review: 'pending', formal_approval: false }, null, 2));
  console.log(`PASS 36 unique images, 9 rooms; frozen draft: ${output.href}`);
} finally {
  child.kill();
  await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
}
