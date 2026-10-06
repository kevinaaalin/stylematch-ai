import { completionRooms } from './proposalImageCompletion.js';
import { selectProposalVersionId } from './proposalVersionSelection.js';
import { resolveProposalVersion } from './proposalVersions.js';

export function proposalDeliveryStatus(project) {
  const rooms = completionRooms(project);
  const missing = rooms.reduce((sum, room) => sum + room.missing, 0);
  const versionId = selectProposalVersionId(project, new URLSearchParams());
  const snapshot = versionId && resolveProposalVersion(project, versionId);
  const document = snapshot?.proposal_document;
  const saved = Boolean(document?.version_id === versionId
    && document?.project_id === (project?.project_id || project?.id)
    && document?.proposal && document?.delivery);
  return {
    rooms: rooms.length,
    generated: rooms.reduce((sum, room) => sum + room.revisions.length, 0),
    missing,
    versionId: saved ? versionId : null,
    state: saved ? 'saved' : !rooms.length ? 'needs_scope' : missing ? 'needs_images' : 'needs_proposal',
  };
}
