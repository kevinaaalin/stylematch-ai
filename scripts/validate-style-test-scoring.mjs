import assert from "node:assert/strict";
import { scoreStyleRatings } from "../src/lib/styleTestScoring.js";

const ratings = [
  { styles: ["modern"], rating: 5 },
  { styles: ["modern"], rating: 4 },
  { styles: ["industrial"], rating: 5 },
  { styles: ["industrial"], rating: 3 },
  { styles: ["scandinavian"], rating: 4 },
];
const result = scoreStyleRatings(ratings, ["modern", "industrial", "scandinavian"]);

assert.equal(result.scores.modern, 9);
assert.equal(result.scores.industrial, 8);
assert.equal(result.scores.scandinavian, 4);
assert.equal(result.primary_style, "modern");
assert.equal(result.secondary_style, "industrial");
assert.deepEqual(result.ranked_style_ids, ["modern", "industrial", "scandinavian"]);
assert.equal(result.details.modern.average, 4.5);
console.log("direct five-star sum scoring: PASS");
