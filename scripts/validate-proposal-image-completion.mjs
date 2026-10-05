import assert from 'node:assert/strict';
import { completeProposalImages, completionRooms } from '../src/lib/proposalImageCompletion.js';
const project = { project_id: 'qa', primary_style: 'modern', proposal_media: { space_photos: { living_room: ['original'], bedroom: [], floor_plan: ['plan'] } }, reference_revisions: [] };
let calls = 0;
let fail = true;
const generate = async request => {
  calls++;
  if (fail && calls === 3) throw new Error('provider down');
  assert.ok(request.seed >= 0);
  assert.equal(request.provider, 'comfyui');
  return { url: `data:image/png;${request.seed}`, task: { ai_task_id: `t${request.seed}`, status: 'completed', output_sha256: `${request.seed}` }, authoritative: true };
};
const save = async data => project.reference_revisions.push({ ...data, project_id: 'qa', revision_id: `r${calls}`, status: 'candidate' });
await assert.rejects(completeProposalImages({ getProject: () => project, generate, save }), /provider down/);
assert.equal(project.reference_revisions.length, 2);
fail = false;
const result = await completeProposalImages({ getProject: () => project, generate, save });
assert.equal(result.saved, 6);
assert.equal(project.reference_revisions.length, 8);
assert.equal(completionRooms(project).length, 2);
assert.ok(result.rooms.every(r => r.missing === 0));
assert.equal(project.reference_revisions.filter(r => r.provenance === 'no_photo_concept').length, 4);
assert.equal((await completeProposalImages({ getProject: () => project, generate, save })).saved, 0);
const broken = structuredClone(project);
broken.reference_revisions.forEach(r => { r.status = 'failed'; });
assert.ok(completionRooms(broken).every(r => r.missing === 4));
await assert.rejects(completeProposalImages({ getProject: () => ({}), generate, save }), /登錄/);
const numbered = { project_id: 'numbered', proposal_media: { space_photos: { bedroom3: [], bathroom2: [] } }, reference_revisions: [] };
await completeProposalImages({ getProject: () => numbered, generate: async request => {
  assert.match(request.prompt, request.operation.completion_room === 'bedroom3' ? /bedroom with bed/ : /bathroom with basin/);
  assert.ok(['臥室三', '衛浴二'].includes(request.operation.space));
  return generate(request);
}, save: async data => numbered.reference_revisions.push({ ...data, project_id: 'numbered', status: 'candidate' }) });
assert.equal(numbered.reference_revisions.length, 8);
const retired = numbered.reference_revisions[1];
const originalTask = retired.source_task_id;
retired.status = 'rejected';
const retry = await completeProposalImages({ getProject: () => numbered, generate: async request => {
  assert.equal(request.operation.completion_slot, 1);
  const result = await generate(request);
  assert.notEqual(result.task.ai_task_id, originalTask);
  return result;
}, save: async data => numbered.reference_revisions.push({ ...data, project_id: 'numbered', status: 'candidate' }) });
assert.equal(retry.saved, 1);
assert.ok(completionRooms(numbered).every(room => room.missing === 0));
console.log('PASS two rooms, zero-photo concept, partial failure resume, no repeat, invalid results excluded');
const single = { project_id: 'single', payment: { plan_id: 'single' }, proposal_media: { space_photos: {
  bedroom1: [], bedroom2: [], bedroom3: [], bedroom4: [], living_room: [], dining_room: [], bathroom1: [], bathroom2: [], kitchen: [], balcony: [],
} }, reference_revisions: [] };
assert.equal(completionRooms(single).length, 9);
assert.equal(completionRooms(single).reduce((sum, room) => sum + room.missing, 0), 36);
single.proposal_media.space_photos.balcony = ['balcony-photo'];
assert.equal(completionRooms(single).length, 9, 'Balcony quantity is not automatically assigned even with a photo');
single.proposal_media.space_photos.study = [];
let started = false;
await assert.rejects(completeProposalImages({getProject: () => single, generate: async () => { started = true; }, save}), /10 個空間/);
assert.equal(started, false, 'Scope is checked before a billable generation');
console.log('PASS single proposal 10-space limit, 36 zero-photo references, balcony exemption');
