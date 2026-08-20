import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const port = 4283;
const origin = `http://127.0.0.1:${port}`;
const temp = mkdtempSync(join(tmpdir(), "stylematch-space-"));
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, ISAFE_API_PORT: String(port), ISAFE_DB_PATH: join(temp, "test.db") },
  stdio: "ignore",
});

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer local-dev-headquarter",
  "X-Tenant-Id": "tenant_local_tigi",
  "X-Organization-Id": "org_local_headquarter",
  "X-User-Id": "space-qa",
  "X-Member-Tier": "headquarter",
  "X-Case-Role": "designer",
  "X-Server-Role": "headquarter",
  "X-Case-Authorization": "*",
  "X-Purpose": "structured_space_contract_test",
  "X-Consent-Ref": "consent_test",
  "X-Trace-Id": "trace-space-test",
};
const FLOORPLAN_FIXTURE_PNG = "iVBORw0KGgoAAAANSUhEUgAAAPAAAAC0CAIAAAAl/ja/AAACOUlEQVR4nO3cQWrDQBAAQU/Q/788OebkBGJtTJqqu4ZFNHNYY83uPqDi490HgDsJmhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBk3K98vDM3HcS+PLrv7ra0KQImhRBkyJoUgRNiqBJETQpL91DP+N7ed/f1ns/537KsKFJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNiqBJETQpgiZF0KQImhRBkyJoUgRNynVi6MycGJvh/ZxjQ5MiaFIETYqgSRE0KYImRdCkzO6++wxwGxuaFEGTImhSBE2KoEkRNCmCJkXQpAiaFEGTImhSBE2KoEkRNCmCJkXQpAiaFEHzKPkEkjMTdEmePC4AAAAASUVORK5CYII=";

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${origin}/api/v1/health`)).ok) return; } catch { /* retry */ }
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

test("SS-01 creates versioned snapshots and requires explicit human approval", async () => {
  await waitForServer();
  const health = await (await fetch(`${origin}/api/v1/health`)).json();
  assert.equal(health.governance_version, "20260820_R9_2_Consolidated");
  assert.equal(health.implementation_baseline, "20260820_R9_2_Candidate_Implementation");
  assert.equal(health.active_baseline, true);
  assert.equal(health.rag_active_version, "R9.2");
  assert.deepEqual(health.archived_predecessors, ["R8", "R9", "R9.1"]);

  const parsed = await post("/api/v1/stylematch/projects/SM-PARSER-001/structured-spaces:parse", {
    floorplan_ref: "local://floorplans/parser-fixture-01.png",
    hints: { primary_room_name: "Living room", area_sqm: 20, units: "mm" },
    confidence_hint: 0.92,
  }, "space-parse-1");
  assert.equal(parsed.response.status, 201);
  assert.equal(parsed.data.parser.mode, "offline_fallback");
  assert.equal(parsed.data.parser.confidence_cap, 0.35);
  assert.equal(parsed.data.confidence, 0.35);
  assert.equal(parsed.data.requires_confirmation, true);
  assert.equal(parsed.data.structured_space.rooms[0].source, "offline_fallback");
  assert.equal(parsed.data.structured_space.rooms[0].area_sqm, 20);
  assert.equal(parsed.data.status, "candidate");
  assert.equal(parsed.data.state_transition_applied, false);

  const visionParsed = await post("/api/v1/stylematch/projects/SM-PARSER-VISION-001/structured-spaces:parse", {
    floorplan_ref: `data:image/png;base64,${FLOORPLAN_FIXTURE_PNG}`,
    hints: { primary_room_name: "客餐廳", units: "mm", mm_per_pixel: 10 },
  }, "space-parse-local-vision-1");
  assert.equal(visionParsed.response.status, 201);
  assert.equal(visionParsed.data.parser.mode, "local_vision");
  assert.equal(visionParsed.data.parser.adapter, "local_floorplan_geometry_vision");
  assert.equal(visionParsed.data.parser.adapter_version, "SS01-local-vision-0.4");
  assert.ok(visionParsed.data.confidence > 0.35 && visionParsed.data.confidence <= 0.72);
  assert.ok(visionParsed.data.structured_space.rooms.length >= 1);
  assert.ok(visionParsed.data.structured_space.rooms[0].polygon.length >= 4);
  assert.ok(visionParsed.data.structured_space.walls.length >= 4);
  assert.ok(visionParsed.data.structured_space.dimensions.length >= 2);
  assert.equal(visionParsed.data.structured_space.dimensions[0].requires_confirmation, true);
  assert.equal(visionParsed.data.structured_space.rooms[0].source, "local_vision");
  assert.match(visionParsed.data.structured_space.source_assets[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(visionParsed.data.requires_confirmation, true);
  assert.equal(visionParsed.data.state_transition_applied, false);

  const conceptualLayout = await post("/api/v1/stylematch/projects/SM-PARSER-001/layouts", {
    structured_space_ref: parsed.data.snapshot_id,
    placements: [],
  }, "layout-conceptual-1");
  assert.equal(conceptualLayout.response.status, 201);
  assert.equal(conceptualLayout.data.conceptual, true);
  assert.equal(conceptualLayout.data.state_transition_applied, false);
  const conceptualApproval = await post(`/api/v1/stylematch/layouts/${conceptualLayout.data.layout_id}/approve`, { expected_revision: 1 }, "layout-conceptual-approve");
  assert.equal(conceptualApproval.response.status, 409);
  assert.equal(conceptualApproval.data.code, "AUTO_LAYOUT_CONCEPTUAL");

  const geometry = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/structured-spaces", {
    floorplan_version: "layout-floorplan-v1",
    confidence: 0.95,
    rooms: [{ id: "room-1", name: "Living room", bounds: { x: 0, y: 0, width: 5000, depth: 4000 } }],
    openings: [{ id: "door-1", room_id: "room-1", clearance: { x: 0, y: 1400, width: 1200, depth: 1200 } }],
    zones: [{ id: "circulation-1", type: "circulation", room_id: "room-1", bounds: { x: 1800, y: 0, width: 900, depth: 4000 } }],
  }, "layout-space-1");
  const geometryApproved = await post(`/api/v1/stylematch/structured-spaces/${geometry.data.snapshot_id}/approve`, { expected_revision: 1 }, "layout-space-approve");
  assert.equal(geometryApproved.data.status, "approved");

  const validLayout = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/layouts", {
    structured_space_ref: geometry.data.snapshot_id,
    placements: [
      { id: "sofa-1", room_id: "room-1", x: 3000, y: 800, width: 1600, depth: 900, rotation: 10 },
      { id: "table-safe", room_id: "room-1", x: 3000, y: 2600, width: 900, depth: 700, rotation: 45 }
    ],
  }, "layout-valid-1");
  assert.equal(validLayout.response.status, 201);
  assert.equal(validLayout.data.validation.valid, true);
  assert.equal(validLayout.data.status, "valid");
  assert.equal(validLayout.data.conceptual, false);
  assert.equal(validLayout.data.validation.score, validLayout.data.score);
  assert.ok(validLayout.data.score <= 100 && validLayout.data.score > 0);
  const layoutApproved = await post(`/api/v1/stylematch/layouts/${validLayout.data.layout_id}/approve`, { expected_revision: 1 }, "layout-valid-approve");
  assert.equal(layoutApproved.response.status, 200);
  assert.equal(layoutApproved.data.status, "approved");
  assert.equal(layoutApproved.data.approved_by, "space-qa");
  assert.equal(layoutApproved.data.state_transition_applied, false);

  const assetV1 = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/approved-assets", {
    logical_asset_id: "living-room-board",
    asset_type: "image",
    label: "Living room design board",
    local_ref: "local://assets/living-room-board-v1.png",
    metadata: { source: "local_upload" },
  }, "asset-v1-create");
  assert.equal(assetV1.response.status, 201);
  assert.equal(assetV1.data.status, "candidate");
  await post(`/api/v1/stylematch/approved-assets/${assetV1.data.asset_id}/approve`, { expected_revision: 1 }, "asset-v1-approve");
  const assetV2 = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/approved-assets", {
    logical_asset_id: "living-room-board",
    asset_type: "image",
    label: "Living room design board revised",
    local_ref: "local://assets/living-room-board-v2.png",
    metadata: { source: "local_upload", corrected: true },
  }, "asset-v2-create");
  assert.equal(assetV2.data.revision, 2);
  const assetV2Approved = await post(`/api/v1/stylematch/approved-assets/${assetV2.data.asset_id}/approve`, { expected_revision: 2 }, "asset-v2-approve");
  assert.equal(assetV2Approved.data.status, "approved");
  const assetList = await (await fetch(`${origin}/api/v1/stylematch/projects/SM-LAYOUT-001/approved-assets`, { headers })).json();
  assert.equal(assetList.assets[0].status, "approved");
  assert.equal(assetList.assets[1].status, "superseded");

  const localArtifacts = {};
  for (const [kind, localRef] of [
    ["viewset", "local://views/living-room-approved.json"],
    ["material_selection", "local://materials/living-room-schedule.json"],
    ["external_scene", "local://scenes/living-room-model.skp"],
  ]) {
    const candidate = await post(`/api/v1/stylematch/projects/SM-LAYOUT-001/local-artifacts/${kind}`, {
      logical_artifact_id: `living-room-${kind}`,
      label: `Living room ${kind}`,
      local_ref: localRef,
      metadata: { source: "local_registry" },
    }, `${kind}-create`);
    assert.equal(candidate.response.status, 201);
    assert.equal(candidate.data.status, "candidate");
    const approvedArtifact = await post(`/api/v1/stylematch/local-artifacts/${candidate.data.artifact_id}/approve`, {
      expected_revision: 1,
    }, `${kind}-approve`);
    assert.equal(approvedArtifact.response.status, 200);
    assert.equal(approvedArtifact.data.status, "approved");
    localArtifacts[kind] = approvedArtifact.data;
  }

  const sketchupSession = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/connectors/sketchup/session", {
    external_project_ref: "local://models/living-room.skp",
    metadata: { sketchup_version: "23.1", source: "contract_test" },
  }, "sketchup-session-create");
  assert.equal(sketchupSession.response.status, 201);
  assert.equal(sketchupSession.data.adapter_mode, "local_native");
  const sketchupScene = await post(`/api/v1/stylematch/connectors/${sketchupSession.data.connection_id}/scenes`, {
    external_scene_ref: "Living Room",
    viewport_ref: "local://viewport/living-room.png",
    camera: { position: [4, 3, 2.8], target: [0, 0, 1.2], fov: 60, eye_height: 1.6 },
    geometry_ref: "local://models/living-room.skp",
    material_refs: ["oak", "white plaster"],
    structured_space_ref: geometry.data.snapshot_id,
  }, "sketchup-scene-capture");
  assert.equal(sketchupScene.response.status, 201);
  const latestSketchupScene = await (await fetch(`${origin}/api/v1/stylematch/connectors/${sketchupSession.data.connection_id}/scenes/latest`, { headers })).json();
  assert.equal(latestSketchupScene.scene_id, sketchupScene.data.scene_id);
  assert.deepEqual(latestSketchupScene.camera.position, [4, 3, 2.8]);
  const sketchupRoundTrip = await post(`/api/v1/stylematch/connectors/${sketchupSession.data.connection_id}/render`, {
    scene_id: sketchupScene.data.scene_id,
  }, "sketchup-render-roundtrip");
  assert.equal(sketchupRoundTrip.response.status, 202);
  assert.equal(sketchupRoundTrip.data.adapter_mode, "local_native");

  const proposalCandidate = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/proposal-snapshots", {
    structured_space_ref: geometry.data.snapshot_id,
    approved_layout_ref: validLayout.data.layout_id,
    requirements: { version: 1, household: { adults: 2, children: 1 }, must_have: ["clear circulation"] },
    style_dna: { primary: "warm_minimal", secondary: "japanese", confidence: 0.86 },
    budget: { currency: "TWD", total: 1800000, design_allocation: 900000 },
    confirmed_reference_set: [{ id: assetV2.data.asset_id, checksum: assetV2.data.checksum }],
    assumptions: ["Existing plumbing positions remain"],
    unresolved_risks: ["Final site dimensions require field verification"],
  }, "proposal-snapshot-create");
  assert.equal(proposalCandidate.response.status, 201);
  assert.equal(proposalCandidate.data.status, "candidate");
  assert.match(proposalCandidate.data.checksum, /^[a-f0-9]{64}$/);
  const designProposalApproved = await post(`/api/v1/stylematch/proposal-snapshots/${proposalCandidate.data.proposal_snapshot_id}/approve`, {
    expected_revision: proposalCandidate.data.revision,
  }, "proposal-snapshot-approve");
  assert.equal(designProposalApproved.response.status, 200);
  assert.equal(designProposalApproved.data.status, "approved");

  const checksumMismatch = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/governance-handoffs/v2", {
    structured_space_ref: geometry.data.snapshot_id,
    approved_layout_ref: validLayout.data.layout_id,
    approved_proposal_ref: designProposalApproved.data.proposal_snapshot_id,
    structured_space_checksum: "0".repeat(64),
  }, "handoff-v2-bad-checksum");
  assert.equal(checksumMismatch.response.status, 409);
  assert.equal(checksumMismatch.data.code, "HANDOFF_V2_CHECKSUM_MISMATCH");

  const handoffV2 = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/governance-handoffs/v2", {
    structured_space_ref: geometry.data.snapshot_id,
    approved_layout_ref: validLayout.data.layout_id,
    approved_proposal_ref: designProposalApproved.data.proposal_snapshot_id,
    structured_space_checksum: geometry.data.checksum,
    layout_checksum: validLayout.data.checksum,
    assumptions: ["Furniture procurement is not included"],
    unresolved_risks: ["Final site dimensions require field verification"],
  }, "handoff-v2-good");
  assert.equal(handoffV2.response.status, 201);
  assert.equal(handoffV2.data.status, "ready_for_intake");
  assert.equal(handoffV2.data.artifacts.structured_space_ref.approval_status, "approved");
  assert.equal(handoffV2.data.artifacts.approved_layout_ref.approval_status, "approved");
  assert.equal(handoffV2.data.artifacts.approved_proposal_ref.id, designProposalApproved.data.proposal_snapshot_id);
  assert.equal(handoffV2.data.artifacts.asset_revision_refs.length, 1);
  assert.equal(handoffV2.data.artifacts.asset_revision_refs[0].id, assetV2.data.asset_id);
  assert.equal(handoffV2.data.artifacts.approved_viewset_refs[0].id, localArtifacts.viewset.artifact_id);
  assert.equal(handoffV2.data.artifacts.material_selection_refs[0].id, localArtifacts.material_selection.artifact_id);
  assert.equal(handoffV2.data.artifacts.external_scene_refs[0].id, localArtifacts.external_scene.artifact_id);
  assert.match(handoffV2.data.manifest_checksum, /^[a-f0-9]{64}$/);
  assert.equal(handoffV2.data.authority_boundary.r5_2_state_transition, false);
  assert.equal(handoffV2.data.state_transition_applied, false);

  const replayHandoff = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/governance-handoffs/v2", {
    structured_space_ref: "ignored-on-replay",
    approved_layout_ref: "ignored-on-replay",
  }, "handoff-v2-good");
  assert.equal(replayHandoff.response.status, 201);
  assert.equal(replayHandoff.data.handoff_id, handoffV2.data.handoff_id);
  assert.equal(replayHandoff.data.idempotent_replay, true);

  const badReceipt = await post(`/api/v1/isafe/intake/handoffs/v2/${handoffV2.data.handoff_id}/receive`, {
    manifest_checksum: "f".repeat(64),
  }, "handoff-v2-receipt-bad");
  assert.equal(badReceipt.response.status, 409);
  assert.equal(badReceipt.data.code, "HANDOFF_V2_CHECKSUM_MISMATCH");

  const received = await post(`/api/v1/isafe/intake/handoffs/v2/${handoffV2.data.handoff_id}/receive`, {
    manifest_checksum: handoffV2.data.manifest_checksum,
  }, "handoff-v2-receipt-good");
  assert.equal(received.response.status, 200);
  assert.equal(received.data.handoff.status, "intake_received");
  assert.equal(received.data.receipt.status, "intake_received");
  assert.equal(received.data.receipt.received_manifest_checksum, handoffV2.data.manifest_checksum);
  assert.match(received.data.receipt.receipt_checksum, /^[a-f0-9]{64}$/);
  assert.equal(received.data.receipt.authority_boundary.case_created, false);
  assert.equal(received.data.receipt.authority_boundary.gate_decision, false);
  assert.equal(received.data.receipt.authority_boundary.r5_2_state_transition, false);
  assert.equal(received.data.state_transition_applied, false);

  const receiptReplay = await post(`/api/v1/isafe/intake/handoffs/v2/${handoffV2.data.handoff_id}/receive`, {}, "handoff-v2-receipt-replay");
  assert.equal(receiptReplay.response.status, 200);
  assert.equal(receiptReplay.data.receipt.receipt_id, received.data.receipt.receipt_id);
  assert.equal(receiptReplay.data.idempotent_replay, true);

  const casesBefore = await (await fetch(`${origin}/api/v1/isafe/cases`, { headers })).json();
  const proposal = await post(`/api/v1/isafe/intake/handoffs/v2/${handoffV2.data.handoff_id}/case-creation-proposals`, {
    title: "Living room renovation governance intake",
    applicant_name: "QA Applicant",
    contact: "qa-applicant@example.test",
  }, "case-proposal-create");
  assert.equal(proposal.response.status, 201);
  assert.equal(proposal.data.status, "pending_review");
  assert.equal(proposal.data.case_created, false);
  assert.equal(proposal.data.authority_boundary.gate_decision, false);
  assert.equal(proposal.data.authority_boundary.r5_2_state_transition, false);

  const proposalReplay = await post(`/api/v1/isafe/intake/handoffs/v2/${handoffV2.data.handoff_id}/case-creation-proposals`, {}, "case-proposal-replay");
  assert.equal(proposalReplay.data.proposal_id, proposal.data.proposal_id);
  assert.equal(proposalReplay.data.idempotent_replay, true);

  const proposalConflict = await post(`/api/v1/isafe/case-creation-proposals/${proposal.data.proposal_id}/decision`, {
    expected_version: 2,
    decision: "approved_for_case_creation",
    rationale: "Artifacts and risks reviewed",
  }, "case-proposal-conflict");
  assert.equal(proposalConflict.response.status, 409);
  assert.equal(proposalConflict.data.code, "VERSION_CONFLICT");

  const proposalApproved = await post(`/api/v1/isafe/case-creation-proposals/${proposal.data.proposal_id}/decision`, {
    expected_version: 1,
    decision: "approved_for_case_creation",
    rationale: "Artifacts and unresolved risks are ready for a separate case creation action",
  }, "case-proposal-approve");
  assert.equal(proposalApproved.response.status, 200);
  assert.equal(proposalApproved.data.status, "approved_for_case_creation");
  assert.equal(proposalApproved.data.version, 2);
  assert.equal(proposalApproved.data.review.reviewed_by, "space-qa");
  assert.equal(proposalApproved.data.case_created, false);
  assert.equal(proposalApproved.data.state_transition_applied, false);
  const casesAfter = await (await fetch(`${origin}/api/v1/isafe/cases`, { headers })).json();
  assert.equal(casesAfter.cases.length, casesBefore.cases.length);

  const badExecution = await post(`/api/v1/isafe/case-creation-proposals/${proposal.data.proposal_id}/execute`, {
    expected_version: 2,
    confirmation: "CREATE_CASE",
  }, "case-execution-bad-confirmation");
  assert.equal(badExecution.response.status, 409);
  assert.equal(badExecution.data.code, "CASE_CREATION_CONFIRMATION_REQUIRED");

  const execution = await post(`/api/v1/isafe/case-creation-proposals/${proposal.data.proposal_id}/execute`, {
    expected_version: 2,
    confirmation: "CREATE_ISAFE_CASE",
  }, "case-execution-good");
  assert.equal(execution.response.status, 201);
  assert.equal(execution.data.case.current_stage, "INTAKE_pending");
  assert.equal(execution.data.case.gate_status, "intake_pending");
  assert.equal(execution.data.execution.authority_boundary.case_created, true);
  assert.equal(execution.data.execution.authority_boundary.gate_decision, false);
  assert.equal(execution.data.execution.authority_boundary.r5_2_state_transition, false);
  assert.match(execution.data.execution.execution_checksum, /^[a-f0-9]{64}$/);
  assert.equal(execution.data.state_transition_applied, false);
  const casesExecuted = await (await fetch(`${origin}/api/v1/isafe/cases`, { headers })).json();
  assert.equal(casesExecuted.cases.length, casesBefore.cases.length + 1);

  const executionReplay = await post(`/api/v1/isafe/case-creation-proposals/${proposal.data.proposal_id}/execute`, {}, "case-execution-replay");
  assert.equal(executionReplay.response.status, 201);
  assert.equal(executionReplay.data.case.isafe_case_id, execution.data.case.isafe_case_id);
  assert.equal(executionReplay.data.execution.execution_id, execution.data.execution.execution_id);
  assert.equal(executionReplay.data.idempotent_replay, true);
  const casesReplayed = await (await fetch(`${origin}/api/v1/isafe/cases`, { headers })).json();
  assert.equal(casesReplayed.cases.length, casesBefore.cases.length + 1);

  const invalidLayout = await post("/api/v1/stylematch/projects/SM-LAYOUT-001/layouts", {
    structured_space_ref: geometry.data.snapshot_id,
    placements: [
      { id: "cabinet-1", room_id: "room-1", x: -100, y: 1500, width: 1000, depth: 800 },
      { id: "chair-1", room_id: "room-1", x: 100, y: 1600, width: 700, depth: 700 },
      { id: "table-1", room_id: "room-1", x: 1900, y: 1000, width: 700, depth: 1000 }
    ],
  }, "layout-invalid-2");
  const violationCodes = new Set(invalidLayout.data.validation.hard_violations.map((item) => item.code));
  assert.equal(invalidLayout.data.status, "invalid");
  assert.equal(invalidLayout.data.validation.valid, false);
  assert.ok(violationCodes.has("OUTSIDE_ROOM_BOUNDS"));
  assert.ok(violationCodes.has("PLACEMENT_COLLISION"));
  assert.ok(violationCodes.has("OPENING_CLEARANCE_BLOCKED"));
  assert.ok(violationCodes.has("CIRCULATION_BLOCKED"));
  assert.equal(invalidLayout.data.state_transition_applied, false);
  assert.ok(invalidLayout.data.score < validLayout.data.score);
  const invalidApproval = await post(`/api/v1/stylematch/layouts/${invalidLayout.data.layout_id}/approve`, { expected_revision: 2 }, "layout-invalid-approve");
  assert.equal(invalidApproval.response.status, 409);
  assert.equal(invalidApproval.data.code, "AUTO_LAYOUT_HARD_VIOLATIONS");

  const polygonSpace = await post("/api/v1/stylematch/projects/SM-POLYGON-001/structured-spaces", {
    floorplan_version: "polygon-floorplan-v1",
    confidence: 1,
    units: "mm",
    clearance_profiles: { opening_depth_mm: 600, circulation_width_mm: 900 },
    rooms: [{ id: "room-l", name: "L room", polygon: [[0, 0], [5000, 0], [5000, 2000], [2000, 2000], [2000, 5000], [0, 5000]] }],
    walls: [],
    openings: [{ id: "door-profile", room_id: "room-l", bounds: { x: 0, y: 2200, width: 100, depth: 900 } }],
    dimensions: [], fixtures: [], furniture: [], zones: [],
    circulation_graph: { nodes: ["room-l"], edges: [{ id: "main-path", room_id: "room-l", path: [[1000, 0], [1000, 5000]] }] },
  }, "polygon-space-create");
  await post(`/api/v1/stylematch/structured-spaces/${polygonSpace.data.snapshot_id}/approve`, { expected_revision: 1 }, "polygon-space-approve");
  const polygonLayout = await post("/api/v1/stylematch/projects/SM-POLYGON-001/layouts", {
    structured_space_ref: polygonSpace.data.snapshot_id,
    placements: [
      { id: "outside-cutout", room_id: "room-l", x: 3000, y: 3000, width: 500, depth: 500, rotation: 30 },
      { id: "door-block", room_id: "room-l", x: 150, y: 2400, width: 400, depth: 400 },
      { id: "path-block", room_id: "room-l", x: 850, y: 3500, width: 300, depth: 300 },
    ],
  }, "polygon-layout-validate");
  const polygonCodes = new Set(polygonLayout.data.validation.hard_violations.map((item) => item.code));
  assert.equal(polygonLayout.data.validation.rule_version, "AL01-rules-1.1");
  assert.ok(polygonCodes.has("OUTSIDE_ROOM_POLYGON"));
  assert.ok(polygonCodes.has("OPENING_CLEARANCE_BLOCKED"));
  assert.ok(polygonCodes.has("CIRCULATION_BLOCKED"));

  const first = await post("/api/v1/stylematch/projects/SM-SPACE-001/structured-spaces", {
    floorplan_version: "floorplan-v1",
    confidence: 0.72,
    rooms: [{ id: "room-living", name: "Living room", polygon: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]] }],
    openings: [{ id: "door-1", type: "door", wall_id: "wall-1", width: 900 }],
  }, "space-create-1");
  assert.equal(first.response.status, 201);
  assert.equal(first.data.revision, 1);
  assert.equal(first.data.status, "candidate");
  assert.match(first.data.checksum, /^[a-f0-9]{64}$/);
  assert.equal(first.data.state_transition_applied, false);

  const second = await post("/api/v1/stylematch/projects/SM-SPACE-001/structured-spaces", {
    floorplan_version: "floorplan-v2",
    confidence: 0.91,
    rooms: [{ id: "room-living", name: "Living room corrected" }],
    circulation_graph: { nodes: ["room-living"], edges: [] },
  }, "space-create-2");
  assert.equal(second.data.revision, 2);
  assert.equal(second.data.parent_snapshot_id, first.data.snapshot_id);

  const conflict = await post(`/api/v1/stylematch/structured-spaces/${second.data.snapshot_id}/approve`, { expected_revision: 1 }, "space-approve-conflict");
  assert.equal(conflict.response.status, 409);
  assert.equal(conflict.data.code, "VERSION_CONFLICT");

  const approved = await post(`/api/v1/stylematch/structured-spaces/${second.data.snapshot_id}/approve`, { expected_revision: 2 }, "space-approve-2");
  assert.equal(approved.response.status, 200);
  assert.equal(approved.data.status, "approved");
  assert.equal(approved.data.approved_by, "space-qa");
  assert.equal(approved.data.state_transition_applied, false);

  const corrected = await post(`/api/v1/stylematch/structured-spaces/${second.data.snapshot_id}/corrections`, {
    expected_revision: 2,
    entity_type: "rooms",
    entity_id: "room-living",
    operation: "upsert",
    value: { name: "Living and dining room", area_sqm: 24.5, confidence: 0.98 },
    reason: "Human checked the dimension annotation",
    confidence: 0.98,
  }, "space-correct-3");
  assert.equal(corrected.response.status, 201);
  assert.equal(corrected.data.snapshot.revision, 3);
  assert.equal(corrected.data.snapshot.status, "candidate");
  assert.equal(corrected.data.snapshot.parent_snapshot_id, second.data.snapshot_id);
  assert.equal(corrected.data.snapshot.structured_space.rooms[0].area_sqm, 24.5);
  assert.equal(corrected.data.snapshot.correction_refs.length, 1);
  assert.equal(corrected.data.correction.before_value.name, "Living room corrected");
  assert.equal(corrected.data.correction.after_value.name, "Living and dining room");
  assert.equal(corrected.data.snapshot.state_transition_applied, false);

  const staleCorrection = await post(`/api/v1/stylematch/structured-spaces/${second.data.snapshot_id}/corrections`, {
    expected_revision: 2,
    entity_type: "rooms",
    entity_id: "room-living",
    operation: "delete",
  }, "space-correct-stale");
  assert.equal(staleCorrection.response.status, 409);
  assert.equal(staleCorrection.data.code, "VERSION_CONFLICT");

  const listedResponse = await fetch(`${origin}/api/v1/stylematch/projects/SM-SPACE-001/structured-spaces`, { headers });
  const listed = await listedResponse.json();
  assert.equal(listed.snapshots.length, 3);
  assert.equal(listed.snapshots[0].status, "candidate");
  assert.equal(listed.snapshots[1].status, "approved");
});

test.after(async () => {
  child.kill();
  if (child.exitCode === null) await once(child, "exit");
  rmSync(temp, { recursive: true, force: true });
});
