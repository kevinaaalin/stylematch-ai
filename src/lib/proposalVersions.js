export function appendProposalVersion(project, versionId, at) {
  const { proposal_versions: existing = [], ...snapshot } = project;
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
