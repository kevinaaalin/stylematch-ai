import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fetchTaskImage } from '../src/lib/aiTaskImage.js';
const result = JSON.parse(await readFile('analysis_output/stylemix-live-qa/result.json', 'utf8'));
const url = result.revision.original_image_url;
const image = await fetchTaskImage(url);
assert.ok(image.size > 1000);
const noContext = await fetch(url);
assert.equal(noContext.status, 400);
const wrongTenant = await fetch(url, { headers: {
  'X-Tenant-Id': 'qa_wrong_tenant', 'X-Organization-Id': 'org_local_headquarter',
  'X-Purpose': 'negative_qa', 'X-Consent-Ref': 'qa', 'X-Trace-Id': 'qa-image-read',
  'X-Case-Role': 'designer', 'X-Server-Role': 'headquarter', 'X-Case-Authorization': '*',
} });
assert.ok([403, 404].includes(wrongTenant.status), `foreign tenant HTTP ${wrongTenant.status}`);
console.log('PASS live image: authorized read; missing context and foreign tenant rejected');
