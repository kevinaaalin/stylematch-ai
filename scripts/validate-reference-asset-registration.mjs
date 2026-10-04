import assert from 'node:assert/strict';
import { registerReferenceAsset, selectApprovedReferenceAssets } from '../src/lib/referenceAssetRegistration.js';
const revision = { project_id: 'p', revision_id: 'r', image_url: '/image.png', space: 'living', version: 1, stylemix: { target: 'interior' } };
const assets = [];
let writes = 0;
const api = {
  listApprovedAssets: async () => ({ assets }),
  createApprovedAsset: async (_id, payload) => { writes++; const asset = { ...payload, asset_id: 'a', revision: 1, status: 'candidate' }; assets.push(asset); return asset; },
};
const first = await registerReferenceAsset('p', revision, api);
assert.equal(first.status, 'candidate');
assert.deepEqual(first.metadata.stylemix, revision.stylemix);
assert.equal((await registerReferenceAsset('p', revision, api)).asset_id, 'a');
assert.equal(writes, 1);
const set = { images: [{ revision_id: 'r', image_url: '/image.png' }] };
assert.throws(() => selectApprovedReferenceAssets('p', set, assets));
const approved = { ...first, status: 'approved', stylematch_project_id: 'p' };
assert.equal(selectApprovedReferenceAssets('p', set, [approved])[0].asset_id, 'a');
assert.throws(() => selectApprovedReferenceAssets('p', set, [approved, { ...approved, asset_id: 'duplicate' }]));
assert.throws(() => selectApprovedReferenceAssets('p', { images: [...set.images, ...set.images] }, [approved]));
assert.throws(() => selectApprovedReferenceAssets('p', { images: [{ image_url: '/image.png' }] }, [approved]));
assert.throws(() => selectApprovedReferenceAssets('p', set, null));
const selected = selectApprovedReferenceAssets('p', set, [approved]);
selected[0].metadata.local_revision_id = 'mutated';
assert.equal(approved.metadata.local_revision_id, 'r');
assert.throws(() => selectApprovedReferenceAssets('other', set, [approved]));
assert.throws(() => selectApprovedReferenceAssets('p', set, [{ ...approved, status: 'superseded' }]));
assert.throws(() => selectApprovedReferenceAssets('p', set, [{ ...approved, local_ref: '/wrong.png' }]));
await assert.rejects(registerReferenceAsset('other', revision, api));
await assert.rejects(registerReferenceAsset('p', { ...revision, fallback_reason: 'mock' }, api));
await assert.rejects(registerReferenceAsset('p', { ...revision, image_url: '/changed.png' }, api));
assert.equal(writes, 1);
console.log('PASS registration, sequential retry, provenance, project isolation and source mismatch');
