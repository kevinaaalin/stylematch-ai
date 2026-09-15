import assert from "node:assert/strict";
import { imageResultTransaction } from "../src/lib/imageResultTransaction.js";
const database = { projects: [{ project_id: "p", reference_revisions: [] }], point_balance: 20, point_ledger: [] };
const data = { image_url: "/generated.png", source_task_id: "task", task_status: "completed" };
const payment = { idempotencyKey: "one", type: "image", cost: 5 };
const ids = { revisionId: "r", transactionId: "t", at: "2026-09-14T00:00:00Z" };
const before = JSON.stringify(database);
const first = imageResultTransaction(database, "p", data, payment, ids);
assert.equal(first.balance, 15);
assert.equal(first.database.projects[0].reference_revisions.length, 1);
assert.equal(first.transaction.revision_id, first.revision.revision_id);
assert.equal(JSON.stringify(database), before);
const retry = imageResultTransaction(first.database, "p", data, payment, ids);
assert.equal(retry.reused, true);
assert.equal(retry.balance, 15);
for (const invalid of [{ ...data, task_status: "failed" }, { ...data, image_url: "" }, { ...data, fallback_reason: "offline" }]) {
  assert.throws(() => imageResultTransaction(database, "p", invalid, payment, ids));
}
assert.throws(() => imageResultTransaction(first.database, "p", { ...data, image_url: "/other.png" }, payment, ids));
assert.throws(() => imageResultTransaction(database, "p", data, { ...payment, cost: 21 }, ids));
assert.throws(() => imageResultTransaction(database, "missing", data, payment, ids));
assert.equal(JSON.stringify(database), before);
console.log("Image result transaction: save/debit, retry, conflict, failure and insufficient points passed.");
