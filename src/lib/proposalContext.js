import { StyleAnalysisEngine } from './styleAnalysisEngine.js';

export function proposalContextIssues(project, confirmedSet) {
  const issues = [];
  if (StyleAnalysisEngine.analyze({ project }).cultural_policy.manual_review_required) issues.push('文化偏好待人工覆核');
  if (!(project?.project_name || project?.name)?.trim()) issues.push("專案名稱");
  if (!Number.isFinite(Number(project?.square_footage)) || Number(project.square_footage) <= 0) issues.push("有效室內坪數");
  if (!project?.room_layout?.trim()) issues.push("空間配置");
  if (!project?.budget_range?.trim()) issues.push("預算範圍");
  if (!(project?.primary_style || project?.preferred_style)) issues.push("設計風格");
  if (!confirmedSet?.revision_ids?.length || !Array.isArray(confirmedSet.images) || !confirmedSet.images.length) issues.push("已確認圖片組");
  else if (confirmedSet.revision_ids.some((id) => !(project.reference_revisions || []).some((item) => item.revision_id === id))) issues.push("同專案圖片來源");
  else {
    const ids = confirmedSet.revision_ids;
    const images = confirmedSet.images;
    if (new Set(ids).size !== ids.length || images.length !== ids.length ||
      ids.some(id => images.filter(image => image.revision_id === id).length !== 1)) issues.push('圖片組與版本對應');
    if (images.some(image => {
      const revision = project.reference_revisions.find(item => item.revision_id === image.revision_id);
      return !revision || !revision.image_url || image.image_url !== revision.image_url ||
        ['rejected', 'failed'].includes(revision.status);
    })) issues.push('有效且一致的圖片版本');
    if (confirmedSet.project_id && confirmedSet.project_id !== (project.project_id || project.id)) issues.push('圖片組專案歸屬');
  }
  return issues;
}
