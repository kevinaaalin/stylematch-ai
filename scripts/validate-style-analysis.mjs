import assert from "node:assert/strict";
import { normalizeDistribution } from "../src/lib/analysisSchema.js";
import { StyleAnalysisEngine } from "../src/lib/styleAnalysisEngine.js";
import { buildProposal } from "../src/lib/proposalBuilder.js";

const migrated = normalizeDistribution({ classic: 6, japandi: 3, modern: 1 });
assert.equal(migrated.length, 30);
assert.equal(migrated.reduce((sum, item) => sum + item.percentage, 0), 100);
assert.equal(migrated[0].key, "european_classic");
assert.equal(migrated.find(({ key }) => key === "japanese")?.percentage, 30);

const chill = StyleAnalysisEngine.analyze({ project: { preferred_style: "輕鬆咖啡風" } });
assert.equal(chill.primary_style, "chill");
assert.equal(chill.primary_style_label, "Chill 輕鬆風");
assert.equal(chill.distribution.length, 30);

const hotel = StyleAnalysisEngine.analyze({ project: { preferred_style: "酒店式公寓風", atmosphere_description: "精品飯店與層次照明" } });
assert.equal(hotel.primary_style, "boutique_hotel");
assert.equal(hotel.primary_style_label, "飯店精品風");

const proposal = buildProposal({
  project_id: "acceptance-p1",
  preferred_style: "Chill 輕鬆風",
  atmosphere_description: "自在、慵懶且適合輕社交",
  room_layout: "2房2廳",
  proposal_media: { reference_photos: [], space_photos: {} },
});
assert.equal(proposal.styleProfile.name, "Chill 輕鬆風");
assert.match(proposal.concept.title, /Chill 輕鬆風/);
assert.match(proposal.concept.narrative, /木材/);
assert.equal(proposal.designOptions.length, 3);
assert.equal(proposal.designOptions.filter(({ recommended }) => recommended).length, 1);
assert.deepEqual(proposal.toneManner.palette, proposal.styleProfile.palette);
assert.equal(proposal.materials.length, 5);

console.log("30-style analysis migration and proposal integration validated");
