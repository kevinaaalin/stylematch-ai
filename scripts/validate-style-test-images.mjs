import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { STYLE_KEYS } from "../src/data/styleCatalog.js";
import { styleTestImages, STYLE_TEST_IMAGE_MANIFEST_VERSION } from "../src/data/styleTestImageManifest.js";

if (styleTestImages.length !== STYLE_KEYS.length) throw new Error("Style test manifest must contain exactly one question per canonical style");
const ids = styleTestImages.flatMap((item) => item.styles);
if (new Set(ids).size !== STYLE_KEYS.length || STYLE_KEYS.some((id) => !ids.includes(id))) throw new Error("Style test manifest does not cover all canonical styles");
for (const item of styleTestImages) {
  const decoded = decodeURIComponent(item.src).replace(/^\//, "");
  if (!existsSync(resolve("public", decoded))) throw new Error(`Missing style-test image: ${item.src}`);
  if (!item.source || !item.primary_style) throw new Error(`Missing provenance: ${item.id}`);
  if (item.source !== "synthetic_comfyui") throw new Error(`Non-synthetic image is not allowed in the current style test: ${item.id}`);
  if (item.src.includes("/twcid/")) throw new Error(`TWCID image must not enter the current style test: ${item.id}`);
}
console.log(`style test image manifest validated: ${styleTestImages.length} local images (${STYLE_TEST_IMAGE_MANIFEST_VERSION})`);
