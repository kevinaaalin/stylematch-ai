export function appendProposalVersion(project, versionId, at) {
  if (typeof versionId !== 'string' || !versionId.trim() || !Number.isFinite(Date.parse(at))) {
    throw new Error('Invalid proposal version identifier or timestamp.');
  }
  const { proposal_versions: existing = [], ...snapshot } = project;
  if (existing.some((item) => item.version_id === versionId)) {
    throw new Error('Proposal version already exists; create a new revision.');
  }
  const versions = structuredClone(existing);
  const version = {
    version_id: versionId,
    version: Math.max(0, ...versions.map((item) => item.version || 0)) + 1,
    parent_version_id: versions[0]?.version_id || null,
    created_at: at,
    project_snapshot: structuredClone(snapshot),
  };
  return [version, ...versions];
}

export function resolveProposalVersion(project, versionId = '') {
  if (!project || !versionId) return project;
  const matches = (project.proposal_versions || []).filter((item) => item.version_id === versionId);
  if (matches.length !== 1) return null;
  const snapshot = matches[0].project_snapshot;
  const identity = project.project_id || project.id;
  if (!snapshot || !identity || (snapshot.project_id || snapshot.id) !== identity) return null;
  return snapshot;
}
