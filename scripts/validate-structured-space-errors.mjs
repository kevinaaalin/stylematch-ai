import assert from 'node:assert/strict';

// Public deployments must reject through promises without sending local identity.
globalThis.location = { origin: 'https://kevinaaalin.github.io' };
let requests = 0;
globalThis.fetch = async () => { requests++; throw new Error('unexpected network request'); };
const api = await import('../src/lib/structuredSpaceApi.js');
for (const [name, call] of Object.entries(api)) {
  if (name === 'getPlatformCapabilities') continue;
  let result;
  assert.doesNotThrow(() => { result = call('test-project', {}); }, name);
  assert.ok(result instanceof Promise, name);
  await assert.rejects(result, /阻擋開發身分/, name);
}
assert.equal(requests, 0);
console.log('PASS: all authenticated structured-space API calls reject asynchronously; no public development credentials transmitted.');
