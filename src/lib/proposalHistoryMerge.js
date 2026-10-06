function snapshotText(value) {
  return JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}

// Imported working data may be newer, but saved proposal snapshots are immutable.
export function mergeProposalHistory(current, incoming, preferred) {
  const versions = new Map();
  for (const version of [...(current.proposal_versions || []), ...(incoming.proposal_versions || [])]) {
    if (!version?.version_id) throw new Error('提案歷史缺少版本 ID，未匯入。');
    const existing = versions.get(version.version_id);
    if (existing && snapshotText(existing) !== snapshotText(version)) {
      throw new Error(`提案版本 ${version.version_id} 內容衝突，未覆寫歷史資料。`);
    }
    versions.set(version.version_id, version);
  }
  if (!versions.size) return preferred;
  return { ...preferred, proposal_versions: [...versions.values()].sort((a, b) => Number(b.version) - Number(a.version)) };
}
