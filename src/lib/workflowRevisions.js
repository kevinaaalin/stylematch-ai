import { acceptsAsset } from "./assetCompatibility.js";

export function imageRevisions(project) {
  const revisions = project?.reference_revisions;
  if (!Array.isArray(revisions)) return [];
  return revisions.filter((revision) => revision?.revision_id
    && typeof revision.image_url === "string"
    && /^(https?:\/\/|data:image\/|blob:|\/(?!\/)|\.\/)/i.test(revision.image_url)
    && acceptsAsset("ReferenceCanvas", revision));
}

export function resolveImageRevision(project, revisionId) {
  return imageRevisions(project).find((revision) => revision.revision_id === revisionId) || null;
}

export function revisionHandoffUrl(project, revisionId, target) {
  const projectId = project?.project_id || project?.id;
  if (!projectId || !["AIGenerate", "ReferenceCanvas"].includes(target)
    || !resolveImageRevision(project, revisionId)) return null;
  return `/${target}?${new URLSearchParams({ project: projectId, revision: revisionId })}`;
}

export function recentImageRevisions(projects = [], limit = 20) {
  const seen = new Set();
  return projects.flatMap((project) => imageRevisions(project).map((revision) => ({
    project, revision, key: JSON.stringify([project.project_id || project.id, revision.revision_id]),
  }))).filter((item) => {
    if (!revisionHandoffUrl(item.project, item.revision.revision_id, "ReferenceCanvas") || seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  }).sort((a, b) => (Date.parse(b.revision.created_at) || 0) - (Date.parse(a.revision.created_at) || 0)
    || a.key.localeCompare(b.key)).slice(0, Math.max(0, limit));
}
