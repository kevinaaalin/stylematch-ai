import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const useExisting = process.env.E2E_USE_EXISTING === "1";
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
  if (health.comfyui !== "online") throw new Error(`COMFYUI_E2E_BLOCKED: ComfyUI is ${health.comfyui}; expected http://127.0.0.1:8188`);

  const createResponse = await fetch(`${origin}/api/v1/ai/image-tasks`, {
    method: "POST", headers,
    body: JSON.stringify({
      prompt: "Professional modern living room interior, clean lines, warm wood, practical circulation, photorealistic architectural visualization, no people, no text",
      negative_prompt: "distorted architecture, duplicated furniture, warped doors, text, logo, watermark, low resolution",
      style_id: "modern", style_catalog_version: "stylematch.style-catalog.v1", seed: 20260810,
      width: 1024, height: 768, output_type: "perspective_draft", source_media_count: 0,
      operation: { acceptance: "unified_ai_image_task_contract", proposal_scope: "stylematch_pre_match_concept" },
    }),
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 202, JSON.stringify(created));
  assert.equal(created.task.style_id, "modern");
  assert.equal(created.task.seed, 20260810);
  assert.equal(created.task.workflow_version, "stylematch-sdxl-v1");

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
  console.log(`ComfyUI E2E passed: ${task.ai_task_id}, seed=${task.seed}, QA=${task.quality_report.technical_status}`);
} finally {
  if (child) {
    child.kill();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (temp) rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
