const API_BASE = "http://127.0.0.1:4180/api/v1";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const aiTaskHeaders = ({ idempotencyKey, purpose, caseCode = "*" }) => ({
  "Content-Type": "application/json",
  Authorization: "Bearer local-dev-headquarter",
  "X-Tenant-Id": "tenant_local_tigi",
  "X-Organization-Id": "org_local_headquarter",
  "X-User-Id": "stylematch-local-user",
  "X-Member-Tier": "certified_member",
  "X-Certified-Member-Type": "designer",
  "X-Case-Role": "designer",
  "X-Server-Role": "headquarter",
  "X-Case-Authorization": caseCode || "*",
  "X-Purpose": purpose,
  "X-Consent-Ref": "consent_stylematch_local",
  "X-Trace-Id": `stylematch-${crypto.randomUUID()}`,
  "Idempotency-Key": idempotencyKey,
});

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `AI task request failed (${response.status}).`);
    error.code = payload.code || "AI_TASK_REQUEST_FAILED";
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function createAndWaitForImageTask({
  project,
  prompt,
  negativePrompt,
  outputType,
  purpose,
  sourceMediaUrls = [],
  width = 1024,
  height = 768,
  operation = {},
  timeoutMs = 180000,
}) {
  const idempotencyKey = `${outputType}-${project?.project_id || "local"}-${crypto.randomUUID()}`;
  const headers = aiTaskHeaders({ idempotencyKey, purpose, caseCode: project?.case_code || "*" });
  const created = await readResponse(await fetch(`${API_BASE}/ai/image-tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      stylematch_project_id: project?.stylematch_project_id || project?.project_id || null,
      case_code: project?.case_code || null,
      width,
      height,
      output_type: outputType,
      proposal_scope: "stylematch_pre_match_concept",
      source_media_urls: [...new Set(sourceMediaUrls.filter(Boolean))],
      source_media_count: [...new Set(sourceMediaUrls.filter(Boolean))].length,
      operation,
    }),
  }));

  let task = created.task;
  const deadline = Date.now() + timeoutMs;
  while (task && ["queued", "running"].includes(task.status) && Date.now() < deadline) {
    await sleep(1200);
    task = (await readResponse(await fetch(`${API_BASE}/ai/image-tasks/${task.ai_task_id}`, {
      headers: aiTaskHeaders({
        idempotencyKey: `status-${task.ai_task_id}`,
        purpose: `${purpose}_status`,
        caseCode: project?.case_code || "*",
      }),
    }))).task;
  }
  if (!task || task.status !== "completed" || !task.image_url) {
    throw new Error(task?.error || (Date.now() >= deadline ? "AI task timed out." : "AI task did not complete."));
  }
  return {
    url: `${task.image_url}?v=${encodeURIComponent(task.updated_at || Date.now())}`,
    task,
    generation_source: "local_api_comfyui",
    authoritative: true,
  };
}
