export const SINGLE_PROPOSAL_MAX_SPACES = 10;
export const MIN_GENERATED_REFERENCES = 4;

// Browser payment records are only usable for local acceptance, never public billing.
export function hasLocalSingleProposal(project) {
  return ['127.0.0.1', 'localhost', '[::1]'].includes(globalThis.location?.hostname)
    && project?.payment?.plan_id === 'single'
    && ['paid', 'paid_test'].includes(project.payment.status);
}

export function canDeliverLocalSingleProposal(project) {
  return hasLocalSingleProposal(project) && !project.single_proposal_delivery;
}

export function isBalconySpace(key) {
  return /^(?:balcony(?:[_-]?\d+)?|陽台(?:\d+)?)$/i.test(key);
}

export function assertSingleProposalSpaceLimit(project) {
  if (project?.payment?.plan_id !== 'single' && project?.plan_id !== 'single') return;
  const spaces = Object.keys(project?.proposal_media?.space_photos || {}).filter(key => key !== 'floor_plan');
  if (spaces.length > SINGLE_PROPOSAL_MAX_SPACES) {
    throw new Error('一般會員單次提案最多 10 個空間（包含陽台），請先確認提案範圍。');
  }
}
