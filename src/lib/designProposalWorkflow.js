import { buildProposal } from './proposalBuilder.js';
import { proposalContextIssues } from './proposalContext.js';
import { appendProposalVersion, resolveProposalVersion } from './proposalVersions.js';
import { proposalDeliveryContent } from './proposalDeliveryContent.js';

export function runDesignProposalWorkflow(project, { versionId, at, approvedAssets = [], parentVersionId } = {}) {
  if (!project?.project_id && !project?.id) throw new Error('Project ID required');
  const history = project.proposal_versions ?? [];
  if (!Array.isArray(history)) throw new Error('Invalid proposal version history');
  const parent = parentVersionId === undefined ? (history[0]?.version_id ?? null) : parentVersionId;
  if (parent !== null && (typeof parent !== 'string' || !parent.trim() || !resolveProposalVersion(project, parent))) {
    throw new Error('Proposal parent must resolve uniquely within this project');
  }
  if (history.length && parent === null) throw new Error('Existing proposal history requires a parent version');
  const set = (project.confirmed_reference_sets || []).find(item => item.confirmed_reference_set_id === project.active_confirmed_reference_set_id);
  const issues = proposalContextIssues(project, set);
  if (issues.length) return { status: 'incomplete', missing_inputs: issues, proposal: null };
  const snapshot = structuredClone(project);
  delete snapshot.proposal_workflow;
  snapshot.proposal_asset_snapshot = structuredClone(approvedAssets);
  snapshot.proposal_generation = {
    status: 'completed', generated_at: at,
    confirmed_reference_set_id: set.confirmed_reference_set_id,
  };
  const proposal = buildProposal(snapshot);
  snapshot.proposal_document = {
    schema_version: 'proposal-document-v1', version_id: versionId,
    project_id: project.project_id || project.id, status: 'draft',
    created_at: at, proposal: structuredClone(proposal),
    delivery: proposalDeliveryContent(snapshot),
  };
  // A confirmed local reference set is not a server-side asset approval.
  const versions = appendProposalVersion(snapshot, versionId, at);
  versions[0].parent_version_id = parent;
  return { workflow_version: 'W-06-candidate-20260926', status: 'draft', proposal, version: versions[0], confirmed_reference_set_id: set.confirmed_reference_set_id, formal_approval_required: true, governance_state_changed: false };
}
