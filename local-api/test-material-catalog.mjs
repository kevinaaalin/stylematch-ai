import assert from "node:assert/strict";
import test from "node:test";
import { mapBudget, searchCatalog } from "./material-catalog.mjs";
test("MPI-01 results carry source, timestamp and non-live price state", () => { const item = searchCatalog({ style_tag: "japandi" })[0]; assert.ok(item.source && item.price_timestamp); assert.equal(item.price_state, "estimated"); });
test("MPI-01 budget mapping creates an immutable-style snapshot", () => { const result = mapBudget([{ catalog_id: "mat-oak-natural", quantity: 10 }], 50000); assert.equal(result.estimated_total, 32000); assert.equal(result.snapshot, true); assert.equal(result.within_budget, true); });
