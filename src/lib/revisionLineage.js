export function revisionLineage(revisions, data, revisionId) {
  const parentId = data.parent_asset_id || null;
  const parent = parentId ? revisions.find((item) => item.revision_id === parentId) : null;
  if (parentId && !parent) throw new Error("來源版本不屬於此專案或已不存在。");
  const derived = [...new Set([...(data.derived_from_asset_ids || []), ...(parent ? [parent.revision_id] : [])])];
  if (derived.some((id) => !revisions.some((item) => item.revision_id === id))) {
    throw new Error("衍生來源必須是同一專案的既有版本。");
  }
  return {
    asset_id: revisionId,
    parent_asset_id: parentId,
    derived_from_asset_ids: derived,
    branch_id: data.new_branch || !parent ? revisionId : (parent.branch_id || parent.revision_id),
  };
}
