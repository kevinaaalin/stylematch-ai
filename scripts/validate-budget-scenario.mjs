import assert from "node:assert/strict";
import { calculateBudgetScenario } from "../src/lib/budgetScenario.js";
const row = { space: "客廳", category: "地坪", label: "鋪設", quantity: 2, unit_price: 100 };
assert.equal(calculateBudgetScenario([row]).total_cents, 20000);
assert.equal(calculateBudgetScenario([{ ...row, quantity: 1.125, unit_price: 10.5 }]).total_cents, 1181);
assert.equal(calculateBudgetScenario([row, { ...row, space: "廚房", quantity: 3, unit_price: 150 }]).total_cents, 65000);
for (const invalid of [{ ...row, quantity: -1 }, { ...row, unit_price: "" }, { ...row, quantity: 0.0001 }, { ...row, unit_price: 1.111 }, { ...row, space: "" }]) assert.throws(() => calculateBudgetScenario([invalid]));
console.log("Budget: three deterministic fixtures and invalid inputs passed.");
