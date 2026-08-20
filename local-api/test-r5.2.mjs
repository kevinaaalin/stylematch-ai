import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const port = 4280;
const origin = `http://127.0.0.1:${port}`;
const temp = mkdtempSync(join(tmpdir(), "isafe-r52-"));
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
  "X-User-Id": "qa-headquarter",
  "X-Member-Tier": "headquarter",
  "X-Case-Role": "reviewer",
  "X-Server-Role": "headquarter",
  "X-Case-Authorization": "*",
  "X-Purpose": "automated_contract_test",
  "X-Consent-Ref": "consent_test",
  "X-Trace-Id": "trace-test-r6-alignment",
  "Idempotency-Key": "test-seed",
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

async function post(path, body, idempotencyKey, headerOverrides = {}) {
  const response = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: { ...headers, ...headerOverrides, "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
  return { response, data: await response.json() };
}

test("R5.2 exposes the official ten-stage contract and enforces evidence/payment separation", async () => {
  await waitForServer();
  const healthResponse = await fetch(`${origin}/api/v1/health`);
  const health = await healthResponse.json();
  assert.equal(health.governance_version, "20260820_R9_2_Consolidated");
  assert.equal(health.rag_active_version, "R9.2");
  assert.equal(health.state_authority, "20260722_R5_2");
  assert.equal(health.governance_release_id, "TIGI-GOVERNANCE-20260820-R9.2-CONSOLIDATED");
  assert.equal(health.patent_version, "V7_LOCKED");
  assert.equal(health.final_official_allowed, false);

  const releaseResponse = await fetch(`${origin}/api/v1/governance/release`);
  const release = await releaseResponse.json();
  assert.equal(release.state_contract_version, "20260722_R5_2");
  assert.equal(release.compatibility.breaking_contract_change_approved, false);
  const contractResponse = await fetch(`${origin}/api/v1/isafe/state-machine`);
  const contract = await contractResponse.json();
  assert.equal(contract.stages.length, 10);
  assert.deepEqual(contract.stages.map((stage) => stage.code), ["D1", "D2", "D3", "D4", "D5", "C1", "C2", "C3", "C4", "C5"]);
  assert.equal(contract.stages[1].name, "平面設計規劃");
  assert.equal(contract.stages[6].name, "第一期工程施工");
  assert.equal(contract.payment_policy.automatic_on_gate, false);

  const missingContext = await fetch(`${origin}/api/v1/isafe/cases`);
  assert.equal(missingContext.status, 400);
  assert.equal((await missingContext.json()).code, "REQUEST_CONTEXT_REQUIRED");

  const intake = await post("/api/v1/isafe/direct-intakes", {
    title: "R5.2 state contract test",
    applicant_name: "QA",
    contact: "qa@example.test",
  }, "test-intake");
  assert.equal(intake.response.status, 201);
  assert.equal(intake.data.case.current_stage, "INTAKE_pending");
  assert.equal(intake.data.case.risk_assessment.formal, false);
  assert.equal(intake.data.case.risk_assessment.status, "pilot_unverified");

  const started = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/governance/start`, {
    expected_version: intake.data.case.version,
    actor: "QA",
    actor_role: "headquarter",
    reason: "Approved for test",
  }, "test-start");
  assert.equal(started.response.status, 200);
  assert.equal(started.data.case.current_stage, "D1_design_preparation");

  const parityResponse = await fetch(`${origin}/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy`, { headers });
  const parity = await parityResponse.json();
  assert.equal(parity.response, undefined);
  assert.equal(parity.workspace.checklist.length, 82);
  assert.equal(parity.workspace.milestones.length, 8);
  assert.equal(parity.workspace.contract_version, "20260723_R5_2_PARITY_1");

  const firstChecklist = parity.workspace.checklist.find((item) => item.stage === "D1_design_preparation");
  const checked = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${firstChecklist.checklist_item_id}/status`, {
    status: "completed",
    actor: "QA",
  }, "test-checklist");
  assert.equal(checked.response.status, 200);
  assert.equal(checked.data.workspace.checklist_summary.completed, 1);
  assert.equal(checked.data.workspace.checklist.find((item) => item.checklist_item_id === firstChecklist.checklist_item_id).confirmations.owner.status, "completed");

  const secondChecklist = parity.workspace.checklist.filter((item) => item.stage === "D1_design_preparation")[1];
  const certifiedHeaders = {
    "X-User-Id": "qa-certified-designer",
    "X-Member-Tier": "certified_member",
    "X-Certified-Member-Type": "designer",
    "X-Case-Role": "case_designer",
  };
  const ownerHeaders = {
    "X-User-Id": "qa-owner",
    "X-Member-Tier": "general_member",
    "X-Case-Role": "case_owner",
  };
  const forbiddenParty = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${secondChecklist.checklist_item_id}/confirmations/owner`, {
    status: "completed",
    expected_version: 1,
  }, "test-checklist-forbidden-party", certifiedHeaders);
  assert.equal(forbiddenParty.response.status, 403);
  assert.equal(forbiddenParty.data.code, "CHECKLIST_PARTY_FORBIDDEN");

  const certifiedConfirmation = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${secondChecklist.checklist_item_id}/confirmations/certified_member`, {
    status: "completed",
    expected_version: 1,
  }, "test-checklist-certified", certifiedHeaders);
  assert.equal(certifiedConfirmation.response.status, 200);
  assert.equal(certifiedConfirmation.data.workspace.checklist_summary.completed, 1);
  assert.equal(certifiedConfirmation.data.workspace.checklist.find((item) => item.checklist_item_id === secondChecklist.checklist_item_id).aggregate_status, "pending");

  const ownerConfirmation = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${secondChecklist.checklist_item_id}/confirmations/owner`, {
    status: "completed",
    expected_version: 1,
  }, "test-checklist-owner", ownerHeaders);
  assert.equal(ownerConfirmation.response.status, 200);
  assert.equal(ownerConfirmation.data.workspace.checklist_summary.completed, 2);

  const planned = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist`, {
    stage: "D1_design_preparation",
    label: "QA 執行前項目",
    content: "QA 驗收內容",
    actor: "QA",
  }, "test-planning-add");
  assert.equal(planned.response.status, 201);
  const plannedItem = planned.data.workspace.checklist.find((item) => item.label === "QA 執行前項目");
  assert.equal(plannedItem.content, "QA 驗收內容");

  const editedPlan = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${plannedItem.checklist_item_id}/edit`, {
    label: "QA 執行前項目（修訂）",
    content: "QA 修訂後驗收內容",
    actor: "QA",
  }, "test-planning-edit");
  assert.equal(editedPlan.response.status, 200);
  assert.equal(editedPlan.data.workspace.checklist.find((item) => item.checklist_item_id === plannedItem.checklist_item_id).content, "QA 修訂後驗收內容");

  const deletedPlan = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${plannedItem.checklist_item_id}/delete`, { actor: "QA" }, "test-planning-delete");
  assert.equal(deletedPlan.response.status, 200);
  assert.equal(deletedPlan.data.workspace.checklist.some((item) => item.checklist_item_id === plannedItem.checklist_item_id), false);

  const certifiedBaseline = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/execution-checklist-baseline/confirm`, {
    party: "certified_member", actor: "QA Designer",
  }, "test-planning-confirm-certified", certifiedHeaders);
  assert.equal(certifiedBaseline.response.status, 200);
  assert.equal(certifiedBaseline.data.workspace.execution_checklist_baseline.status, "draft");

  const ownerBaseline = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/execution-checklist-baseline/confirm`, {
    party: "owner", actor: "QA Owner",
  }, "test-planning-confirm-owner", ownerHeaders);
  assert.equal(ownerBaseline.response.status, 200);
  assert.equal(ownerBaseline.data.workspace.execution_checklist_baseline.status, "frozen");

  const frozenEdit = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/checklist/${secondChecklist.checklist_item_id}/edit`, {
    label: "Should not update", content: "frozen", actor: "QA",
  }, "test-planning-frozen-edit");
  assert.equal(frozenEdit.response.status, 409);
  assert.equal(frozenEdit.data.code, "CHECKLIST_BASELINE_FROZEN");

  const baseline = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/contract-baseline`, {
    design_total: 100000,
    construction_total: 900000,
    contract_ref: "CONTRACT-QA-1",
    status: "approved",
    reason: "QA establishes the approved R6 baseline version.",
    actor: "QA",
  }, "test-baseline");
  assert.equal(baseline.response.status, 200);
  assert.equal(baseline.data.workspace.baseline.current_version, 2);
  assert.equal(baseline.data.workspace.baseline_history.length, 2);
  assert.equal(baseline.data.workspace.baseline_history[0].supersedes_version_id, baseline.data.workspace.baseline_history[1].baseline_version_id);
  assert.equal(baseline.data.workspace.baseline_history[0].reason, "QA establishes the approved R6 baseline version.");
  assert.equal(baseline.data.workspace.milestones.find((item) => item.code === "DESIGN_DEPOSIT").amount, 30000);
  assert.equal(baseline.data.workspace.milestones.find((item) => item.code === "CONSTRUCTION_FINAL").amount, 90000);

  const wrongTenant = await fetch(`${origin}/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy`, {
    headers: { ...headers, "X-Tenant-Id": "tenant_other" },
  });
  assert.equal(wrongTenant.status, 404);

  const change = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/change-orders`, {
    title: "QA 追加插座",
    reason: "需求變更",
    amount_delta: 5000,
    schedule_delta_days: 1,
    actor: "QA",
  }, "test-change");
  assert.equal(change.response.status, 201);
  assert.equal(change.data.workspace.change_orders.length, 1);

  const message = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/messages`, {
    category: "question",
    body: "請確認追加工程。",
    actor: "QA",
    actor_role: "owner",
  }, "test-message");
  assert.equal(message.response.status, 201);
  assert.equal(message.data.workspace.messages.length, 1);

  const file = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/legacy/evidence-files`, {
    file_name: "qa.txt",
    mime_type: "text/plain",
    content_base64: Buffer.from("qa evidence").toString("base64"),
    evidence_type: "project_file",
    step_key: "D1_design_preparation",
    actor: "QA",
  }, "test-file");
  assert.equal(file.response.status, 201);
  assert.equal(file.data.workspace.evidence_files.length, 1);

  const blocked = await post(`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/gates/evaluate`, {
    expected_version: started.data.case.version,
    actor: "QA",
    actor_role: "headquarter",
    outcome: "Passed",
  }, "test-blocked-gate");
  assert.equal(blocked.response.status, 409);
  assert.equal(blocked.data.code, "GATE_EVIDENCE_INCOMPLETE");
  assert.deepEqual(blocked.data.details.missing_evidence, contract.stages[0].required_evidence);

  let current = started.data.case;
  for (const evidenceType of contract.stages[0].required_evidence) {
    const evidence = await post(`/api/v1/isafe/cases/${current.isafe_case_id}/evidence`, {
      evidence_type: evidenceType,
      content: `${evidenceType}-content`,
      created_by: "QA",
    }, `test-evidence-${evidenceType}`);
    assert.equal(evidence.response.status, 201);
    current = evidence.data.case;
  }

  const passed = await post(`/api/v1/isafe/cases/${current.isafe_case_id}/gates/evaluate`, {
    expected_version: current.version,
    actor: "QA",
    actor_role: "headquarter",
    outcome: "Passed",
  }, "test-passed-gate");
  assert.equal(passed.response.status, 200);
  assert.equal(passed.data.case.current_stage, "D2_floor_plan_design");
  assert.equal(passed.data.case.payment_eligibilities.length, 0);

  const lockedStage = await post(`/api/v1/isafe/cases/${current.isafe_case_id}/legacy/checklist/${secondChecklist.checklist_item_id}/confirmations/certified_member`, {
    status: "pending",
    expected_version: 2,
  }, "test-checklist-locked", certifiedHeaders);
  assert.equal(lockedStage.response.status, 409);
  assert.equal(lockedStage.data.code, "CHECKLIST_STAGE_LOCKED");
});

test.after(async () => {
  child.kill();
  if (child.exitCode === null) await once(child, "exit");
  rmSync(temp, { recursive: true, force: true });
});
