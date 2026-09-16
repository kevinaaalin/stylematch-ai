import { proposalSpaceCoverage } from './proposalSpaceCoverage.js';
// Website-only presentation layer: do not change the AWOS-pinned analysis builder.
export function chunks(items, size = 4) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

export function proposalDeliveryContent(project) {
  // A generated proposal stays bound to the set used for that generation,
  // even if the user subsequently confirms another set in the image workspace.
  const setId = project.proposal_generation?.confirmed_reference_set_id;
  const set = (project.confirmed_reference_sets || []).find((item) => item.confirmed_reference_set_id === setId);
  const projectId = project.project_id || project.id;
  const validSet = set && (!set.project_id || set.project_id === projectId);
  const revisions = project.reference_revisions || [];
  const adopted = validSet ? (set.images || []).filter((image) =>
    set.revision_ids?.includes(image.revision_id) && revisions.some((revision) =>
      revision.revision_id === image.revision_id && revision.image_url === image.image_url)) : [];
  const pending = [];
  if (!project.square_footage) pending.push("補充室內坪數，重新確認預算估算基礎。");
  if (!project.room_layout) pending.push("補充空間配置與動線需求。");
  if (!project.proposal_media?.space_photos?.floor_plan?.length) pending.push("補充平面圖，尺寸與現場條件須由設計師確認。");
  if (!adopted.length) pending.push("尚無可核對來源的提案採用圖片；請先在提案圖確認工作區確認圖片並生成提案。");
  if (validSet && adopted.length !== (set.images || []).length) pending.push("部分採用圖片缺少同專案版本來源，未納入交付，請回工作區核對。");
  pending.push("確認三案選擇、材料樣品、分項報價及施工條件；本提案不構成工程核准。");
  return { adopted, setId: validSet ? setId : null, generatedAt: project.proposal_generation?.generated_at || null, pending, spaceCoverage: proposalSpaceCoverage(project) };
}
