import assert from "node:assert/strict";
import test from "node:test";
import { generateAutoLayoutCandidates } from "./auto-layout-candidates.mjs";

test("generates three deterministic and ranked AL-01 candidates", () => {
  const space = { rooms: [{ id: "room-1", polygon: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]] }] };
  const placements = [{ id: "sofa", room_id: "room-1", width: 1800, depth: 900, rotation: 0 }];
  const validate = (_space, items) => ({ valid: true, hard_violations: [], warnings: [], score: 100 - items[0].x / 1000 });
  const context = { style_dna: { primary_style: "warm_minimal" }, family_profile: { accessibility_required: true }, budget: { total: 100000 }, must_have: ["seating"], avoid: ["oversized"] };
  placements[0].category = "seating";
  placements[0].style_tags = ["warm_minimal"];
  placements[0].estimated_cost = 30000;
  const first = generateAutoLayoutCandidates(space, placements, validate, context);
  const second = generateAutoLayoutCandidates(space, placements, validate, context);
  assert.equal(first.length, 3);
  assert.deepEqual(first, second);
  assert.deepEqual(first.map((item) => item.rank), [1, 2, 3]);
  assert.ok(first.every((item) => item.rationale && item.placements.length === 1));
  assert.ok(first.every((item) => item.score_components.style === 100 && item.score_components.budget === 100));
  assert.ok(first.every((item) => item.preference.missing_must_have.length === 0 && item.preference.present_avoid.length === 0));
  assert.equal(first[0].candidate_id, "circulation_first");
});
