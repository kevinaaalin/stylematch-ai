import { createHash, randomUUID } from "node:crypto";

const TOOLS = new Set(["revit", "ifc", "autocad", "rhino", "blender"]);
const ROLES = {
  owner: ["project:*", "payment:*", "matching:*", "connector:*"],
  admin: ["project:read", "project:write", "payment:read", "matching:*", "connector:*"],
  designer: ["project:read", "project:write", "matching:read", "connector:read", "connector:write"],
  reviewer: ["project:read", "matching:read", "connector:read"],
};

const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}_${randomUUID()}`;
const json = (value, fallback = {}) => { try { return JSON.parse(value); } catch { return fallback; } };
const sha256 = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

function bad(message, code = "INVALID_REQUEST", status = 400, details) {
  const error = new Error(message); error.code = code; error.status = status; error.details = details; throw error;
}

export function createProductionAdapters(db, config = {}) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS twcid_members (
      member_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, service_regions TEXT NOT NULL,
      styles TEXT NOT NULL, specialties TEXT NOT NULL, min_budget INTEGER NOT NULL,
      max_budget INTEGER NOT NULL, capacity INTEGER NOT NULL DEFAULT 1, rating REAL NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1, active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS twcid_match_requests (
      match_request_id TEXT PRIMARY KEY, stylematch_project_id TEXT NOT NULL, tenant_id TEXT NOT NULL,
      organization_id TEXT NOT NULL, status TEXT NOT NULL, criteria TEXT NOT NULL,
      candidates TEXT NOT NULL, candidates_checksum TEXT NOT NULL, selected_member_id TEXT,
      trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL, confirmed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS twcid_handoff_receipts (
      receipt_id TEXT PRIMARY KEY, match_request_id TEXT NOT NULL UNIQUE, stylematch_project_id TEXT NOT NULL,
      member_id TEXT NOT NULL, payload TEXT NOT NULL, checksum TEXT NOT NULL, trace_id TEXT NOT NULL,
      accepted_by TEXT NOT NULL, accepted_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_payment_orders (
      order_id TEXT PRIMARY KEY, stylematch_project_id TEXT NOT NULL, plan_id TEXT NOT NULL,
      provider TEXT NOT NULL, provider_session_id TEXT UNIQUE, status TEXT NOT NULL,
      amount INTEGER NOT NULL, currency TEXT NOT NULL, checkout_url TEXT, customer_email TEXT,
      trace_id TEXT NOT NULL, created_at TEXT NOT NULL, paid_at TEXT
    );
    CREATE TABLE IF NOT EXISTS durable_jobs (
      job_id TEXT PRIMARY KEY, job_type TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, max_attempts INTEGER NOT NULL DEFAULT 3,
      available_at TEXT NOT NULL, lease_until TEXT, worker_id TEXT, last_error TEXT,
      trace_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS connector_exchange_packages (
      package_id TEXT PRIMARY KEY, stylematch_project_id TEXT NOT NULL, tool_type TEXT NOT NULL,
      direction TEXT NOT NULL, schema_version TEXT NOT NULL, payload TEXT NOT NULL,
      checksum TEXT NOT NULL, status TEXT NOT NULL, trace_id TEXT NOT NULL,
      created_by TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS authorization_audits (
      decision_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL, action TEXT NOT NULL,
      resource TEXT NOT NULL, allowed INTEGER NOT NULL, reason TEXT NOT NULL, trace_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const memberCount = db.prepare("SELECT COUNT(*) count FROM twcid_members").get().count;
  if (!memberCount) {
    const rows = [
      ["TWCID-TPE-001", "台北住宅設計團隊", ["台北", "新北", "基隆"], ["現代", "北歐", "日式"], ["老屋翻新", "收納", "系統櫃"], 120, 900, 4.8],
      ["TWCID-TPE-002", "都會機能設計所", ["台北", "新北", "桃園"], ["現代", "工業", "未來"], ["小坪數", "智能住宅", "燈光"], 80, 600, 4.6],
      ["TWCID-TXG-001", "中部生活設計", ["台中", "彰化", "南投"], ["北歐", "無印", "南法地中海"], ["新成屋", "親子住宅", "軟裝"], 100, 750, 4.7],
      ["TWCID-KHH-001", "南方空間設計", ["高雄", "台南", "屏東"], ["現代", "古典歐式", "南法地中海"], ["透天", "老屋翻新", "工程管理"], 150, 1200, 4.9],
      ["TWCID-ALL-001", "全台整合設計顧問", ["全台"], ["現代", "北歐", "日式", "工業", "古典歐式"], ["跨區專案", "預算治理", "工程交接"], 250, 2000, 4.5],
    ];
    const insert = db.prepare("INSERT INTO twcid_members (member_id,display_name,service_regions,styles,specialties,min_budget,max_budget,capacity,rating,verified,active,updated_at) VALUES (?,?,?,?,?,?,?,3,?,1,1,?)");
    rows.forEach(([id, name, regions, styles, specialties, min, max, rating]) => insert.run(id, name, JSON.stringify(regions), JSON.stringify(styles), JSON.stringify(specialties), min, max, rating, now()));
  }

  function scoreMember(member, criteria) {
    const regions = json(member.service_regions, []); const styles = json(member.styles, []); const specialties = json(member.specialties, []);
    const budget = Number(criteria.budget_twd || 0) / 10000;
    const region = !criteria.region || regions.includes("全台") || regions.includes(criteria.region) ? 30 : 0;
    const wantedStyles = [criteria.primary_style, criteria.secondary_style].filter(Boolean);
    const style = wantedStyles.reduce((score, value, index) => score + (styles.includes(value) ? (index ? 12 : 24) : 0), 0);
    const specialty = (criteria.specialties || []).reduce((score, value) => score + (specialties.includes(value) ? 6 : 0), 0);
    const budgetFit = !budget ? 10 : budget >= member.min_budget && budget <= member.max_budget ? 20 : 0;
    return Math.min(100, Math.round(region + style + specialty + budgetFit + member.rating * 2));
  }

  function createMatch(projectId, payload, ctx) {
    const criteria = { region: payload.region || "", budget_twd: Number(payload.budget_twd || 0), primary_style: payload.primary_style || "", secondary_style: payload.secondary_style || "", specialties: Array.isArray(payload.specialties) ? payload.specialties : [] };
    const candidates = db.prepare("SELECT * FROM twcid_members WHERE active=1 AND verified=1 AND capacity>0").all()
      .map((row) => ({ member_id: row.member_id, display_name: row.display_name, rating: row.rating, score: scoreMember(row, criteria), service_regions: json(row.service_regions, []), styles: json(row.styles, []), specialties: json(row.specialties, []) }))
      .sort((a, b) => b.score - a.score || b.rating - a.rating).slice(0, 5);
    if (!candidates.length) bad("No eligible TWCID members are available.", "TWCID_NO_CANDIDATES", 409);
    const id = uid("twcid_match"); const at = now(); const checksum = sha256({ criteria, candidates });
    db.prepare("INSERT INTO twcid_match_requests (match_request_id,stylematch_project_id,tenant_id,organization_id,status,criteria,candidates,candidates_checksum,selected_member_id,trace_id,created_by,created_at,confirmed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NULL)")
      .run(id, projectId, ctx.tenant_id, ctx.organization_id, "candidate_ready", JSON.stringify(criteria), JSON.stringify(candidates), checksum, null, ctx.trace_id, ctx.user_id, at);
    return { match_request_id: id, stylematch_project_id: projectId, status: "candidate_ready", criteria, candidates, candidates_checksum: checksum, requires_human_confirmation: true, created_at: at };
  }

  function confirmMatch(id, payload, ctx) {
    const row = db.prepare("SELECT * FROM twcid_match_requests WHERE match_request_id=? AND tenant_id=? AND organization_id=?").get(id, ctx.tenant_id, ctx.organization_id);
    if (!row) bad("TWCID match request not found.", "TWCID_MATCH_NOT_FOUND", 404);
    if (row.status === "confirmed") return { ...json(row.candidates, []).find((x) => x.member_id === row.selected_member_id), match_request_id: id, receipt: receiptFor(id), idempotent_replay: true };
    const candidate = json(row.candidates, []).find((x) => x.member_id === payload.member_id);
    if (!candidate) bad("Selected member is not in the immutable candidate snapshot.", "TWCID_MEMBER_NOT_CANDIDATE", 409);
    const at = now(); const receiptId = uid("twcid_receipt");
    const receiptPayload = { schema_version: "StyleMatch.TWCIDHandoff/1.0", match_request_id: id, stylematch_project_id: row.stylematch_project_id, selected_member: candidate, criteria: json(row.criteria), candidates_checksum: row.candidates_checksum, accepted_by: ctx.user_id, accepted_at: at };
    const checksum = sha256(receiptPayload);
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE twcid_match_requests SET status='confirmed',selected_member_id=?,confirmed_at=? WHERE match_request_id=?").run(candidate.member_id, at, id);
      db.prepare("INSERT INTO twcid_handoff_receipts VALUES (?,?,?,?,?,?,?,?,?)").run(receiptId, id, row.stylematch_project_id, candidate.member_id, JSON.stringify(receiptPayload), checksum, ctx.trace_id, ctx.user_id, at);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    return { match_request_id: id, status: "confirmed", selected_member: candidate, receipt: { receipt_id: receiptId, ...receiptPayload, checksum } };
  }
  function receiptFor(id) { const row = db.prepare("SELECT * FROM twcid_handoff_receipts WHERE match_request_id=?").get(id); return row ? { ...json(row.payload), receipt_id: row.receipt_id, checksum: row.checksum } : null; }

  async function createPayment(projectId, payload, ctx) {
    const planId = payload.plan_id || "ai_proposal"; const amount = Number(payload.amount || 299000); const currency = String(payload.currency || "twd").toLowerCase();
    if (!Number.isInteger(amount) || amount < 1) bad("A positive payment amount is required.");
    const orderId = uid("pay"); const at = now(); let provider = "local_test"; let providerSessionId = null; let checkoutUrl = null; let status = "requires_configuration";
    if (config.stripeSecretKey) {
      provider = "stripe"; status = "pending";
      const params = new URLSearchParams({ mode: "payment", client_reference_id: orderId, success_url: `${config.appUrl}/?project_payment=success&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}#/MyProjects`, cancel_url: `${config.appUrl}/?project_payment=cancelled&order_id=${orderId}#/PricingPlans`, "metadata[order_id]": orderId, "metadata[stylematch_project_id]": projectId, "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": currency, "line_items[0][price_data][unit_amount]": String(amount), "line_items[0][price_data][product_data][name]": payload.plan_name || "StyleMatch AI 設計提案" });
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${config.stripeSecretKey}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
      const session = await response.json(); if (!response.ok) bad("Stripe checkout could not be created.", "PAYMENT_SESSION_CREATE_FAILED", 502, { provider: session.error?.message });
      providerSessionId = session.id; checkoutUrl = session.url;
    }
    db.prepare("INSERT INTO project_payment_orders (order_id,stylematch_project_id,plan_id,provider,provider_session_id,status,amount,currency,checkout_url,customer_email,trace_id,created_at,paid_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NULL)").run(orderId, projectId, planId, provider, providerSessionId, status, amount, currency, checkoutUrl, payload.customer_email || null, ctx.trace_id, at);
    return { order_id: orderId, stylematch_project_id: projectId, provider, status, amount, currency, checkout_url: checkoutUrl, configuration_required: provider !== "stripe" };
  }

  function fulfillProjectPayment(session) {
    const orderId = session?.metadata?.order_id || session?.client_reference_id;
    if (!orderId || session.payment_status === "unpaid") return null;
    const row = db.prepare("SELECT * FROM project_payment_orders WHERE order_id=?").get(orderId); if (!row) return null;
    db.prepare("UPDATE project_payment_orders SET status='paid',provider_session_id=COALESCE(provider_session_id,?),paid_at=? WHERE order_id=?").run(session.id || null, now(), orderId);
    return db.prepare("SELECT * FROM project_payment_orders WHERE order_id=?").get(orderId);
  }

  function authorize(payload, ctx) {
    const role = payload.role || ctx.case_role || "reviewer"; const action = String(payload.action || ""); const resource = payload.resource || "global";
    const permissions = ROLES[role] || []; const allowed = permissions.some((rule) => rule === action || rule === "*" || (rule.endsWith(":*") && action.startsWith(rule.slice(0, -1))));
    const reason = allowed ? `role ${role} grants ${action}` : `role ${role} does not grant ${action}`; const id = uid("authz");
    db.prepare("INSERT INTO authorization_audits VALUES (?,?,?,?,?,?,?,?,?)").run(id, ctx.user_id, role, action, resource, allowed ? 1 : 0, reason, ctx.trace_id, now());
    return { decision_id: id, allowed, role, action, resource, reason, policy_version: "StyleMatch.Authorization/1.0" };
  }

  function enqueue(payload, ctx) { const id = uid("job"); const at = now(); db.prepare("INSERT INTO durable_jobs (job_id,job_type,payload,status,attempts,max_attempts,available_at,lease_until,worker_id,last_error,trace_id,created_at,updated_at) VALUES (?,?,?,'queued',0,?,?,NULL,NULL,NULL,?,?,?)").run(id, payload.job_type, JSON.stringify(payload.payload || {}), Number(payload.max_attempts || 3), payload.available_at || at, ctx.trace_id, at, at); return getJob(id); }
  function getJob(id) { const row = db.prepare("SELECT * FROM durable_jobs WHERE job_id=?").get(id); return row ? { ...row, payload: json(row.payload) } : null; }
  function leaseJob(payload, ctx) { const at = now(); const until = new Date(Date.now() + Number(payload.lease_seconds || 60) * 1000).toISOString(); const row = db.prepare("SELECT * FROM durable_jobs WHERE status='queued' AND available_at<=? ORDER BY created_at LIMIT 1").get(at); if (!row) return null; db.prepare("UPDATE durable_jobs SET status='running',attempts=attempts+1,worker_id=?,lease_until=?,updated_at=? WHERE job_id=? AND status='queued'").run(payload.worker_id || ctx.user_id, until, at, row.job_id); return getJob(row.job_id); }
  function finishJob(id, payload) { const row = getJob(id); if (!row) bad("Job not found.", "JOB_NOT_FOUND", 404); const ok = payload.status === "completed"; const retry = !ok && row.attempts < row.max_attempts; const status = ok ? "completed" : retry ? "queued" : "dead_letter"; db.prepare("UPDATE durable_jobs SET status=?,available_at=?,lease_until=NULL,last_error=?,updated_at=? WHERE job_id=?").run(status, retry ? new Date(Date.now() + 5000).toISOString() : row.available_at, payload.error || null, now(), id); return getJob(id); }

  function createConnectorPackage(projectId, tool, payload, ctx) {
    if (!TOOLS.has(tool)) bad("Unsupported connector tool.", "CONNECTOR_TOOL_UNSUPPORTED", 404);
    const direction = payload.direction || "export"; if (!["export", "import"].includes(direction)) bad("direction must be export or import.");
    const body = { schema_version: "StyleMatch.ExternalExchange/1.0", tool_type: tool, direction, units: payload.units || "mm", coordinate_system: payload.coordinate_system || "right_handed_z_up", model_ref: payload.model_ref || null, entities: Array.isArray(payload.entities) ? payload.entities : [], metadata: payload.metadata || {}, requires_native_confirmation: tool !== "ifc" };
    const id = uid("exchange"); const checksum = sha256(body); const at = now();
    db.prepare("INSERT INTO connector_exchange_packages (package_id,stylematch_project_id,tool_type,direction,schema_version,payload,checksum,status,trace_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(id, projectId, tool, direction, body.schema_version, JSON.stringify(body), checksum, "ready", ctx.trace_id, ctx.user_id, at);
    return { package_id: id, stylematch_project_id: projectId, ...body, checksum, status: "ready", created_at: at };
  }

  function capabilities() {
    return { schema_version: "StyleMatch.ProductionAdapters/1.0", twcid: { mode: "local_engine", remote_registry_configured: Boolean(config.twcidApiUrl) }, email: { mode: config.smtpConfigured ? "smtp" : "outbox_only" }, payment: { mode: config.stripeSecretKey ? "stripe" : "configuration_required" }, identity: { mode: config.oidcIssuer ? "oidc" : "local_development", issuer: config.oidcIssuer || null }, authorization: { mode: "rbac_abac_policy", roles: Object.keys(ROLES) }, queue: { mode: "sqlite_durable", production_recommended: "managed_queue" }, database: { active: config.databaseType || "sqlite", production_ready: config.databaseType === "postgresql" }, connectors: [...TOOLS].map((tool) => ({ tool, contract_ready: true, native_validation_required: tool !== "ifc" })) };
  }

  return { capabilities, createMatch, confirmMatch, receiptFor, createPayment, fulfillProjectPayment, authorize, enqueue, leaseJob, finishJob, getJob, createConnectorPackage };
}
