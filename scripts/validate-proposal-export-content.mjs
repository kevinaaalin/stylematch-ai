import assert from 'node:assert/strict';
import { proposalExportPages } from '../src/lib/proposalExportContent.js';
import { captureProposalPdf } from '../src/lib/proposalPdf.js';
const document = { schema_version: 'proposal-document-v1', version_id: 'v1', created_at: '2026-09-26', proposal: { title: '測試', concept: { narrative: '長'.repeat(3000) }, facts: [], analysis: {} }, delivery: { adopted: [{ image_url: '/a.png', revision_id: 'r1' }] } };
const before = JSON.stringify(document);
const pages = proposalExportPages(document);
assert.equal(JSON.stringify(document), before);
assert.ok(pages.every(page => page.lines.length <= 16));
assert.ok(pages.filter(page => !page.image).every(page => page.lines.every(line => Array.from(line).length <= 38)));
assert.equal(pages.at(-1).image, '/a.png');
assert.match(pages.at(-1).lines[1], /未記錄圖片來源類型/);
const concept = structuredClone(document);
concept.delivery.adopted[0].provenance = 'no_photo_concept';
assert.match(proposalExportPages(concept).at(-1).lines[1], /無原照概念圖/);
concept.delivery.adopted[0].provenance = 'source_photo_derived';
assert.match(proposalExportPages(concept).at(-1).lines[1], /原照衍生設計圖/);
assert.throws(() => proposalExportPages({}));
assert.throws(() => proposalExportPages({ ...document, delivery: { adopted: [{}] } }));
await assert.rejects(captureProposalPdf(null, {}), /PROPOSAL_IMAGES_NOT_READY/);
for (const state of ['pending', 'error']) {
  await assert.rejects(captureProposalPdf({ querySelector: () => ({ state }) }, {}), /PROPOSAL_IMAGES_NOT_READY/);
}
console.log('PASS export shared pages, long text, immutability and missing-source guards');
