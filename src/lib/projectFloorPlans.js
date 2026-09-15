export function projectFloorPlans(project) {
  if (!project) return [];
  const media = project.proposal_media?.space_photos || project.space_photos || {};
  const images = Array.isArray(media.floor_plan) ? media.floor_plan : [];
  return [...new Set([project.floor_plan_url, ...images])].filter(
    (url) => typeof url === "string" && /^(https?:\/\/|data:image\/|blob:|\/(?!\/)|\.\/)/i.test(url),
  );
}
