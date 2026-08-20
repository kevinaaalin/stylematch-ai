import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVisualEditOperation, VISUAL_EDITING_INTENTS, VISUAL_EDITING_SCHEMA_VERSION } from "./visual-editing.mjs";

test("publishes all ten R9 visual editing intents", () => {
  assert.deepEqual(Object.keys(VISUAL_EDITING_INTENTS), Array.from({ length: 10 }, (_, index) => `VE-${String(index + 1).padStart(2, "0")}`));
});

test("normalizes a masked furniture replacement into the canonical contract", () => {
  const operation = normalizeVisualEditOperation({
    intent_id: "VE-04",
    source_asset_id: "asset-1",
    semantic_region: "sofa",
    instruction: "Replace the sofa while preserving openings.",
    preserve_constraints: ["walls", "openings", "walls"],
  }, ["local://assets/room.png"]);
  assert.equal(operation.schema_version, VISUAL_EDITING_SCHEMA_VERSION);
  assert.equal(operation.intent, "replace_furniture");
  assert.deepEqual(operation.preserve_constraints, ["walls", "openings"]);
  assert.equal(operation.reversible, true);
});

test("requires source, region, and reference inputs where specified", () => {
  assert.throws(() => normalizeVisualEditOperation({ intent_id: "VE-01" }), { code: "VISUAL_EDIT_SOURCE_REQUIRED" });
  assert.throws(() => normalizeVisualEditOperation({ intent_id: "VE-08" }, ["local://assets/room.png"]), { code: "VISUAL_EDIT_REGION_REQUIRED" });
  assert.throws(() => normalizeVisualEditOperation({ intent_id: "VE-09" }, ["local://assets/room.png"]), { code: "VISUAL_EDIT_REFERENCE_REQUIRED" });
});

test("leaves non-VE generation metadata backward compatible", () => {
  assert.deepEqual(normalizeVisualEditOperation({ mode: "panorama" }, []), { mode: "panorama" });
});
