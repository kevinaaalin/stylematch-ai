import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const port = 4281;
const origin = `http://127.0.0.1:${port}`;
const temp = mkdtempSync(join(tmpdir(), "isafe-r9-"));
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, ISAFE_API_PORT: String(port), ISAFE_DB_PATH: join(temp, "test.db") },
  stdio: "ignore",
});

const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer local-dev-headquarter",
  "X-Tenant-Id": "tenant_local_tigi",
  "X-Organization-Id": "org_local_headquarter",
  "X-User-Id": "qa-r9-headquarter",
  "X-Member-Tier": "headquarter",
  "X-Case-Role": "reviewer",
  "X-Server-Role": "headquarter",
  "X-Case-Authorization": "*",
  "X-Purpose": "r9_contract_test",
  "X-Consent-Ref": "consent_test",
  "X-Trace-Id": "trace-test-r9",
};

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/v1/health`);
      if (response.ok) return;
    } catch { /* retry */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Test API did not start.");
}

async function post(path, body, key) {
  const response = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: { ...headers, "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
  return { response, data: await response.json() };
}

test("R9 governance objects remain traceable inputs and cannot bypass the R5.2 Gate", async () => {
  await waitForServer();

  const intake = await post("/api/v1/isafe/direct-intakes", {
    title: "R9 governance boundary test",
    applicant_name: "QA",
    contact: "qa-r9@example.test",
  }, "r9-intake");
  assert.equal(intake.response.status, 201);

  const started = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/governance/start`, {
    expected_version: intake.data.case.version,
    actor: "R9 QA",
    actor_role: "headquarter",
    reason: "Create a stable D1 test case",
  }, "r9-start");
  assert.equal(started.response.status, 200);
  const caseId = started.data.case.isafe_case_id;
  const originalVersion = started.data.case.version;

  const risk = await post(`/api/v1/isafe/cases/${caseId}/governance/risk-states`, {
    state: "BLOCKED",
    score: 96,
    reasons: ["Critical evidence conflict"],
    source_type: "rule_engine",
    rule_version: "R9-risk-1",
  }, "r9-risk");
  assert.equal(risk.response.status, 201);
  assert.equal(risk.data.state, "BLOCKED");
  assert.equal(risk.data.state_transition_applied, false);

  const rule = await post("/api/v1/isafe/governance/trigger-rules", {
    rule_id: "TR-V7-001",
    name: "Critical evidence conflict",
    version: "R9-trigger-1",
    status: "active",
    condition: { evidence_conflict: true },
    outcome: "BLOCK",
    pending_action: "human_governance_review",
  }, "r9-trigger-rule");
  assert.equal(rule.response.status, 201);

  const trigger = await post(`/api/v1/isafe/cases/${caseId}/governance/trigger-evaluations`, {
    rule_id: "TR-V7-001",
    reason: "Blocking trigger requires governance review",
    facts: { evidence_conflict: true },
  }, "r9-trigger");
  assert.equal(trigger.response.status, 201);
  assert.equal(trigger.data.pending_action, "human_governance_review");
  assert.ok(trigger.data.notification_id);
  assert.equal(trigger.data.state_transition_applied, false);

  const acknowledged = await post(`/api/v1/isafe/cases/${caseId}/governance/notifications/${trigger.data.notification_id}/acknowledge`, {}, "r9-notification-ack");
  assert.equal(acknowledged.response.status, 200);
  assert.equal(acknowledged.data.status, "acknowledged");
  assert.equal(acknowledged.data.state_transition_applied, false);

  const forbidden = await post(`/api/v1/isafe/cases/${caseId}/governance/risk-states`, {
    state: "HOLD",
    source_type: "rule_engine",
    rule_version: "R9-risk-1",
    next_stage: "D2_floor_plan_design",
  }, "r9-forbidden-transition");
  assert.equal(forbidden.response.status, 409);
  assert.equal(forbidden.data.code, "R9_DIRECT_STATE_TRANSITION_FORBIDDEN");

  const external = await post(`/api/v1/isafe/cases/${caseId}/governance/external-evaluations`, {
    provider_id: "external-reviewer-test",
    evaluation_type: "contract_compliance",
    input: { contract_ref: "QA-CONTRACT-1" },
    output: { recommendation: "manual_review" },
    authority_classification: "advisory",
  }, "r9-external");
  assert.equal(external.response.status, 201);
  assert.equal(external.data.review_status, "pending");
  assert.equal(external.data.state_transition_applied, false);

  const decision = await post(`/api/v1/isafe/cases/${caseId}/governance/decisions`, {
    decision_type: "risk_review",
    outcome: "REVIEW_REQUIRED",
    rationale: "The trigger and external assessment require an authorized Gate review.",
    source_refs: [risk.data.risk_state_id, trigger.data.trigger_evaluation_id, external.data.external_evaluation_id],
    rule_version: "R9-decision-1",
  }, "r9-decision");
  assert.equal(decision.response.status, 201);
  assert.equal(decision.data.state_transition_applied, false);

  const audit = await post(`/api/v1/isafe/cases/${caseId}/governance/audit-outputs`, {
    output_type: "governance_review_snapshot",
    status: "draft",
    payload: { decision_object_id: decision.data.decision_object_id, outcome: decision.data.outcome },
    source_refs: decision.data.source_refs,
    decision_object_id: decision.data.decision_object_id,
  }, "r9-audit");
  assert.equal(audit.response.status, 201);
  assert.match(audit.data.payload_sha256, /^[a-f0-9]{64}$/);
  assert.equal(audit.data.state_transition_applied, false);

  const caseResponse = await fetch(`${origin}/api/v1/isafe/cases/${caseId}`, { headers });
  const currentCase = (await caseResponse.json()).case;
  assert.equal(currentCase.current_stage, "D1_design_preparation");
  assert.equal(currentCase.version, originalVersion);

  const snapshotResponse = await fetch(`${origin}/api/v1/isafe/cases/${caseId}/governance/r9`, { headers });
  const snapshot = await snapshotResponse.json();
  assert.equal(snapshot.current_stage, "D1_design_preparation");
  assert.equal(snapshot.risk_states.length, 1);
  assert.equal(snapshot.trigger_evaluations.length, 1);
  assert.equal(snapshot.external_evaluations.length, 1);
  assert.equal(snapshot.decision_objects.length, 1);
  assert.equal(snapshot.audit_outputs.length, 1);
  assert.equal(snapshot.notifications.length, 1);
  assert.equal(snapshot.notifications[0].status, "acknowledged");
});

test.after(async () => {
  child.kill();
  if (child.exitCode === null) await once(child, "exit");
  rmSync(temp, { recursive: true, force: true });
});
