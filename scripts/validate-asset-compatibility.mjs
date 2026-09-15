import assert from "node:assert/strict";
import { ASSET_TYPES, acceptsAsset, assetType } from "../src/lib/assetCompatibility.js";
for (const type of ASSET_TYPES) {
  assert.equal(acceptsAsset("AIGenerate", { asset_type: type }), ["image", "sketch"].includes(type));
  assert.equal(acceptsAsset("FloorPlanVisualizer", { asset_type: type }), type === "floor_plan");
}
assert.equal(acceptsAsset("ReferenceCanvas", { asset_type: "panorama", image_url: "/a.png" }), false);
assert.equal(acceptsAsset("AIGenerate", { asset_type: "image", status: "archived" }), false);
assert.equal(assetType({ image_role: "floorplan_birdseye", image_url: "/a.png" }), "image");
assert.equal(assetType({ image_role: "ai_panorama", image_url: "/a.png" }), "panorama");
assert.equal(assetType({ asset_type: "invalid", image_url: "/a.png" }), null);
console.log("Nine asset types, archived inputs, legacy roles and explicit type priority passed.");
