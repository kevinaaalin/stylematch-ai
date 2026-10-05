import { revisionLineage } from "./revisionLineage.js";
import { assetType } from "./assetCompatibility.js";
import { assertPhotoResultSource } from "./spacePhotoContract.js";
import { canDeliverLocalSingleProposal, assertSingleProposalSpaceLimit } from './singleProposalPolicy.js';
import { completionRooms } from './proposalImageCompletion.js';

export function imageResultTransaction(database, projectId, data, payment, ids) {
  if (!payment?.idempotencyKey || !payment.type || !Number.isFinite(payment.cost) || payment.cost < 0) throw new Error("圖片交易資料不完整。");
  const project = database.projects.find((item) => item.project_id === projectId || item.id === projectId);
  if (!project) throw new Error("找不到專案。");
  const included = payment.cost === 0;
  if (included && (!canDeliverLocalSingleProposal(project) || payment.type !== 'proposal_space_completion')) throw new Error('此操作不屬於單次提案內含交付。');
  assertPhotoResultSource(project, data);
  const existing = database.point_ledger.find((item) => item.idempotency_key === payment.idempotencyKey);
  if (existing) {
    const revision = (project.reference_revisions || []).find((item) => item.revision_id === existing.revision_id);
    if (existing.project_id !== project.project_id || existing.type !== payment.type || existing.points !== -payment.cost || !revision
      || revision.image_url !== data.image_url || revision.source_task_id !== data.source_task_id) throw new Error("重送請求與原交易不一致。");
    return { database, revision, transaction: existing, balance: database.point_balance, reused: true };
  }
  if (included) {
    assertSingleProposalSpaceLimit(project);
    const room = completionRooms(project).find(item => item.room === data.completion_room);
    if (!room?.missing || !data.output_sha256 || !Number.isInteger(data.completion_slot) || data.completion_slot < 0 || data.completion_slot > 3
      || room.revisions.some(item => item.completion_slot === data.completion_slot || item.output_sha256 === data.output_sha256)) throw new Error('空間補圖額度、來源或圖片序號無效。');
  }
  if (!data.source_task_id || data.task_status !== "completed" || data.fallback_reason
    || typeof data.image_url !== "string" || !/^(https?:\/\/|data:image\/|\/(?!\/)|\.\/)/i.test(data.image_url)) throw new Error("尚無可計費的有效生成成果。");
  if (!Number.isFinite(database.point_balance) || database.point_balance < payment.cost) throw new Error("點數不足。");
  const next = structuredClone(database);
  const target = next.projects.find((item) => item.project_id === project.project_id);
  const revisions = target.reference_revisions || [];
  const space = data.space || "general";
  const revision = {
    ...data,
    ...revisionLineage(revisions, data, ids.revisionId),
    asset_type: assetType(data),
    revision_id: ids.revisionId, project_id: project.project_id,
    space, version: Math.max(0, ...revisions.filter((item) => item.space === space).map((item) => Number(item.version) || 0)) + 1,
    status: "candidate", created_at: ids.at,
  };
  const transaction = { transaction_id: ids.transactionId, idempotency_key: payment.idempotencyKey,
    project_id: project.project_id, revision_id: revision.revision_id, type: payment.type,
    detail: payment.detail || "", points: included ? 0 : -payment.cost, billing: included ? 'included_local_acceptance' : 'business_points', status: "completed", created_at: ids.at };
  target.reference_revisions = [revision, ...revisions];
  target.updated_at = ids.at;
  next.point_balance -= payment.cost;
  next.point_ledger.unshift(transaction);
  return { database: next, revision, transaction, balance: next.point_balance, reused: false };
}
