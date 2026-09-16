// Read-only delivery projection. Image counts never establish panorama quality.
export function proposalSpaceCoverage(project = {}) {
  const projectId = project.project_id || project.id;
  const revisions = Array.isArray(project.reference_revisions) ? project.reference_revisions : [];
  const rooms = project.proposal_media?.space_photos || {};
  return Object.entries(rooms).filter(([room]) => room !== 'floor_plan').map(([room, values]) => {
    const originals = Array.isArray(values) ? values.filter(value => typeof value === 'string' && value.length) : [];
    const valid = revisions.filter(revision => projectId && revision.project_id === projectId
      && revision.source_photo_room === room && originals.includes(revision.source_image_url)
      && typeof revision.source_task_id === 'string' && revision.source_task_id.length
      && typeof revision.image_url === 'string' && revision.image_url.length
      && revision.status !== 'archived');
    const generated = new Set(valid.map(revision => revision.image_url));
    const covered = originals.filter(url => valid.some(revision => revision.source_image_url === url));
    return {
      room, original_count: originals.length, covered_original_count: covered.length,
      missing_original_count: originals.length - covered.length,
      generated_reference_count: generated.size, target_reference_count: 4,
      additional_reference_count: Math.max(0, 4 - generated.size),
      upload_limit_exceeded: originals.length > 4,
      direction_quality_status: 'NOT_VERIFIED',
    };
  });
}
