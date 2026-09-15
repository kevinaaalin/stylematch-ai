import assert from "node:assert/strict";
import { projectFloorPlans } from "../src/lib/projectFloorPlans.js";

assert.deepEqual(projectFloorPlans(null), []);
assert.deepEqual(projectFloorPlans({ space_photos: { floor_plan: "invalid" } }), []);
const project = {
  floor_plan_url: "/plan.png",
  proposal_media: { space_photos: { floor_plan: ["/plan.png", "https://example.com/second.png", "javascript:alert(1)", null] } },
};
const before = JSON.stringify(project);
assert.deepEqual(projectFloorPlans(project), ["/plan.png", "https://example.com/second.png"]);
assert.equal(JSON.stringify(project), before);
assert.deepEqual(projectFloorPlans({ space_photos: { floor_plan: ["./local.png"] } }), ["./local.png"]);
assert.deepEqual(projectFloorPlans({ floor_plan_url: "//untrusted.example/image.png" }), []);
console.log("Project floor plan source tests passed.");
