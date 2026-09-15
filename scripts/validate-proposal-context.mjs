import assert from "node:assert/strict";
import { proposalContextIssues } from "../src/lib/proposalContext.js";
const project = { project_name: "Test", square_footage: 25, room_layout: "客廳", budget_range: "100-200萬", primary_style: "modern", reference_revisions: [{ revision_id: "r" }] };
const confirmed = { revision_ids: ["r"], images: [{ image_url: "/r.png" }] };
assert.deepEqual(proposalContextIssues(project, confirmed), []);
assert.ok(proposalContextIssues({}, null).length >= 5);
assert.ok(proposalContextIssues({ ...project, square_footage: -1 }, confirmed).includes("有效室內坪數"));
assert.ok(proposalContextIssues(project, { ...confirmed, revision_ids: ["foreign"] }).includes("同專案圖片來源"));
console.log("Proposal context: complete, missing, invalid area and foreign source passed.");
