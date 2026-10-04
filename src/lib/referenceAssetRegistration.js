export function selectApprovedReferenceAssets(projectId, set, assets) {
  if (!projectId || !Array.isArray(set?.images) || !set.images.length || !Array.isArray(assets)) throw new Error('請先確認圖片組。');
  const ids = set.images.map(image => image?.revision_id);
  if (ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
    throw new Error('圖片版本識別缺失或重複，請重新確認圖片組。');
  }
  return set.images.map(image => {
    const matches = assets.filter(item => item.stylematch_project_id === projectId && item.status === 'approved' &&
      item.metadata?.local_revision_id === image.revision_id && item.local_ref === image.image_url);
    if (matches.length !== 1 || !image.image_url) throw new Error(`圖片 ${image.revision_id} 必須有唯一且有效的核准紀錄。`);
    return structuredClone(matches[0]);
  });
}

export async function registerReferenceAsset(projectId, revision, api) {
  if (!projectId || revision?.project_id !== projectId || !revision.revision_id || !revision.image_url) {
    throw new Error('圖片版本不屬於目前專案。');
  }
  if (['failed', 'rejected'].includes(revision.status) || revision.fallback_reason) {
    throw new Error('失敗或備援示意圖片不可登錄為提案資產。');
  }
  const { assets } = await api.listApprovedAssets(projectId);
  const matches = assets.filter(asset => asset.metadata?.local_revision_id === revision.revision_id);
  if (matches.some(asset => asset.local_ref !== revision.image_url)) throw new Error('資產來源與圖片版本不一致。');
  if (matches.length) return matches.sort((a, b) => b.revision - a.revision)[0];
  return api.createApprovedAsset(projectId, {
    logical_asset_id: `reference-${revision.branch_id || revision.revision_id}`,
    asset_type: 'image', label: `${revision.space} v${revision.version}`,
    local_ref: revision.image_url,
    metadata: {
      local_revision_id: revision.revision_id, source_task_id: revision.source_task_id || null,
      original_image_url: revision.original_image_url || null, preview_encoding: revision.preview_encoding || null,
      workflow_version: revision.workflow_version || null,
      stylemix: revision.stylemix || null, authoritative: revision.authoritative === true,
    },
  });
}
