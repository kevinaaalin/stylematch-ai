import { API_ORIGIN, localDevelopmentToken } from './deploymentConfig.js';

function headers(write = false) {
  localDevelopmentToken(); // Read requests also carry development identity headers.
  return {
    "Content-Type": "application/json",
    ...(write ? { Authorization: `Bearer ${localDevelopmentToken()}`, "Idempotency-Key": crypto.randomUUID() } : {}),
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

export async function listStructuredSpaces(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces`, { headers: headers() }).then(read);
}

export async function analyzeStyleMixImage(image) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/stylemix/analyze`, {
    method: 'POST', headers: headers(true), body: JSON.stringify({ image }),
  }).then(read);
}

export async function createStructuredSpace(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function parseFloorplan(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/structured-spaces:parse`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function approveStructuredSpace(snapshotId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/structured-spaces/${encodeURIComponent(snapshotId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export async function correctStructuredSpace(snapshotId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/structured-spaces/${encodeURIComponent(snapshotId)}/corrections`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function listAutoLayouts(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts`, { headers: headers() }).then(read);
}

export async function validateAutoLayout(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function generateAutoLayoutCandidates(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/layouts:generate`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function approveAutoLayout(layoutId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/layouts/${encodeURIComponent(layoutId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export async function listProposalSnapshots(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/proposal-snapshots`, { headers: headers() }).then(read);
}

export async function createProposalSnapshot(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/proposal-snapshots`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function approveProposalSnapshot(proposalSnapshotId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/proposal-snapshots/${encodeURIComponent(proposalSnapshotId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export async function listGovernanceHandoffsV2(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/governance-handoffs/v2`, { headers: headers() }).then(read);
}

export async function buildGovernanceHandoffV2(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/governance-handoffs/v2`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function receiveGovernanceHandoffV2(handoffId, manifestChecksum) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/intake/handoffs/v2/${encodeURIComponent(handoffId)}/receive`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ manifest_checksum: manifestChecksum }),
  }).then(read);
}

export async function createCaseCreationProposal(handoffId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/intake/handoffs/v2/${encodeURIComponent(handoffId)}/case-creation-proposals`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function decideCaseCreationProposal(proposalId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/case-creation-proposals/${encodeURIComponent(proposalId)}/decision`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function executeCaseCreationProposal(proposalId, version) {
  return fetch(`${API_ORIGIN}/api/v1/isafe/case-creation-proposals/${encodeURIComponent(proposalId)}/execute`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_version: version, confirmation: "CREATE_ISAFE_CASE" }),
  }).then(read);
}

export async function listApprovedAssets(projectId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/approved-assets`, { headers: headers() }).then(read);
}

export async function createApprovedAsset(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/approved-assets`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function approveAsset(assetId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/approved-assets/${encodeURIComponent(assetId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export async function listLocalArtifacts(projectId, kind) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/local-artifacts/${encodeURIComponent(kind)}`, { headers: headers() }).then(read);
}

export async function createLocalArtifact(projectId, kind, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/local-artifacts/${encodeURIComponent(kind)}`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function approveLocalArtifact(artifactId, revision) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/local-artifacts/${encodeURIComponent(artifactId)}/approve`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ expected_revision: revision }),
  }).then(read);
}

export async function createSketchUpSession(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/connectors/sketchup/session`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export async function captureSketchUpScene(connectionId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/connectors/${encodeURIComponent(connectionId)}/scenes`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export async function createSketchUpRenderRoundTrip(connectionId, sceneId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/connectors/${encodeURIComponent(connectionId)}/render`, { method: "POST", headers: headers(true), body: JSON.stringify({ scene_id: sceneId }) }).then(read);
}

export async function validateViewSet(payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/viewsets/validate`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read);
}

export async function searchMaterials(query = "") { return fetch(`${API_ORIGIN}/api/v1/materials/search?q=${encodeURIComponent(query)}`, { headers: headers() }).then(read); }
export async function mapMaterialBudget(projectId, payload) { return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/budget-map`, { method: "POST", headers: headers(true), body: JSON.stringify(payload) }).then(read); }

export async function getPlatformCapabilities() {
  return fetch(`${API_ORIGIN}/api/v1/platform/capabilities`).then(read);
}

export async function createProjectPaymentOrder(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/payment-orders`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function createTwcidMatch(projectId, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/twcid/matches`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}

export async function confirmTwcidMatch(matchRequestId, memberId) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/twcid/matches/${encodeURIComponent(matchRequestId)}/confirm`, {
    method: "POST", headers: headers(true), body: JSON.stringify({ member_id: memberId }),
  }).then(read);
}

export async function createConnectorExchangePackage(projectId, toolType, payload) {
  return fetch(`${API_ORIGIN}/api/v1/stylematch/projects/${encodeURIComponent(projectId)}/connectors/${encodeURIComponent(toolType)}/packages`, {
    method: "POST", headers: headers(true), body: JSON.stringify(payload),
  }).then(read);
}
