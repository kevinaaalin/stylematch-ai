import { resolveProposalVersion } from './proposalVersions.js';

export function getFrozenProposalDocument(project, versionId) {
  if (!project || !versionId || !Array.isArray(project.proposal_versions)) {
    throw new Error('請選擇有效的提案版本。');
  }
  const document = resolveProposalVersion(project, versionId)?.proposal_document;
  if (!document || document.version_id !== versionId ||
      document.project_id !== (project.project_id || project.id)) {
    throw new Error('此版本尚無凍結的提案文件，請重新生成並選擇提案版本。');
  }
  if (!document.proposal || !document.delivery) throw new Error('提案文件內容不完整。');
  return structuredClone(document);
}
