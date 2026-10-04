import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { completeProposalImages } from '../src/lib/proposalImageCompletion.js';
const dir = await mkdtemp(join(tmpdir(), 'proposal-fill-'));
const child = spawn(process.execPath, ['server.mjs'], { cwd: new URL('.', import.meta.url), env: { ...process.env, ISAFE_API_PORT: '4282', ISAFE_DB_PATH: join(dir, 'qa.db') }, stdio: 'ignore' });
const origin = 'http://127.0.0.1:4282';
const output = new URL('../analysis_output/proposal-completion-live/', import.meta.url);
const project = { project_id: `fill-${Date.now()}`, primary_style: 'modern', proposal_media: { space_photos: { living_room: [] } }, reference_revisions: [] };
try {
  await mkdir(output, { recursive: true });
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`${origin}/api/v1/health`)).ok) break; } catch { /* Wait for isolated API. */ }
    await new Promise(r => setTimeout(r, 250));
  }
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer local-dev-headquarter', 'X-Tenant-Id': 'tenant_local_tigi', 'X-Organization-Id': 'org_local_headquarter', 'X-User-Id': 'qa', 'X-Case-Role': 'designer', 'X-Server-Role': 'headquarter', 'X-Case-Authorization': '*', 'X-Purpose': 'proposal_completion_qa', 'X-Consent-Ref': 'local-qa', 'X-Trace-Id': project.project_id };
  const generate = async request => {
    const res = await fetch(`${origin}/api/v1/ai/image-tasks`, { method: 'POST', headers: { ...headers, 'Idempotency-Key': request.idempotencyKey }, body: JSON.stringify({ prompt: request.prompt, negative_prompt: request.negativePrompt, seed: request.seed, provider: 'comfyui', width: 1024, height: 768, output_type: 'perspective_draft', operation: request.operation }) });
    let data = await res.json();
    assert.equal(res.status, 202, JSON.stringify(data));
    let task = data.task;
    for (let n = 0; n < 180 && ['queued','running'].includes(task.status); n++) {
      await new Promise(r => setTimeout(r, 1000));
      data = await (await fetch(`${origin}/api/v1/ai/image-tasks/${task.ai_task_id}`, { headers })).json(); task = data.task;
    }
    assert.equal(task.status, 'completed');
    const image = await fetch(`${origin}/api/v1/ai/image-tasks/${task.ai_task_id}/image`, { headers });
    assert.ok(image.ok);
    const filename = `${project.project_id}-${request.operation.completion_slot}.png`;
    await writeFile(new URL(filename, output), Buffer.from(await image.arrayBuffer()));
    return { url: filename, source_url: task.image_url, task, generation_source: 'local_api_comfyui', authoritative: true };
  };
  const save = async data => { project.reference_revisions.push({ ...data, project_id: project.project_id, revision_id: `r${project.reference_revisions.length}`, status: 'candidate' }); await writeFile(new URL(`${project.project_id}.json`, output), JSON.stringify(project, null, 2)); };
  const result = await completeProposalImages({ getProject: () => project, generate, save, onProgress: console.log });
  assert.equal(result.saved, 4);
  assert.equal(new Set(project.reference_revisions.map(r => r.output_sha256)).size, 4);
  assert.equal((await completeProposalImages({ getProject: () => project, generate: () => { throw new Error('unexpected retry'); }, save })).saved, 0);
  console.log(`PASS real no-photo room: four distinct hashes; retry generates zero. Evidence ${output.pathname}; isolated DB ${dir}`);
} finally {
  child.kill();
  await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
}
