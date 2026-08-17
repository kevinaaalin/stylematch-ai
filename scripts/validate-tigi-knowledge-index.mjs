import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(appRoot, "public");
const index = JSON.parse(await readFile(path.join(publicRoot, "tigi-corpus", "knowledge-index.json"), "utf8"));
const expectedOrder = ["foundation", "brs", "sad", "tgs", "sdd", "dds", "openapi", "implementation-spec", "platform-spec", "pep"];

assert.equal(index.version, "5.0");
assert.equal(index.networkDependency, false);
assert.deepEqual(index.canonicalReadingOrder, expectedOrder);
assert.equal(index.documentCount, index.documents.length);
assert.equal(index.chunkCount, index.chunks.length);
assert.ok(index.documentCount >= 80);
assert.ok(index.chunkCount >= 1000);

let previousOrder = -1;
for (const document of index.documents) {
  assert.ok(document.canonicalOrder >= previousOrder, `Canonical order regressed at ${document.path}`);
  previousOrder = document.canonicalOrder;
  const sourcePath = path.join(publicRoot, decodeURIComponent(document.sourceUrl));
  await access(sourcePath);
}

for (const query of ["預算 材料 驗收", "設計 提案 交付 治理", "供應商 評選 風險"]) {
  const terms = query.split(/\s+/);
  const hits = index.chunks.filter((chunk) => terms.some((term) => `${chunk.title} ${chunk.heading} ${chunk.text}`.includes(term)));
  assert.ok(hits.length > 0, `No local knowledge hit for: ${query}`);
  assert.ok(hits.some((hit) => hit.sourceUrl && hit.path), `Missing source link for: ${query}`);
}

console.log(`canonical TIGI knowledge validated: ${index.documentCount} documents, ${index.chunkCount} chunks, local sources present`);
