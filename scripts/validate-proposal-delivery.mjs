import assert from "node:assert/strict";
import { chunks, proposalDeliveryContent } from "../src/lib/proposalDeliveryContent.js";
import { compactProjectMedia } from "../src/lib/proposalMedia.js";
import { buildProposal, buildSampleProject } from "../src/lib/proposalBuilder.js";
const sample = buildSampleProject();
const originalProposal = buildProposal({ ...sample, proposal_media: { space_photos: { living_room: ['/original.png'] } } });
assert.equal(originalProposal.spaces[0].source, 'uploaded_space_photo');
const confirmedProposal = buildProposal({ ...sample, active_confirmed_reference_set_id: 'confirmed', confirmed_reference_sets: [{ confirmed_reference_set_id: 'confirmed', images: [{ space: 'living_room', image_url: '/generated.png' }] }] });
assert.equal(confirmedProposal.spaces[0].source, 'confirmed_reference_set');
const project = { project_id: "one", proposal_generation: { confirmed_reference_set_id: "old" }, active_confirmed_reference_set_id: "new",
  confirmed_reference_sets: [{ confirmed_reference_set_id: "old", project_id: "one", revision_ids: ["r1"], images: [{ revision_id: "r1", image_url: "/old.png" }] }],
  reference_revisions: [{ revision_id: "r1", image_url: "/old.png", provenance: 'no_photo_concept', geometry_verified: false }],
};
const before = JSON.stringify(project);
assert.equal(proposalDeliveryContent(project).adopted[0].image_url, "/old.png");
assert.equal(proposalDeliveryContent(project).adopted[0].provenance, 'no_photo_concept');
assert.equal(proposalDeliveryContent(project).adopted[0].geometry_verified, false);
assert.equal(JSON.stringify(project), before);
assert.equal(proposalDeliveryContent({ ...project, project_id: "other" }).adopted.length, 0);
assert.equal(proposalDeliveryContent({ ...project, reference_revisions: [] }).adopted.length, 0);
assert.equal(proposalDeliveryContent({ ...project, proposal_generation: null }).adopted.length, 0);
const images = Array.from({ length: 13 }, (_, n) => String(n));
assert.deepEqual(chunks(images).flat(), images);
assert.deepEqual(chunks([]), []);
const media = compactProjectMedia({ space_photos: { living_room: Array(7).fill("/room.png") }, reference_photos: Array(6).fill("/ref.png") });
assert.deepEqual(compactProjectMedia(media), media);
assert.equal(media.proposal_media.space_photos.living_room.length, 7);
assert.equal(media.proposal_media.reference_photos.length, 6);
assert.equal(compactProjectMedia({ ...media, reference_photos: [] }).proposal_media.reference_photos.length, 0);
assert.equal(compactProjectMedia({ reference_photos: ["javascript:alert(1)", "/safe.png"] }).proposal_media.reference_photos.length, 1);
assert.ok(proposalDeliveryContent({}).pending.length >= 4);
console.log("PASS: proposal source binding, project isolation, missing lineage, complete pagination, immutable data.");
