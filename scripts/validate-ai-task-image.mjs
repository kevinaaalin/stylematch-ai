import assert from 'node:assert/strict';
import { taskImageUrl, fetchTaskImage } from '../src/lib/aiTaskImage.js';
const url = 'http://127.0.0.1:4180/api/v1/ai/image-tasks/test/image';
assert.equal(taskImageUrl(url), url);
assert.throws(() => taskImageUrl('https://example.com/api/v1/ai/image-tasks/test/image'));
assert.throws(() => taskImageUrl('http://127.0.0.1:4180/api/v1/health'));
const original = globalThis.fetch;
try {
  globalThis.fetch = async (actual, options) => {
    assert.equal(actual, url);
    assert.equal(options.headers['X-Case-Authorization'], 'QA');
    assert.ok(options.headers['X-Tenant-Id']);
    return new Response(new Blob(['png'], { type: 'image/png' }));
  };
  assert.equal((await fetchTaskImage(url, 'QA')).type, 'image/png');
  globalThis.fetch = async () => new Response('{}', { status: 403 });
  await assert.rejects(fetchTaskImage(url), /403/);
  globalThis.fetch = async () => new Response('{}', { headers: { 'content-type': 'application/json' } });
  await assert.rejects(fetchTaskImage(url), /格式/);
} finally { globalThis.fetch = original; }
console.log('PASS task image origin, context, denied access and invalid MIME');
