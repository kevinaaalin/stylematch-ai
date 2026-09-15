import assert from "node:assert/strict";
import { assertSpacePhotoCount, projectSpacePhotos, sourcePhotoResults, assertPhotoResultSource } from "../src/lib/spacePhotoContract.js";
for (const room of ["living_room", "dining_room", "study_room", "kitchen"]) {
  assert.doesNotThrow(() => assertSpacePhotoCount(room, 4));
  assert.throws(() => assertSpacePhotoCount(room, 5), /最多/);
}
assert.doesNotThrow(() => assertSpacePhotoCount("floor_plan", 5));
const project = { proposal_media: { space_photos: { study_room: ["/one.png", "/two.png"], living_room: ["/other.png"] } }, reference_revisions: [
  { revision_id: "r1", source_photo_room: "study_room", source_image_url: "/one.png", source_task_id: "task1", image_url: "/result.png" },
] };
const photos = projectSpacePhotos(project, ["study_room"]);
assert.equal(photos.length, 2);
assert.equal(sourcePhotoResults(project, photos[0]).length, 1);
assert.equal(sourcePhotoResults(project, photos[1]).length, 0);
assert.throws(() => assertPhotoResultSource(project, { source_photo_room: "living_room", source_image_url: "/one.png" }));
assert.doesNotThrow(() => assertPhotoResultSource(project, { source_photo_room: "study_room", source_image_url: "/one.png" }));
console.log("PASS: per-space maximum four, separate plans, one-photo result lineage and wrong-room rejection.");
