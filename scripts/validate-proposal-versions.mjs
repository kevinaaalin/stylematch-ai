import assert from "node:assert/strict";
import { appendProposalVersion, resolveProposalVersion } from "../src/lib/proposalVersions.js";
for (const budget of [100000, 1000000, 3000000]) {
  const project = { project_id: "p", budget, proposal_images: ["first.png"] };
  const first = appendProposalVersion(project, "v1", "2026-09-14");
  const serialized = JSON.stringify(first);
  const second = appendProposalVersion({ ...project, budget: budget + 1000, proposal_images: ["second.png"], proposal_versions: first }, "v2", "2026-09-15");
  assert.equal(second[0].parent_version_id, "v1");
  assert.equal(second[0].version, 2);
  assert.equal(second[1].project_snapshot.budget, budget);
  assert.deepEqual(second[1].project_snapshot.proposal_images, ["first.png"]);
  assert.equal(JSON.stringify(first), serialized);
  assert.equal(second[0].project_snapshot.proposal_versions, undefined);
  const current = { ...project, proposal_versions: second };
  assert.equal(resolveProposalVersion(current, 'v1').budget, budget);
  assert.equal(resolveProposalVersion(current, 'missing'), null);
  assert.equal(resolveProposalVersion(current), current);
  assert.throws(() => appendProposalVersion(current, 'v1', '2026-09-16'));
  assert.throws(() => appendProposalVersion(current, '', '2026-09-16'));
  assert.throws(() => appendProposalVersion(current, 'v3', 'invalid'));
  assert.equal(resolveProposalVersion({ ...current, project_id: 'foreign' }, 'v1'), null);
  assert.equal(resolveProposalVersion({ ...current, proposal_versions: [...second, second[1]] }, 'v1'), null);
}
console.log("Proposal V1/V2 immutable snapshots: 3 fixtures passed.");
