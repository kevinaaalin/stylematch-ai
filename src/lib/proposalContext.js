export function proposalContextIssues(project, confirmedSet) {
  const issues = [];
  if (!(project?.project_name || project?.name)?.trim()) issues.push("專案名稱");
  if (!Number.isFinite(Number(project?.square_footage)) || Number(project.square_footage) <= 0) issues.push("有效室內坪數");
  if (!project?.room_layout?.trim()) issues.push("空間配置");
  if (!project?.budget_range?.trim()) issues.push("預算範圍");
  if (!(project?.primary_style || project?.preferred_style)) issues.push("設計風格");
  if (!confirmedSet?.revision_ids?.length || !Array.isArray(confirmedSet.images) || !confirmedSet.images.length) issues.push("已確認圖片組");
  else if (confirmedSet.revision_ids.some((id) => !(project.reference_revisions || []).some((item) => item.revision_id === id))) issues.push("同專案圖片來源");
  return issues;
}
