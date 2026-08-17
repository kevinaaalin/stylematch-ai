const API_ORIGIN = import.meta.env.VITE_ISAFE_API_ORIGIN || "http://127.0.0.1:4180";

function headers(write = false) {
  return {
    "Content-Type": "application/json",
    ...(write ? { Authorization: "Bearer local-dev-headquarter", "Idempotency-Key": crypto.randomUUID() } : {}),
    "X-Tenant-Id": "tenant_local_tigi",
    "X-Organization-Id": "org_local_headquarter",
    "X-User-Id": "stylematch-local-user",
    "X-Member-Tier": "headquarter",
    "X-Case-Role": "designer",
    "X-Server-Role": "headquarter",
    "X-Case-Authorization": "*",
    "X-Purpose": "structured_space_workspace",
    "X-Consent-Ref": "local_project_consent",
    "X-Trace-Id": crypto.randomUUID(),
  };
}

async function read(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "StructuredSpace 服務暫時無法使用");
  return data;
}

export function listStructuredSpaces(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces`, { headers: headers() }).then(read);
}

export function createStructuredSpace(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function parseFloorplan(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces:parse`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function approveStructuredSpace(snapshotId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/structured-spaces/${encodeURIComponent(snapshotId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export function correctStructuredSpace(snapshotId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/structured-spaces/${encodeURIComponent(snapshotId)}/corrections`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function listAutoLayouts(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts`, { headers: headers() }).then(read);
}

export function validateAutoLayout(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function generateAutoLayoutCandidates(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts:generate`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function approveAutoLayout(layoutId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/layouts/${encodeURIComponent(layoutId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export function listGovernanceHandoffsV2(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/governance-handoffs/v2`, { headers: headers() }).then(read);
}

export function buildGovernanceHandoffV2(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/governance-handoffs/v2`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function receiveGovernanceHandoffV2(handoffId, manifestChecksum) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/intake/handoffs/v2/${encodeURIComponent(handoffId)}/receive`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ manifest_checksum: manifestChecksum }),
  }).then(read);
}

export function createCaseCreationProposal(handoffId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/intake/handoffs/v2/${encodeURIComponent(handoffId)}/case-creation-proposals`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function decideCaseCreationProposal(proposalId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/case-creation-proposals/${encodeURIComponent(proposalId)}/decision`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function executeCaseCreationProposal(proposalId, version) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/case-creation-proposals/${encodeURIComponent(proposalId)}/execute`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_version: version, confirmation: "CREATE_ISAFE_CASE" }),
  }).then(read);
}

export function listApprovedAssets(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/approved-assets`, { headers: headers() }).then(read);
}

export function createApprovedAsset(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/approved-assets`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function approveAsset(assetId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/approved-assets/${encodeURIComponent(assetId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export function listLocalArtifacts(projectId, kind) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/local-artifacts/${encodeURIComponent(kind)}`, { headers: headers() }).then(read);
}

export function createLocalArtifact(projectId, kind, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/local-artifacts/${encodeURIComponent(kind)}`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export function approveLocalArtifact(artifactId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/local-artifacts/${encodeURIComponent(artifactId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export function createSketchUpSession(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/connectors/sketchup/session`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export function captureSketchUpScene(connectionId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/connectors/${encodeURIComponent(connectionId)}/scenes`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export function createSketchUpRenderRoundTrip(connectionId, sceneId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/connectors/${encodeURIComponent(connectionId)}/render`, { method: "POST", headers: headers(true), body: JSON.stringify({ scene_id: sceneId }) }).then(read);
}

export function validateViewSet(payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/viewsets/validate`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export function searchMaterials(query = "") { return fetch(`${API_ORIGIN}/api/v1/materials/search?q=${encodeURIComponent(query)}`, { headers: headers() }).then(read); }
export function mapMaterialBudget(projectId, payload) { return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/budget-map`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read); }
