import assert from 'node:assert/strict';
import { verifyIdentity } from './verify-local-runtime.mjs';

const expected = { source: 'current', storage: 'canonical' };
const valid = { schema_version: 'StyleMatch.DirectionCompletion/1.1', source_sha256: 'current', storage_fingerprint: 'canonical', review_required: true };
assert.doesNotThrow(() => verifyIdentity(valid, expected));
for (const [key, value] of Object.entries({ schema_version: 'old', source_sha256: 'stale', storage_fingerprint: 'duplicate', review_required: false })) {
  assert.throws(() => verifyIdentity({ ...valid, [key]: value }, expected));
}
assert.throws(() => verifyIdentity({}, expected));
console.log('PASS: runtime identity acceptance and five rejection cases.');
