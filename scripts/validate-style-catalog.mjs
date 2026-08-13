import assert from "node:assert/strict";
import { STYLE_CATALOG, STYLE_KEYS, STYLE_LABELS, getStyleById, normalizeStyleId } from "../src/data/styleCatalog.js";
import { styleCatalogDocument } from "../src/lib/styleCatalogSchema.js";

assert.equal(styleCatalogDocument.styles.length, 30);
assert.equal(STYLE_KEYS.length, 30);
assert.equal(Object.keys(STYLE_LABELS).length, 30);
assert.equal(normalizeStyleId("輕鬆咖啡風"), "chill");
assert.equal(getStyleById("Chill風").name, "Chill 輕鬆風");
assert.equal(normalizeStyleId("酒店式公寓風"), "boutique_hotel");
assert.equal(getStyleById("精品飯店風").name, "飯店精品風");
assert.equal(new Set(STYLE_CATALOG.map(({ id }) => id)).size, 30);
assert.equal(new Set(STYLE_CATALOG.map(({ name }) => name)).size, 30);
console.log(`style catalog validated: ${STYLE_CATALOG.length} styles (${styleCatalogDocument.schema_version})`);
