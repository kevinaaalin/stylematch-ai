import assert from "node:assert/strict";
import { analyzeStyleFeatures } from "../src/lib/imageStyleFallback.js";

const brightNeutral = analyzeStyleFeatures({ brightness: 0.88, saturation: 0.08, warmth: 0.55, edgeDensity: 0.08 });
assert.equal(brightNeutral.candidates.length, 3);
assert.ok(brightNeutral.confidence <= 35);
assert.ok(["minimalist", "cream", "scandinavian", "wabi_sabi", "japanese"].includes(brightNeutral.candidates[0].id));

const darkStructured = analyzeStyleFeatures({ brightness: 0.22, saturation: 0.18, warmth: 0.45, edgeDensity: 0.42 });
assert.ok(darkStructured.candidates.some(({ id }) => id === "industrial"));
assert.equal(darkStructured.candidates.every(({ percentage }) => percentage > 0), true);

console.log("offline image style fallback validated with confidence cap 35%");
