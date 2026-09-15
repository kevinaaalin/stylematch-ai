import assert from "node:assert/strict";
import { imageTaskBelongsToProject } from "../src/lib/imageTaskOwnership.js";
assert.equal(imageTaskBelongsToProject({ stylematch_project_id: "p" }, { project_id: "p" }), true);
assert.equal(imageTaskBelongsToProject({ stylematch_project_id: "other" }, { project_id: "p" }), false);
assert.equal(imageTaskBelongsToProject({}, { project_id: "p" }), false);
assert.equal(imageTaskBelongsToProject(null, null), false);
assert.equal(imageTaskBelongsToProject({ stylematch_project_id: "canonical" }, { project_id: "p", stylematch_project_id: "canonical" }), true);
console.log("Image task project ownership checks passed.");
