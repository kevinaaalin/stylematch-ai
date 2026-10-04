import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { runDesignProposalWorkflow } from "../src/lib/designProposalWorkflow.js";
import { proposalExportPages } from "../src/lib/proposalExportContent.js";

const useExisting = process.env.E2E_USE_EXISTING === "1";
const imageToImage = process.env.E2E_IMG2IMG === "1";
const port = useExisting ? 4180 : 4281;
const origin = process.env.STYLEMATCH_LOCAL_API || `http://127.0.0.1:${port}`;
const temp = useExisting ? null : mkdtempSync(join(tmpdir(), "stylematch-comfy-e2e-"));
const child = useExisting ? null : spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, ISAFE_API_PORT: String(port), ISAFE_DB_PATH: join(temp, "e2e.db") },
  stdio: "ignore",
});

async function waitForApi() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(`${origin}/api/v1/health`)).ok) return; } catch { /* retry */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Local API did not start at ${origin}`);
}

try {
  await waitForApi();
  const headers = {
    "Content-Type": "application/json", Authorization: "Bearer local-dev-headquarter",
    "X-Tenant-Id": "tenant_local_tigi", "X-Organization-Id": "org_local_headquarter",
    "X-User-Id": "qa-headquarter", "X-Member-Tier": "headquarter", "X-Case-Role": "owner",
    "X-Server-Role": "headquarter", "X-Case-Authorization": "*", "X-Purpose": "comfyui_e2e_acceptance",
    "X-Consent-Ref": "consent_local_qa", "X-Trace-Id": `trace-comfyui-e2e-${Date.now()}`,
    "Idempotency-Key": `comfyui-e2e-${Date.now()}`,
  };
  const healthResponse = await fetch(`${origin}/api/v1/ai/health`);
  assert.equal(healthResponse.ok, true);
  const health = await healthResponse.json();
  const comfyStatus = health.local_image?.status || health.comfyui;
  if (comfyStatus !== "online") throw new Error(`COMFYUI_E2E_BLOCKED: ComfyUI is ${comfyStatus}; expected http://127.0.0.1:8188`);

  const createResponse = await fetch(`${origin}/api/v1/ai/image-tasks`, {
    method: "POST", headers,
    body: JSON.stringify({
      prompt: "Professional modern living room interior, clean lines, warm wood, practical circulation, photorealistic architectural visualization, no people, no text",
      negative_prompt: "distorted architecture, duplicated furniture, warped doors, text, logo, watermark, low resolution",
      style_id: "modern", style_catalog_version: "stylematch.style-catalog.v1", seed: 20260810,
      width: 1024, height: 768, output_type: "perspective_draft", source_media_count: imageToImage ? 1 : 0,
      source_media_urls: imageToImage ? [`data:image/jpeg;base64,${readFileSync(new URL("../public/home-showcase/living-room-before.jpg", import.meta.url)).toString("base64")}`] : [],
      operation: { acceptance: "unified_ai_image_task_contract", proposal_scope: "stylematch_pre_match_concept",
        ...(imageToImage ? { creative_mode: '保留格局，重新設計家具與材質', space: 'living room' } : {}) },
    }),
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 202, JSON.stringify(created));
  assert.equal(created.task.style_id, "modern");
  assert.equal(created.task.seed, 20260810);
  assert.equal(created.task.workflow_version, imageToImage ? "stylematch-sdxl-img2img-v1" : "stylematch-sdxl-v1");

  let task = created.task;
  for (let attempt = 0; attempt < 120 && !["completed", "failed"].includes(task.status); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetch(`${origin}/api/v1/ai/image-tasks/${task.ai_task_id}`, { headers });
    assert.equal(response.ok, true);
    task = (await response.json()).task;
  }
  assert.equal(task.status, "completed", task.error || "ComfyUI task did not complete within 120 seconds");
  assert.equal(task.quality_report?.technical_status, "passed", JSON.stringify(task.quality_report));
  assert.equal(task.quality_report?.human_review?.required, true);
  assert.equal(task.operation?.acceptance, "unified_ai_image_task_contract");
  assert.match(task.output_sha256, /^[a-f0-9]{64}$/);
  assert.equal(task.advisory_only, true);
  const imageUrl = `${origin}/api/v1/ai/image-tasks/${task.ai_task_id}/image`;
  const imageResponse = await fetch(imageUrl, { headers });
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get('content-type'), /^image\//);
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  assert.ok(bytes.length > 1000);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), task.output_sha256);
  assert.equal((await fetch(imageUrl)).status, 400);
  assert.ok([403, 404].includes((await fetch(imageUrl, { headers: { ...headers, 'X-Tenant-Id': 'qa_foreign_tenant' } })).status));
  // In-memory fixture only: do not write an approved asset or alter a user's case.
  const projectId = `qa-${task.ai_task_id}`;
  const image = { revision_id: 'qa-r1', image_url: imageUrl, space: 'living room', source_task_id: task.ai_task_id };
  const project = { id: projectId, project_id: projectId, project_name: 'Local generation acceptance',
    square_footage: 30, room_layout: 'living room', budget_range: '100-200萬', primary_style: 'modern',
    reference_revisions: [image], active_confirmed_reference_set_id: 'qa-set1',
    confirmed_reference_sets: [{ confirmed_reference_set_id: 'qa-set1', revision_ids: ['qa-r1'], images: [image] }] };
  const proposal = runDesignProposalWorkflow(project, { versionId: 'qa-v1', at: new Date().toISOString() });
  assert.equal(proposal.status, 'draft');
  const pages = proposalExportPages(proposal.version.project_snapshot.proposal_document);
  assert.ok(pages.some(page => page.image === imageUrl));
  assert.equal(proposal.formal_approval_required, true);
  if (process.env.E2E_ARTIFACT_DIR) {
    await mkdir(process.env.E2E_ARTIFACT_DIR, { recursive: true });
    await writeFile(join(process.env.E2E_ARTIFACT_DIR, `${task.ai_task_id}.png`), bytes, { flag: 'wx' });
    await writeFile(join(process.env.E2E_ARTIFACT_DIR, `${task.ai_task_id}.json`), JSON.stringify({
      task_id: task.ai_task_id, sha256: task.output_sha256, workflow: task.workflow_version,
      image_bytes: bytes.length, proposal, export_page_count: pages.length,
      scope: 'API image + in-memory project + draft export content; not browser persistence or Office/PDF download acceptance',
    }, null, 2), { flag: 'wx' });
  }
  console.log(`ComfyUI E2E passed: ${task.ai_task_id}, seed=${task.seed}, QA=${task.quality_report.technical_status}`);
} finally {
  if (child) {
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (temp) rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
