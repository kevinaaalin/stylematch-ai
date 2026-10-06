export function selectProposalVersionId(project, params) {
  // An explicit ID must never silently resolve to a different version.
  if (params.has('version')) return params.get('version') || '';
  if (params.get('preview') === '1') return '';
  const versions = project?.proposal_versions || [];
  return [...versions].sort((a, b) => Number(b.version) - Number(a.version))[0]?.version_id || '';
}
