import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
const temporary = mkdtempSync(join(tmpdir(), "awos-direction-api-"));
const dbPath = join(temporary, "test.db");
const origin = "http://127.0.0.1:4297";
const child = spawn(process.execPath, ["server.mjs"], { cwd: new URL(".", import.meta.url), env: { ...process.env, COMFYUI_CONCEPT_PANORAMA_VERIFIED: "false", ISAFE_API_PORT: "4297", ISAFE_DB_PATH: dbPath, ISAFE_DATA_DIR: temporary }, stdio: "ignore" });
const headers = { "Content-Type": "application/json", Authorization: "Bearer local-dev-headquarter", "X-Tenant-Id": "tenant_local_tigi", "X-Organization-Id": "org_local_headquarter", "X-User-Id": "direction-qa", "X-Member-Tier": "headquarter", "X-Case-Role": "designer", "X-Server-Role": "headquarter", "X-Case-Authorization": "*", "X-Purpose": "test", "X-Consent-Ref": "test", "X-Trace-Id": "test" };
let db;
try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${origin}/api/v1/health`)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 100)); }
  db = new DatabaseSync(dbPath);
  db.prepare(`INSERT INTO ai_image_tasks (ai_task_id,tenant_id,organization_id,purpose,consent_ref,trace_id,idempotency_key,stylematch_project_id,prompt,negative_prompt,workflow_version,checkpoint,seed,width,height,status,created_at,updated_at,operation_metadata) VALUES ('direction-source','tenant_local_tigi','org_local_headquarter','test','test','test','seed','project-a','test','','test','test',1,1024,512,'completed','test','test',?)`).run(JSON.stringify({ panorama_capture: { workflow_version: "stylematch-partial-room-completion-v1" } }));
  const payload = { prompt: "test", stylematch_project_id: "project-a", output_type: "equirectangular_2_1", operation: { derived_direction_task_id: "direction-source", direction_review_confirmed: false } };
  async function rejected(body, status, code) {
    const response = await fetch(`${origin}/api/v1/ai/image-tasks`, { method: "POST", headers: { ...headers, "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(body) });
    const result = await response.json(); assert.equal(response.status, status, JSON.stringify(result)); assert.ok(JSON.stringify(result).includes(code), JSON.stringify(result));
  }
  await rejected(payload, 400, "DIRECTION_REVIEW_REQUIRED");
  await rejected({ prompt: "concept test", width: 1024, height: 512, output_type: "equirectangular_2_1", source_content: { panorama_capture: { input_mode: "concept_direction_completion", shared_center_confirmed: true, concept_only_confirmed: true, horizontal_fov_degrees: 100, ordered_sources: [] } } }, 503, "CONCEPT_PANORAMA_NOT_VERIFIED");
  payload.operation.direction_review_confirmed = true;
  await rejected(payload, 409, "DIRECTION_REFERENCES_REQUIRED");
  await rejected({ ...payload, stylematch_project_id: "another-project" }, 403, "DIRECTION_SCOPE_MISMATCH");
  const directory = join(temporary, "panorama-tasks", "direction-source"); mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "direction-references.json"), JSON.stringify({ ordered_sources: ["front", "right", "back", "left"].map((id, index) => ({ id, yaw: index * 90, media_url: `data:image/png;base64,${id}` })) }));
  await rejected({ ...payload, source_content: { panorama_capture: { ordered_sources: [] } } }, 400, "DIRECTION_LINEAGE_MISMATCH");
  const denied = await fetch(`${origin}/api/v1/ai/image-tasks/direction-source/direction-references`, { headers: { ...headers, "X-Tenant-Id": "other-tenant" } });
  assert.equal(denied.status, 403);
  console.log("PASS: real API rejects missing review, missing extraction, changed sources, foreign project and foreign tenant; isolated database, no provider execution.");
} finally { db?.close(); const exited = once(child, "exit"); child.kill(); await exited; rmSync(temporary, { recursive: true, force: true }); }
