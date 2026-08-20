import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createProductionAdapters } from "./production-adapters.mjs";

const ctx = { tenant_id: "tenant-a", organization_id: "org-a", user_id: "owner-a", case_role: "owner", trace_id: "trace-a" };
const db = new DatabaseSync(":memory:");
const adapters = createProductionAdapters(db, { databaseType: "sqlite", smtpConfigured: false });

test("TWCID ranks candidates and emits immutable confirmation receipt", () => {
  const match = adapters.createMatch("SM-001", { region: "台北", budget_twd: 5000000, primary_style: "現代", secondary_style: "北歐", specialties: ["老屋翻新"] }, ctx);
  assert.equal(match.candidates[0].member_id, "TWCID-TPE-001");
  const confirmed = adapters.confirmMatch(match.match_request_id, { member_id: match.candidates[0].member_id }, ctx);
  assert.equal(confirmed.status, "confirmed"); assert.match(confirmed.receipt.checksum, /^[a-f0-9]{64}$/);
  const replay = adapters.confirmMatch(match.match_request_id, { member_id: match.candidates[0].member_id }, ctx);
  assert.equal(replay.idempotent_replay, true);
});

test("project payments fail closed when Stripe is not configured", async () => {
  const order = await adapters.createPayment("SM-001", { amount: 299900, currency: "twd" }, ctx);
  assert.equal(order.status, "requires_configuration"); assert.equal(order.checkout_url, null);
});

test("RBAC decisions are explicit and audited", () => {
  assert.equal(adapters.authorize({ role: "designer", action: "connector:write" }, ctx).allowed, true);
  assert.equal(adapters.authorize({ role: "reviewer", action: "payment:write" }, ctx).allowed, false);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM authorization_audits").get().count, 2);
});

test("durable jobs lease, retry, dead-letter and complete", () => {
  const first = adapters.enqueue({ job_type: "mail", payload: { id: 1 }, max_attempts: 1 }, ctx);
  adapters.leaseJob({ worker_id: "worker" }, ctx);
  assert.equal(adapters.finishJob(first.job_id, { status: "failed", error: "test" }).status, "dead_letter");
  const second = adapters.enqueue({ job_type: "handoff", payload: { id: 2 } }, ctx);
  adapters.leaseJob({ worker_id: "worker" }, ctx);
  assert.equal(adapters.finishJob(second.job_id, { status: "completed" }).status, "completed");
});

test("all five connector contracts produce checksummed packages", () => {
  for (const tool of ["revit", "ifc", "autocad", "rhino", "blender"]) {
    const result = adapters.createConnectorPackage("SM-001", tool, { direction: "export", entities: [{ id: "wall-1" }] }, ctx);
    assert.equal(result.tool_type, tool); assert.match(result.checksum, /^[a-f0-9]{64}$/);
  }
});

