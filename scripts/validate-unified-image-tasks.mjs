import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [client, canvas, floorplan, contact, store] = await Promise.all([
  read("../src/lib/aiImageTasks.js"),
  read("../src/pages/ReferenceCanvas.jsx"),
  read("../src/pages/FloorPlanVisualizer.jsx"),
  read("../src/components/styletest/ContactForm.jsx"),
  read("../src/lib/localStore.js"),
]);

for (const outputType of [
  "reference_image_revision",
  "floorplan_birdseye",
  "floorplan_region_redraw",
  "floorplan_room_view",
  "style_test_reference",
]) {
  assert.match(`${canvas}\n${floorplan}\n${contact}`, new RegExp(`outputType:\\s*["']${outputType}["']`));
}
for (const header of ["X-Server-Role", "X-Case-Role", "X-Case-Authorization"]) {
  assert.match(client, new RegExp(header));
}
assert.match(client, /\/ai\/image-tasks/);
assert.match(canvas, /local_sdk_fallback/);
assert.match(floorplan, /local_sdk_fallback/);
assert.match(store, /authoritative:\s*data\.authoritative === true/);
assert.match(store, /workflow_version:\s*data\.workflow_version/);

console.log("Unified AI image task contract: PASS");
