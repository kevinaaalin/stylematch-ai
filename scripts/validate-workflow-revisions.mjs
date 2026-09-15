import assert from "node:assert/strict";
import { imageRevisions, resolveImageRevision, revisionHandoffUrl, recentImageRevisions } from "../src/lib/workflowRevisions.js";
const project = { reference_revisions: [
  { revision_id: "one", image_url: "/one.png", image_role: "ai_revision", status: "candidate" },
  { revision_id: "pano", image_url: "/pano.png", image_role: "panorama" },
  { revision_id: "bad", image_url: "javascript:alert(1)" },
] };
const before = JSON.stringify(project);
assert.equal(imageRevisions(project).length, 1);
assert.equal(resolveImageRevision(project, "one").status, "candidate");
assert.equal(resolveImageRevision({ reference_revisions: [] }, "one"), null);
assert.equal(resolveImageRevision(project, "missing"), null);
assert.deepEqual(imageRevisions(null), []);
assert.equal(JSON.stringify(project), before);
const linked = { ...project, project_id: "case & one" };
const url = new URL(revisionHandoffUrl(linked, "one", "AIGenerate"), "http://localhost");
assert.equal(url.searchParams.get("project"), linked.project_id);
assert.equal(url.searchParams.get("revision"), "one");
assert.equal(revisionHandoffUrl(project, "one", "AIGenerate"), null);
assert.equal(revisionHandoffUrl(linked, "missing", "AIGenerate"), null);
assert.equal(revisionHandoffUrl(linked, "pano", "ReferenceCanvas"), null);
assert.equal(revisionHandoffUrl(linked, "one", "Unknown"), null);
console.log("Workflow revision tests passed.");
const other = { project_id: "second-case", reference_revisions: [{ ...project.reference_revisions[0], created_at: "2026-09-14T10:00:00Z" }] };
const recent = recentImageRevisions([linked, other, other]);
assert.equal(recent.length, 2);
assert.equal(recent[0].project.project_id, "second-case");
assert.notEqual(recent[0].key, recent[1].key);
assert.equal(recentImageRevisions([linked, other], 1).length, 1);
assert.deepEqual(recentImageRevisions([], 0), []);
