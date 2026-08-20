import assert from "node:assert/strict";
import test from "node:test";
import { validateViewSet } from "./viewset-consistency.mjs";

test("MVC-01 reports only drifting views for selective retry", () => {
  const result = validateViewSet({ anchor_state: { object_ids: ["sofa"], material_ids: ["oak"], structured_space_ref: "space-1" }, views: [
    { view_id: "north", object_ids: ["sofa"], material_ids: ["oak"], structured_space_ref: "space-1", camera_ref: { fov: 60 } },
    { view_id: "east", object_ids: [], material_ids: ["oak"], structured_space_ref: "space-1", camera_ref: { fov: 60 } },
  ] });
  assert.equal(result.valid, false);
  assert.deepEqual(result.regeneration_refs, ["east"]);
  assert.equal(result.view_reports[0].score, 100);
});
