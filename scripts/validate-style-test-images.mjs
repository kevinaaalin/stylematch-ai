import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { STYLE_KEYS } from "../src/data/styleCatalog.js";
import { styleTestImages, STYLE_TEST_IMAGE_MANIFEST_VERSION } from "../src/data/styleTestImageManifest.js";

if (styleTestImages.length !== STYLE_KEYS.length) throw new Error("Style test manifest must contain exactly one question per canonical style");
const ids = styleTestImages.flatMap((item) => item.styles);
if (new Set(ids).size !== STYLE_KEYS.length || STYLE_KEYS.some((id) => !ids.includes(id))) throw new Error("Style test manifest does not cover all canonical styles");
for (const item of styleTestImages) {
  if (item.src.startsWith("/")) throw new Error(`Style-test image must use an app-relative URL for GitHub Pages: ${item.id}`);
  const decoded = decodeURIComponent(item.src).replace(/^\//, "");
  if (!existsSync(resolve("public", decoded))) throw new Error(`Missing style-test image: ${item.src}`);
  if (!item.source || !item.primary_style) throw new Error(`Missing provenance: ${item.id}`);
  if (!Array.isArray(item.variants) || item.variants.length === 0) throw new Error(`Missing local image variants: ${item.id}`);
  for (const variant of item.variants) {
    const variantPath = decodeURIComponent(variant).replace(/^\//, "");
    if (!existsSync(resolve("public", variantPath))) throw new Error(`Missing style-test variant: ${variant}`);
  }
  if (item.source !== "synthetic_comfyui") throw new Error(`Non-synthetic image is not allowed in the current style test: ${item.id}`);
  if (item.src.includes("/twcid/")) throw new Error(`TWCID image must not enter the current style test: ${item.id}`);
  if (!item.source_library) throw new Error(`Missing source library provenance: ${item.id}`);
}
const primaryItems = styleTestImages.filter((item) => item.source_library === "comfyui-taiwan-25");
if (primaryItems.length !== 23) throw new Error(`Taiwan-25 must be primary for 23 canonical styles; received ${primaryItems.length}`);
const requiredAliases = {
  european_classic: "french",
  industrial: "loft",
  futurism: "avant_garde",
  south_french_mediterranean: "mediterranean",
};
for (const [styleId, alias] of Object.entries(requiredAliases)) {
  const item = styleTestImages.find((candidate) => candidate.primary_style === styleId);
  if (!item?.source_categories.includes(alias)) throw new Error(`Missing approved Taiwan-25 mapping: ${alias} -> ${styleId}`);
}
const styleTestSource = readFileSync(resolve("src/pages/StyleTest.jsx"), "utf8");
if (!styleTestSource.includes("createStyleTestQuestionSet(styleImages)")) throw new Error("Style test must sample and shuffle the local image library");
if (!styleTestSource.includes("grid-cols-5")) throw new Error("Expanded style test must provide five-star rating controls");
if (!styleTestSource.includes("五星評分方式")) throw new Error("Style test must explain the five-star rating scale");
if (!styleTestSource.includes('"quick_30"')) throw new Error("Quick style test mode must be versioned as quick_30");
if (styleTestSource.includes('"quick_15"')) throw new Error("Legacy quick_15 mode must not remain in the active test flow");
console.log(`style test image manifest validated: ${styleTestImages.length} local images (${STYLE_TEST_IMAGE_MANIFEST_VERSION})`);
