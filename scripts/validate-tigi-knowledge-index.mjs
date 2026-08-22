import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(appRoot, "public");
const index = JSON.parse(await readFile(path.join(publicRoot, "tigi-corpus", "knowledge-index.json"), "utf8"));
const expectedOrder = ["engineering-master", "sbir-master", "business-plan-master", "white-paper-master"];

assert.equal(index.version, "9.2");
assert.equal(index.activeBaseline, true);
assert.equal(index.ragActiveVersion, "R9.2");
assert.deepEqual(index.archivedPredecessors, ["R8", "R9", "R9.1"]);
assert.equal(index.releaseId, "TIGI-GOVERNANCE-20260820-R9.2-CONSOLIDATED");
assert.equal(index.releaseStatus, "Approved Specification Baseline / Candidate Supplemental Knowledge");
assert.equal(index.phase0RepositoryAuditRequired, true);
assert.equal(index.finalOfficialAllowed, false);
assert.equal(index.stateContractVersion, "20260722_R5_2");
assert.equal(index.patentVersion, "V7_LOCKED");
assert.deepEqual(index.canonicalReadingOrder, expectedOrder);
assert.equal(index.documentCount, 5);
assert.equal(index.documentCount, index.documents.length);
assert.equal(index.chunkCount, index.chunks.length);
assert.ok(index.chunkCount >= 150);
assert.ok(index.documents.every((document) => document.path.includes("R9_2_Consolidated")));
assert.ok(index.documents.every((document) => !/R9_1|R9_Patent|R8_/i.test(document.path)));
assert.equal(index.documents.filter((document) => document.baselineStatus === "active" && document.releaseVersion === "R9.2").length, 4);
assert.equal(index.documents.filter((document) => document.baselineStatus === "candidate-addendum" && document.releaseVersion === "R9.2.1-candidate").length, 1);
assert.ok(index.documents.every((document) => /^[a-f0-9]{64}$/.test(document.sourceSha256)));
assert.ok(index.chunks.every((chunk) => (chunk.baselineStatus === "active" && chunk.releaseVersion === "R9.2") || (chunk.baselineStatus === "candidate-addendum" && chunk.releaseVersion === "R9.2.1-candidate")));
assert.ok(index.chunks.every((chunk) => /^[a-f0-9]{64}$/.test(chunk.sourceSha256)));

for (const document of index.documents) await access(path.join(publicRoot, decodeURIComponent(document.sourceUrl)));
for (const query of ["StructuredSpace Auto Layout", "Visual Editing External Design Tool", "Multi-view 360 Material Product", "R5.2 Patent V7 Phase 0"]) {
  const terms = query.split(/\s+/);
  const hits = index.chunks.filter((chunk) => terms.some((term) => `${chunk.title} ${chunk.heading} ${chunk.text}`.toLowerCase().includes(term.toLowerCase())));
  assert.ok(hits.length > 0, `No R9.2 knowledge hit for: ${query}`);
}
for (const query of ["External Evidence Provider", "Evidence Mapping Engine", "智慧監工", "Project Execution Management"]) {
  const terms = query.split(/\s+/);
  const hits = index.chunks.filter((chunk) => terms.some((term) => `${chunk.title} ${chunk.heading} ${chunk.text}`.toLowerCase().includes(term.toLowerCase())));
  assert.ok(hits.some((chunk) => chunk.baselineStatus === "candidate-addendum"), `No candidate addendum hit for: ${query}`);
}console.log(`TIGI R9.2 knowledge validated: ${index.documentCount} documents, ${index.chunkCount} chunks`);
