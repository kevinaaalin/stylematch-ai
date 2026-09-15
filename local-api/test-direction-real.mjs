import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { once } from "node:events";
import { DatabaseSync } from "node:sqlite";
const directory = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(resolve("../analysis_output/direction-real-"));
const origin = "http://127.0.0.1:4298";
const queue = await (await fetch("http://127.0.0.1:8188/queue")).json();
if (!process.argv[2]) assert.equal(queue.queue_running.length + queue.queue_pending.length, 0, "ComfyUI already busy; leave existing jobs alone");
// Opt-in only in this isolated quality test, never change the production environment.
const child = spawn(process.execPath, ["server.mjs"], { cwd: new URL(".", import.meta.url), env: { ...process.env, COMFYUI_CONCEPT_PANORAMA_VERIFIED: "true", ISAFE_API_PORT: "4298", ISAFE_DB_PATH: join(directory, "test.db"), ISAFE_DATA_DIR: directory }, stdio: "ignore" });
const headers = { "Content-Type": "application/json", Authorization: "Bearer local-dev-headquarter", "X-Tenant-Id": "tenant_local_tigi", "X-Organization-Id": "org_local_headquarter", "X-User-Id": "direction-real-qa", "X-Member-Tier": "headquarter", "X-Case-Role": "designer", "X-Server-Role": "headquarter", "X-Case-Authorization": "*", "X-Purpose": "local_quality_test", "X-Consent-Ref": "user_requested_local_implementation", "X-Trace-Id": "direction-real-qa", "Idempotency-Key": crypto.randomUUID() };
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${origin}/api/v1/health`)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 100)); }
  let created;
  if (process.argv[2]) { const db = new DatabaseSync(join(directory, "test.db"), { readOnly: true }); created = { task: db.prepare("SELECT * FROM ai_image_tasks ORDER BY id DESC LIMIT 1").get() }; db.close(); }
  else {
    const response = await fetch(`${origin}/api/v1/ai/image-tasks`, { method: "POST", headers, body: JSON.stringify({ prompt: "Single coherent modern living room, warm neutral plaster walls, oak floor, one sofa, one window, one doorway. Seamless 360-degree equirectangular 2:1 architectural interior panorama, one fixed camera center, level horizon, continuous ceiling and floor, no text, no collage. Pure conceptual design, no measured site data.", width: 1024, height: 512, seed: 260916, stylematch_project_id: "direction-real-test", output_type: "equirectangular_2_1", operation: { direction_completion: true }, source_media_urls: [], source_content: { panorama_capture: { input_mode: "concept_direction_completion", concept_only_confirmed: true, shared_center_confirmed: true, horizontal_fov_degrees: 100, ordered_sources: [] } } }) });
    created = await response.json(); assert.equal(response.status, 202, JSON.stringify(created));
  }
  const id = created.task.ai_task_id; console.log(JSON.stringify({ task: id, evidence: directory }));
  let task;
  for (let i = 0; i < 300; i++) {
    task = (await (await fetch(`${origin}/api/v1/ai/image-tasks/${id}`, { headers })).json()).task;
    if (["completed", "failed"].includes(task.status)) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  assert.equal(task.status, "completed", task.error || task.status);
  const extracted = await fetch(`${origin}/api/v1/ai/image-tasks/${id}/direction-references`, { headers });
  const result = await extracted.json(); assert.equal(extracted.status, 200, JSON.stringify(result));
  assert.equal(result.ordered_sources.length, 4); assert.equal(result.concept_only, true); assert.equal(result.known_pixel_count, 0);
  for (const view of result.ordered_sources) writeFileSync(join(directory, `${view.id}.png`), Buffer.from(view.media_url.split(",")[1], "base64"));
  writeFileSync(join(directory, "evidence.json"), JSON.stringify({ task_id: id, source_count: 0, workflow: "concept_direction_completion", result: { ...result, ordered_sources: result.ordered_sources.map(({ media_url, ...view }) => view) }, visual_acceptance: "pending" }, null, 2));
  console.log(JSON.stringify({ completed: true, evidence: directory, semantic_acceptance: "pending_visual_review" }));
} finally { const exited = once(child, "exit"); child.kill(); await exited; }
