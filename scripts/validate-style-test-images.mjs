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
  if (item.source !== "synthetic_comfyui") throw new Error(`Non-synthetic image is not allowed in the current style test: ${item.id}`);
  if (item.src.includes("/twcid/")) throw new Error(`TWCID image must not enter the current style test: ${item.id}`);
}
const styleTestSource = readFileSync(resolve("src/pages/StyleTest.jsx"), "utf8");
if (!styleTestSource.includes("styleImages.slice(0, 30)")) throw new Error("Quick style test must contain all 30 images");
if (!styleTestSource.includes('"quick_30"')) throw new Error("Quick style test mode must be versioned as quick_30");
if (styleTestSource.includes('"quick_15"')) throw new Error("Legacy quick_15 mode must not remain in the active test flow");
console.log(`style test image manifest validated: ${styleTestImages.length} local images (${STYLE_TEST_IMAGE_MANIFEST_VERSION})`);
