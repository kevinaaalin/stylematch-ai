import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const contract = JSON.parse(readFileSync(join(root, "..", "contracts", "isafe-legacy-parity-r5.2.json"), "utf8"));
const uid = (prefix) => `${prefix}_${randomUUID()}`;
const now = () => new Date().toISOString();
const hash = (value) => createHash("sha256").update(value).digest("hex");
const parseJson = (value, fallback = {}) => { try { return JSON.parse(value); } catch { return fallback; } };

export function createLegacyParity({ db, schemaVersion, fail, emitEvent }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checklist_item_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL,
      stage TEXT NOT NULL,
      label TEXT NOT NULL,
      position INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      required INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL DEFAULT 'legacy_contract',
      completed_by TEXT,
      completed_at TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(case_id, stage, label),
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS contract_baselines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baseline_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL UNIQUE,
      currency TEXT NOT NULL DEFAULT 'TWD',
      design_total INTEGER NOT NULL DEFAULT 0,
      construction_total INTEGER NOT NULL DEFAULT 0,
      contract_ref TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS contract_baseline_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baseline_version_id TEXT NOT NULL UNIQUE,
      baseline_id TEXT NOT NULL,
      case_id INTEGER NOT NULL,
      version_no INTEGER NOT NULL,
      supersedes_version_id TEXT,
      currency TEXT NOT NULL,
      design_total INTEGER NOT NULL,
      construction_total INTEGER NOT NULL,
      contract_ref TEXT,
      status TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_by TEXT NOT NULL,
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(case_id, version_no),
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS payment_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      phase TEXT NOT NULL,
      stage TEXT NOT NULL,
      label TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      due_at TEXT,
      receipt_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(case_id, code),
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL,
      milestone_id TEXT,
      title TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      file_name TEXT,
      mime_type TEXT,
      content_base64 TEXT,
      sha256 TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS change_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_order_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      reason TEXT NOT NULL,
      amount_delta INTEGER NOT NULL DEFAULT 0,
      schedule_delta_days INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'proposed',
      requested_by TEXT NOT NULL,
      approved_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS case_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,
      case_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'message',
      body TEXT NOT NULL,
      actor TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS checklist_party_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      confirmation_id TEXT NOT NULL UNIQUE,
      checklist_item_id TEXT NOT NULL,
      case_id INTEGER NOT NULL,
      party_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      actor_user_id TEXT,
      actor_role TEXT,
      note TEXT,
      confirmed_at TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(checklist_item_id, party_type),
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
    CREATE TABLE IF NOT EXISTS execution_checklist_baselines (
      case_id INTEGER PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'draft',
      certified_member_confirmed_by TEXT,
      certified_member_confirmed_at TEXT,
      owner_confirmed_by TEXT,
      owner_confirmed_at TEXT,
      frozen_at TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(case_id) REFERENCES cases(id)
    );
  `);

  const ensureColumn = (table, name, definition) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!columns.some((column) => column.name === name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  };
  [
    ["file_name", "TEXT"], ["mime_type", "TEXT"], ["content_base64", "TEXT"], ["file_size", "INTEGER DEFAULT 0"],
  ].forEach(([name, definition]) => ensureColumn("evidence", name, definition));
  [["content", "TEXT"], ["deleted_at", "TEXT"]].forEach(([name, definition]) => ensureColumn("checklist_items", name, definition));

  function caseRow(id, ctx) {
    const row = ctx
      ? db.prepare("SELECT * FROM cases WHERE (isafe_case_id=? OR source_case_code=?) AND tenant_id=? AND organization_id=?").get(id, id, ctx.tenant_id, ctx.organization_id)
      : db.prepare("SELECT * FROM cases WHERE isafe_case_id=? OR source_case_code=?").get(id, id);
    if (!row) fail("Case not found.", "CASE_NOT_FOUND", 404);
    return row;
  }

  function audit(row, action, actor, detail, traceId) {
    db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)")
      .run(row.id, action, actor || "local-admin", detail, traceId, now());
  }

  function seed(row) {
    const at = now();
    for (const [stage, labels] of Object.entries(contract.checklists)) {
      labels.forEach((label, index) => {
        db.prepare("INSERT OR IGNORE INTO checklist_items (checklist_item_id,case_id,stage,label,position,created_at,updated_at) VALUES (?,?,?,?,?,?,?)")
          .run(uid("check"), row.id, stage, label, index + 1, at, at);
      });
    }
    let baseline = db.prepare("SELECT * FROM contract_baselines WHERE case_id=?").get(row.id);
    if (!baseline) {
      db.prepare("INSERT INTO contract_baselines (baseline_id,case_id,created_at,updated_at) VALUES (?,?,?,?)")
        .run(uid("baseline"), row.id, at, at);
      baseline = db.prepare("SELECT * FROM contract_baselines WHERE case_id=?").get(row.id);
    }
    const baselineVersion = db.prepare("SELECT baseline_version_id FROM contract_baseline_versions WHERE case_id=? ORDER BY version_no DESC LIMIT 1").get(row.id);
    if (!baselineVersion) {
      db.prepare(`INSERT INTO contract_baseline_versions
        (baseline_version_id,baseline_id,case_id,version_no,currency,design_total,construction_total,contract_ref,status,reason,created_by,approved_by,approved_at,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(uid("baseline_version"), baseline.baseline_id, row.id, 1, baseline.currency, baseline.design_total, baseline.construction_total, baseline.contract_ref, baseline.status, "Migrated current baseline into R6 immutable history.", "system-migration", baseline.approved_by, baseline.approved_at, baseline.updated_at || baseline.created_at || at);
    }
    for (const item of contract.payment_milestones) {
      const base = item.phase === "design" ? baseline.design_total : baseline.construction_total;
      db.prepare("INSERT OR IGNORE INTO payment_milestones (milestone_id,case_id,code,phase,stage,label,percentage,amount,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
        .run(uid("milestone"), row.id, item.code, item.phase, item.stage, item.label, item.percentage, Math.round(base * item.percentage / 100), at, at);
    }
    const checklistRows = db.prepare("SELECT checklist_item_id,status,completed_by,completed_at,note,created_at,updated_at FROM checklist_items WHERE case_id=?").all(row.id);
    for (const item of checklistRows) {
      for (const party of ["certified_member", "owner"]) {
        const migratedStatus = item.status === "completed"
          ? "completed"
          : item.status === "exception" && party === "certified_member" ? "exception" : "pending";
        db.prepare(`INSERT OR IGNORE INTO checklist_party_confirmations
          (confirmation_id,checklist_item_id,case_id,party_type,status,actor_user_id,actor_role,note,confirmed_at,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
          .run(uid("confirmation"), item.checklist_item_id, row.id, party, migratedStatus, item.completed_by, "legacy_migration", item.note, migratedStatus === "completed" ? item.completed_at : null, item.created_at || at, item.updated_at || at);
      }
    }
  }

  function serialize(row) {
    seed(row);
    const stageOrder = Object.keys(contract.checklists);
    const currentStageIndex = stageOrder.indexOf(row.current_stage);
    const confirmations = db.prepare(`SELECT checklist_item_id,confirmation_id,party_type,status,actor_user_id,actor_role,note,confirmed_at,version,updated_at
      FROM checklist_party_confirmations WHERE case_id=? ORDER BY id`).all(row.id);
    const confirmationsByItem = confirmations.reduce((map, confirmation) => {
      if (!map[confirmation.checklist_item_id]) map[confirmation.checklist_item_id] = {};
      map[confirmation.checklist_item_id][confirmation.party_type] = confirmation;
      return map;
    }, {});
    const checklist = db.prepare("SELECT checklist_item_id,stage,label,content,position,status,required,source,completed_by,completed_at,note,updated_at FROM checklist_items WHERE case_id=? AND deleted_at IS NULL ORDER BY stage,position,id").all(row.id)
      .map((item) => ({
        ...item,
        aggregate_status: item.status,
        required: Boolean(item.required),
        required_parties: ["certified_member", "owner"],
        stage_locked: row.status === "Closed" || row.current_stage === "CLOSED" || (currentStageIndex >= 0 && stageOrder.indexOf(item.stage) < currentStageIndex),
        confirmations: confirmationsByItem[item.checklist_item_id] || {},
      }));
    const baseline = db.prepare("SELECT baseline_id,currency,design_total,construction_total,contract_ref,status,approved_by,approved_at,updated_at FROM contract_baselines WHERE case_id=?").get(row.id);
    const baselineHistory = db.prepare(`SELECT baseline_version_id,baseline_id,version_no,supersedes_version_id,currency,design_total,construction_total,contract_ref,status,reason,created_by,approved_by,approved_at,created_at
      FROM contract_baseline_versions WHERE case_id=? ORDER BY version_no DESC`).all(row.id);
    baseline.current_version = baselineHistory[0]?.version_no || 1;
    baseline.current_version_id = baselineHistory[0]?.baseline_version_id || null;
    const milestones = db.prepare("SELECT milestone_id,code,phase,stage,label,percentage,amount,status,due_at,receipt_id,updated_at FROM payment_milestones WHERE case_id=? ORDER BY id").all(row.id);
    const receipts = db.prepare("SELECT receipt_id,milestone_id,title,amount,file_name,mime_type,sha256,status,created_by,created_at FROM receipts WHERE case_id=? ORDER BY id DESC").all(row.id);
    const changes = db.prepare("SELECT change_order_id,title,reason,amount_delta,schedule_delta_days,status,requested_by,approved_by,created_at,updated_at FROM change_orders WHERE case_id=? ORDER BY id DESC").all(row.id);
    const messages = db.prepare("SELECT message_id,category,body,actor,actor_role,created_at FROM case_messages WHERE case_id=? ORDER BY id DESC LIMIT 100").all(row.id);
    const evidenceFiles = db.prepare("SELECT evidence_id,evidence_type,label,file_name,mime_type,file_size,sha256,created_by,step_key,created_at FROM evidence WHERE case_id=? AND file_name IS NOT NULL ORDER BY id DESC").all(row.id);
    const executionBaseline = db.prepare("SELECT status,certified_member_confirmed_by,certified_member_confirmed_at,owner_confirmed_by,owner_confirmed_at,frozen_at,version,updated_at FROM execution_checklist_baselines WHERE case_id=?").get(row.id)
      || { status: "draft", version: 1, updated_at: row.updated_at };
    return {
      contract_version: contract.contract_version,
      checklist,
      checklist_summary: {
        total: checklist.length,
        completed: checklist.filter((item) => item.status === "completed").length,
        current_stage_total: checklist.filter((item) => item.stage === row.current_stage).length,
        current_stage_completed: checklist.filter((item) => item.stage === row.current_stage && item.status === "completed").length,
      },
      baseline,
      baseline_history: baselineHistory,
      milestones,
      receipts,
      change_orders: changes,
      messages,
      evidence_files: evidenceFiles,
      execution_checklist_baseline: executionBaseline,
    };
  }

  function executionBaseline(row) {
    const at = now();
    db.prepare("INSERT OR IGNORE INTO execution_checklist_baselines (case_id,updated_at) VALUES (?,?)").run(row.id, at);
    return db.prepare("SELECT * FROM execution_checklist_baselines WHERE case_id=?").get(row.id);
  }

  function assertPlanningEditable(row) {
    const baseline = executionBaseline(row);
    if (baseline.status === "frozen") fail("The execution checklist baseline is frozen.", "CHECKLIST_BASELINE_FROZEN", 409);
  }

  function updateChecklist(row, itemId, payload, ctx) {
    const item = db.prepare("SELECT * FROM checklist_items WHERE case_id=? AND checklist_item_id=?").get(row.id, itemId);
    if (!item) fail("Checklist item not found.", "CHECKLIST_ITEM_NOT_FOUND", 404);
    const allowed = new Set(["pending", "completed", "exception", "not_applicable"]);
    if (!allowed.has(payload.status)) fail("Invalid checklist status.", "CHECKLIST_STATUS_INVALID");
    const at = now();
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE checklist_items SET status=?,completed_by=?,completed_at=?,note=?,updated_at=? WHERE id=?")
        .run(payload.status, payload.status === "completed" ? (payload.actor || "local-admin") : null, payload.status === "completed" ? at : null, payload.note || null, at, item.id);
      db.prepare(`UPDATE checklist_party_confirmations SET status=?,actor_user_id=?,actor_role='headquarter_override',note=?,confirmed_at=?,version=version+1,updated_at=? WHERE checklist_item_id=?`)
        .run(payload.status, payload.actor || ctx.user_id || "local-admin", payload.note || null, payload.status === "completed" ? at : null, at, itemId);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    audit(row, "checklist.status_changed", payload.actor, `${item.stage}:${item.label}:${payload.status}`, ctx.trace_id);
    emitEvent("ChecklistItemStatusChanged", { ...ctx, correlation_id: row.correlation_id }, { isafe_case_id: row.isafe_case_id, checklist_item_id: itemId, stage: item.stage, status: payload.status });
  }

  function assertLegacyAction(ctx, action, party = null) {
    const tier = ctx.member_tier;
    const caseRole = ctx.case_role;
    const allowedByAction = {
      checklist_admin: new Set(["headquarter"]),
      checklist_add: new Set(["headquarter", "dealer", "certified_member", "general_member"]),
      baseline: new Set(["headquarter", "dealer"]),
      receipt: new Set(["headquarter", "dealer", "certified_member"]),
      evidence: new Set(["headquarter", "dealer", "certified_member", "general_member"]),
      change_order: new Set(["headquarter", "dealer", "certified_member", "general_member"]),
      message: new Set(["headquarter", "dealer", "association", "certified_member", "general_member"]),
    };
    if (party) {
      const mayConfirm = (party === "certified_member" && tier === "certified_member" && ["case_designer", "case_vendor"].includes(caseRole))
        || (party === "owner" && tier === "general_member" && caseRole === "case_owner");
      if (!mayConfirm) fail("This membership and case role cannot confirm for the selected party.", "CHECKLIST_PARTY_FORBIDDEN", 403, { party_type: party, member_tier: tier, case_role: caseRole });
      return;
    }
    if (!allowedByAction[action]?.has(tier)) fail("This membership cannot perform the requested action.", "MEMBERSHIP_ACTION_FORBIDDEN", 403, { action, member_tier: tier });
  }

  function isStageLocked(row, stage) {
    if (row.status === "Closed" || row.current_stage === "CLOSED") return true;
    const stages = Object.keys(contract.checklists);
    const currentIndex = stages.indexOf(row.current_stage);
    const itemIndex = stages.indexOf(stage);
    return currentIndex >= 0 && itemIndex >= 0 && itemIndex < currentIndex;
  }

  function confirmationAggregate(itemId) {
    const parties = db.prepare("SELECT party_type,status FROM checklist_party_confirmations WHERE checklist_item_id=?").all(itemId);
    if (parties.some((party) => party.status === "exception")) return "exception";
    if (parties.length === 2 && parties.every((party) => party.status === "completed")) return "completed";
    if (parties.length === 2 && parties.every((party) => party.status === "not_applicable")) return "not_applicable";
    return "pending";
  }

  function updateChecklistConfirmation(row, itemId, party, payload, ctx) {
    if (!new Set(["certified_member", "owner"]).has(party)) fail("Invalid checklist party.", "CHECKLIST_PARTY_INVALID");
    assertLegacyAction(ctx, "checklist_confirmation", party);
    const item = db.prepare("SELECT * FROM checklist_items WHERE case_id=? AND checklist_item_id=?").get(row.id, itemId);
    if (!item) fail("Checklist item not found.", "CHECKLIST_ITEM_NOT_FOUND", 404);
    if (isStageLocked(row, item.stage)) fail("Completed stages are locked.", "CHECKLIST_STAGE_LOCKED", 409, { stage: item.stage, current_stage: row.current_stage });
    const allowed = new Set(["pending", "completed", "exception", "not_applicable"]);
    if (!allowed.has(payload.status)) fail("Invalid checklist status.", "CHECKLIST_STATUS_INVALID");
    const confirmation = db.prepare("SELECT * FROM checklist_party_confirmations WHERE checklist_item_id=? AND party_type=?").get(itemId, party);
    if (!confirmation) fail("Checklist confirmation not found.", "CHECKLIST_CONFIRMATION_NOT_FOUND", 404);
    if (payload.expected_version !== undefined && Number(payload.expected_version) !== confirmation.version) {
      fail("Checklist confirmation was updated by another user.", "CHECKLIST_CONFIRMATION_VERSION_CONFLICT", 409, { expected_version: payload.expected_version, current_version: confirmation.version });
    }
    const at = now();
    const actor = ctx.user_id || payload.actor || "local-user";
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare(`UPDATE checklist_party_confirmations
        SET status=?,actor_user_id=?,actor_role=?,note=?,confirmed_at=?,version=version+1,updated_at=?
        WHERE id=?`)
        .run(payload.status, actor, ctx.case_role, payload.note || null, payload.status === "completed" ? at : null, at, confirmation.id);
      const aggregate = confirmationAggregate(itemId);
      db.prepare("UPDATE checklist_items SET status=?,completed_by=?,completed_at=?,note=?,updated_at=? WHERE id=?")
        .run(aggregate, aggregate === "completed" ? actor : null, aggregate === "completed" ? at : null, payload.note || null, at, item.id);
      audit(row, "checklist.party_confirmation_changed", actor, `${item.stage}:${item.label}:${party}:${confirmation.status}->${payload.status}:v${confirmation.version + 1}`, ctx.trace_id);
      emitEvent("ChecklistPartyConfirmationChanged", { ...ctx, correlation_id: row.correlation_id }, {
        isafe_case_id: row.isafe_case_id,
        checklist_item_id: itemId,
        stage: item.stage,
        party_type: party,
        previous_status: confirmation.status,
        status: payload.status,
        aggregate_status: aggregate,
        confirmation_version: confirmation.version + 1,
      });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function addChecklist(row, payload, ctx) {
    assertPlanningEditable(row);
    if (!payload.stage || !payload.label?.trim()) fail("stage and label are required.");
    if (!contract.checklists[payload.stage]) fail("Unknown checklist stage.", "CHECKLIST_STAGE_INVALID");
    const at = now();
    const position = Number(db.prepare("SELECT COALESCE(MAX(position),0)+1 AS next FROM checklist_items WHERE case_id=? AND stage=?").get(row.id, payload.stage).next);
    const itemId = uid("check");
    db.prepare("INSERT INTO checklist_items (checklist_item_id,case_id,stage,label,content,position,source,created_at,updated_at) VALUES (?,?,?,?,?,?,'case_custom',?,?)")
      .run(itemId, row.id, payload.stage, payload.label.trim(), String(payload.content || "").trim() || null, position, at, at);
    audit(row, "checklist.item_added", payload.actor, `${payload.stage}:${payload.label.trim()}`, ctx.trace_id);
  }

  function editChecklist(row, itemId, payload, ctx) {
    assertPlanningEditable(row);
    const item = db.prepare("SELECT * FROM checklist_items WHERE case_id=? AND checklist_item_id=? AND deleted_at IS NULL").get(row.id, itemId);
    if (!item) fail("Checklist item not found.", "CHECKLIST_ITEM_NOT_FOUND", 404);
    if (!payload.label?.trim()) fail("label is required.");
    const at = now();
    db.prepare("UPDATE checklist_items SET label=?,content=?,updated_at=? WHERE id=?")
      .run(payload.label.trim(), String(payload.content || "").trim() || null, at, item.id);
    audit(row, "checklist.item_updated", payload.actor, `${item.stage}:${item.label}->${payload.label.trim()}`, ctx.trace_id);
  }

  function deleteChecklist(row, itemId, payload, ctx) {
    assertPlanningEditable(row);
    const item = db.prepare("SELECT * FROM checklist_items WHERE case_id=? AND checklist_item_id=? AND deleted_at IS NULL").get(row.id, itemId);
    if (!item) fail("Checklist item not found.", "CHECKLIST_ITEM_NOT_FOUND", 404);
    const at = now();
    db.prepare("UPDATE checklist_items SET deleted_at=?,updated_at=? WHERE id=?").run(at, at, item.id);
    audit(row, "checklist.item_deleted", payload.actor, `${item.stage}:${item.label}`, ctx.trace_id);
  }

  function confirmExecutionBaseline(row, payload, ctx) {
    const party = payload.party;
    assertLegacyAction(ctx, "checklist_confirmation", party);
    const baseline = executionBaseline(row);
    if (baseline.status === "frozen") return;
    const at = now();
    const actor = ctx.user_id || payload.actor || "local-user";
    const column = party === "owner" ? "owner" : "certified_member";
    db.prepare(`UPDATE execution_checklist_baselines SET ${column}_confirmed_by=?,${column}_confirmed_at=?,version=version+1,updated_at=? WHERE case_id=?`)
      .run(actor, at, at, row.id);
    const next = executionBaseline(row);
    if (next.certified_member_confirmed_at && next.owner_confirmed_at) {
      db.prepare("UPDATE execution_checklist_baselines SET status='frozen',frozen_at=?,version=version+1,updated_at=? WHERE case_id=?").run(at, at, row.id);
      audit(row, "checklist.baseline_frozen", actor, `version=${next.version + 1}`, ctx.trace_id);
    } else {
      audit(row, "checklist.baseline_party_confirmed", actor, party, ctx.trace_id);
    }
  }

  function saveBaseline(row, payload, ctx) {
    const designTotal = Math.max(0, Number(payload.design_total) || 0);
    const constructionTotal = Math.max(0, Number(payload.construction_total) || 0);
    const status = payload.status || "draft";
    if (!new Set(["draft", "approved"]).has(status)) fail("Invalid contract baseline status.", "CONTRACT_BASELINE_STATUS_INVALID");
    if (!payload.reason?.trim()) fail("Baseline change reason is required.", "CONTRACT_BASELINE_REASON_REQUIRED");
    const at = now();
    const baseline = db.prepare("SELECT * FROM contract_baselines WHERE case_id=?").get(row.id);
    const previous = db.prepare("SELECT baseline_version_id,version_no FROM contract_baseline_versions WHERE case_id=? ORDER BY version_no DESC LIMIT 1").get(row.id);
    const versionId = uid("baseline_version");
    const versionNo = Number(previous?.version_no || 0) + 1;
    const actor = payload.actor || "local-admin";
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare(`INSERT INTO contract_baseline_versions
        (baseline_version_id,baseline_id,case_id,version_no,supersedes_version_id,currency,design_total,construction_total,contract_ref,status,reason,created_by,approved_by,approved_at,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(versionId, baseline.baseline_id, row.id, versionNo, previous?.baseline_version_id || null, payload.currency || "TWD", designTotal, constructionTotal, payload.contract_ref || null, status, payload.reason.trim(), actor, status === "approved" ? actor : null, status === "approved" ? at : null, at);
      db.prepare("UPDATE contract_baselines SET currency=?,design_total=?,construction_total=?,contract_ref=?,status=?,approved_by=?,approved_at=?,updated_at=? WHERE case_id=?")
        .run(payload.currency || "TWD", designTotal, constructionTotal, payload.contract_ref || null, status, status === "approved" ? actor : null, status === "approved" ? at : null, at, row.id);
      db.prepare("UPDATE payment_milestones SET amount=ROUND(? * percentage / 100.0),updated_at=? WHERE case_id=? AND phase='design'").run(designTotal, at, row.id);
      db.prepare("UPDATE payment_milestones SET amount=ROUND(? * percentage / 100.0),updated_at=? WHERE case_id=? AND phase='construction'").run(constructionTotal, at, row.id);
      audit(row, "contract_baseline.version_created", actor, `${versionId};v=${versionNo};design=${designTotal};construction=${constructionTotal};status=${status};reason=${payload.reason.trim()}`, ctx.trace_id);
      if (status === "approved") {
        emitEvent("ContractBaselineApproved", { ...ctx, correlation_id: row.correlation_id }, {
          isafe_case_id: row.isafe_case_id,
          baseline_id: baseline.baseline_id,
          baseline_version_id: versionId,
          version_no: versionNo,
          contract_ref: payload.contract_ref || null,
        });
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function addReceipt(row, payload, ctx) {
    if (!payload.title?.trim()) fail("Receipt title is required.", "RECEIPT_TITLE_REQUIRED");
    const content = payload.content_base64 || "";
    if (content.length > 14_000_000) fail("Receipt file exceeds local 10 MB limit.", "FILE_TOO_LARGE", 413);
    const id = uid("receipt");
    const at = now();
    db.prepare("INSERT INTO receipts (receipt_id,case_id,milestone_id,title,amount,file_name,mime_type,content_base64,sha256,status,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,'submitted',?,?)")
      .run(id, row.id, payload.milestone_id || null, payload.title.trim(), Math.max(0, Number(payload.amount) || 0), payload.file_name || null, payload.mime_type || null, content || null, content ? hash(content) : null, payload.actor || "local-admin", at);
    if (payload.milestone_id) db.prepare("UPDATE payment_milestones SET receipt_id=?,status='receipt_submitted',updated_at=? WHERE case_id=? AND milestone_id=?").run(id, at, row.id, payload.milestone_id);
    audit(row, "receipt.submitted", payload.actor, `${id}:${payload.title.trim()}`, ctx.trace_id);
  }

  function addEvidenceFile(row, payload, ctx) {
    if (!payload.file_name || !payload.content_base64) fail("file_name and content_base64 are required.", "EVIDENCE_FILE_REQUIRED");
    if (payload.content_base64.length > 14_000_000) fail("Evidence file exceeds local 10 MB limit.", "FILE_TOO_LARGE", 413);
    const at = now();
    const id = uid("evidence");
    const digest = hash(payload.content_base64);
    db.prepare(`INSERT INTO evidence (case_id,evidence_type,label,sha256,metadata,created_at,evidence_id,created_by,version,permission_scope,retention_policy,legal_hold,step_key,rule_version,schema_version,object_ref,trace_id,file_name,mime_type,content_base64,file_size)
      VALUES (?,?,?,?,?,?,?,?,1,'case_participants','project_lifecycle_plus_7_years',0,?,?,?,?,?,?,?,?,?)`)
      .run(row.id, payload.evidence_type || "project_file", payload.label || payload.file_name, digest, JSON.stringify({ legacy_parity: true }), at, id, payload.actor || "local-admin", payload.step_key || row.current_stage, schemaVersion, schemaVersion, `local-evidence://${id}`, ctx.trace_id, payload.file_name, payload.mime_type || "application/octet-stream", payload.content_base64, Math.floor(payload.content_base64.length * 0.75));
    audit(row, "evidence.file_uploaded", payload.actor, `${id}:${payload.file_name}`, ctx.trace_id);
    emitEvent("EvidenceRegistered", { ...ctx, correlation_id: row.correlation_id }, { isafe_case_id: row.isafe_case_id, evidence_id: id, evidence_type: payload.evidence_type || "project_file", step_key: payload.step_key || row.current_stage, sha256: digest });
  }

  function addChangeOrder(row, payload, ctx) {
    if (!payload.title?.trim() || !payload.reason?.trim()) fail("Change order title and reason are required.", "CHANGE_ORDER_INCOMPLETE");
    const id = uid("change");
    const at = now();
    db.prepare("INSERT INTO change_orders (change_order_id,case_id,title,reason,amount_delta,schedule_delta_days,status,requested_by,created_at,updated_at) VALUES (?,?,?,?,?,?,'proposed',?,?,?)")
      .run(id, row.id, payload.title.trim(), payload.reason.trim(), Number(payload.amount_delta) || 0, Number(payload.schedule_delta_days) || 0, payload.actor || "local-admin", at, at);
    audit(row, "change_order.proposed", payload.actor, `${id}:${payload.title.trim()}`, ctx.trace_id);
    emitEvent("ChangeOrderProposed", { ...ctx, correlation_id: row.correlation_id }, { isafe_case_id: row.isafe_case_id, change_order_id: id, amount_delta: Number(payload.amount_delta) || 0, schedule_delta_days: Number(payload.schedule_delta_days) || 0 });
  }

  function addMessage(row, payload, ctx) {
    if (!payload.body?.trim()) fail("Message body is required.", "MESSAGE_REQUIRED");
    const id = uid("message");
    db.prepare("INSERT INTO case_messages (message_id,case_id,category,body,actor,actor_role,created_at) VALUES (?,?,?,?,?,?,?)")
      .run(id, row.id, payload.category || "message", payload.body.trim(), payload.actor || "local-admin", payload.actor_role || "headquarter", now());
    audit(row, "message.created", payload.actor, `${payload.category || "message"}:${id}`, ctx.trace_id);
  }

  function getReceiptFile(id, receiptId, ctx) {
    const row = caseRow(id, ctx);
    const file = db.prepare("SELECT receipt_id,file_name,mime_type,content_base64,sha256 FROM receipts WHERE case_id=? AND receipt_id=?").get(row.id, receiptId);
    if (!file) fail("Receipt not found.", "RECEIPT_NOT_FOUND", 404);
    return file;
  }

  function getEvidenceFile(id, evidenceId, ctx) {
    const row = caseRow(id, ctx);
    const file = db.prepare("SELECT evidence_id,file_name,mime_type,content_base64,sha256 FROM evidence WHERE case_id=? AND evidence_id=?").get(row.id, evidenceId);
    if (!file) fail("Evidence file not found.", "EVIDENCE_NOT_FOUND", 404);
    return file;
  }

  async function handle(req, url, ctx, assertWriteAccess) {
    const match = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/legacy(?:\/(.*))?$/);
    if (!match) return null;
    const id = decodeURIComponent(match[1]);
    const action = match[2] || "";
    const row = caseRow(id, ctx);
    if (req.method === "GET" && !action) return { status: 200, body: { workspace: serialize(row) } };
    const receiptFile = action.match(/^receipts\/([^/]+)\/file$/);
    if (req.method === "GET" && receiptFile) return { status: 200, body: { file: getReceiptFile(id, decodeURIComponent(receiptFile[1]), ctx) } };
    const evidenceFile = action.match(/^evidence\/([^/]+)\/file$/);
    if (req.method === "GET" && evidenceFile) return { status: 200, body: { file: getEvidenceFile(id, decodeURIComponent(evidenceFile[1]), ctx) } };
    assertWriteAccess(req);
    const payload = await readJson(req, fail);
    const checklistStatus = action.match(/^checklist\/([^/]+)\/status$/);
    const checklistConfirmation = action.match(/^checklist\/([^/]+)\/confirmations\/([^/]+)$/);
    const checklistEdit = action.match(/^checklist\/([^/]+)\/edit$/);
    const checklistDelete = action.match(/^checklist\/([^/]+)\/delete$/);
    if (req.method === "POST" && checklistConfirmation) updateChecklistConfirmation(row, decodeURIComponent(checklistConfirmation[1]), decodeURIComponent(checklistConfirmation[2]), payload, ctx);
    else if (req.method === "POST" && checklistStatus) { assertLegacyAction(ctx, "checklist_admin"); updateChecklist(row, decodeURIComponent(checklistStatus[1]), payload, ctx); }
    else if (req.method === "POST" && action === "checklist") { assertLegacyAction(ctx, "checklist_add"); addChecklist(row, payload, ctx); }
    else if (req.method === "POST" && checklistEdit) { assertLegacyAction(ctx, "checklist_add"); editChecklist(row, decodeURIComponent(checklistEdit[1]), payload, ctx); }
    else if (req.method === "POST" && checklistDelete) { assertLegacyAction(ctx, "checklist_add"); deleteChecklist(row, decodeURIComponent(checklistDelete[1]), payload, ctx); }
    else if (req.method === "POST" && action === "execution-checklist-baseline/confirm") confirmExecutionBaseline(row, payload, ctx);
    else if (req.method === "POST" && action === "contract-baseline") { assertLegacyAction(ctx, "baseline"); saveBaseline(row, payload, ctx); }
    else if (req.method === "POST" && action === "receipts") { assertLegacyAction(ctx, "receipt"); addReceipt(row, payload, ctx); }
    else if (req.method === "POST" && action === "evidence-files") { assertLegacyAction(ctx, "evidence"); addEvidenceFile(row, payload, ctx); }
    else if (req.method === "POST" && action === "change-orders") { assertLegacyAction(ctx, "change_order"); addChangeOrder(row, payload, ctx); }
    else if (req.method === "POST" && action === "messages") { assertLegacyAction(ctx, "message"); addMessage(row, payload, ctx); }
    else return { status: 404, body: { code: "LEGACY_PARITY_ROUTE_NOT_FOUND", message: "Legacy parity route not found." } };
    return { status: action === "contract-baseline" || checklistStatus || checklistConfirmation || checklistEdit || checklistDelete || action === "execution-checklist-baseline/confirm" ? 200 : 201, body: { workspace: serialize(row) } };
  }

  return { contract, serialize, handle };
}

async function readJson(req, fail) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { fail("Request body must be valid JSON.", "INVALID_JSON"); }
}
