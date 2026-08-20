import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { connect as connectNet } from "node:net";
import { connect as connectTls } from "node:tls";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createLegacyParity } from "./legacy-parity.mjs";
import { inspectGeneratedImage } from "./ai-quality.mjs";
import { normalizeVisualEditOperation } from "./visual-editing.mjs";
import { generateAutoLayoutCandidates } from "./auto-layout-candidates.mjs";
import { validateViewSet, VIEWSET_SCHEMA_VERSION } from "./viewset-consistency.mjs";
import { mapBudget, searchCatalog, MATERIAL_CATALOG_VERSION } from "./material-catalog.mjs";
import { createProductionAdapters } from "./production-adapters.mjs";
import { authenticateOidcRequest } from "./oidc-auth.mjs";

const HOST = process.env.ISAFE_API_HOST || "127.0.0.1";
const PORT = Number(process.env.ISAFE_API_PORT || 4180);
const SCHEMA_VERSION = "20260722_R5_2";
const GOVERNANCE_VERSION = "20260820_R9_2_Consolidated";
const IMPLEMENTATION_BASELINE = "20260820_R9_2_Candidate_Implementation";
const SPATIAL_SCHEMA_VERSION = "StyleMatch.StructuredSpace/1.0";
const LAYOUT_SCHEMA_VERSION = "StyleMatch.AutoLayout/1.0";
const LAYOUT_RULE_VERSION = "AL01-rules-1.1";
const PROPOSAL_SNAPSHOT_SCHEMA_VERSION = "StyleMatch.ProposalSnapshot/1.0";
const HANDOFF_V2_SCHEMA_VERSION = "StyleMatch.GovernanceHandoff/2.0";
const HANDOFF_RECEIPT_SCHEMA_VERSION = "iSAFE.HandoffIntakeReceipt/2.0";
const CASE_PROPOSAL_SCHEMA_VERSION = "iSAFE.CaseCreationProposal/1.0";
const CASE_EXECUTION_SCHEMA_VERSION = "iSAFE.CaseCreationExecution/1.0";
const APPROVED_ASSET_SCHEMA_VERSION = "StyleMatch.ApprovedAsset/1.0";
const EXTERNAL_TOOL_CONNECTOR_SCHEMA_VERSION = "StyleMatch.ExternalToolConnector/1.0";
const LOCAL_ARTIFACT_SCHEMA_VERSIONS = {
  viewset: "StyleMatch.ApprovedViewSet/1.0",
  material_selection: "StyleMatch.MaterialSelection/1.0",
  external_scene: "StyleMatch.ExternalSceneReference/1.0",
};
const LOCAL_TOKEN = process.env.ISAFE_LOCAL_TOKEN || "local-dev-headquarter";
const DEFAULT_TENANT = "tenant_local_tigi";
const DEFAULT_ORGANIZATION = "org_local_headquarter";
const COMFYUI_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";
const COMFYUI_CHECKPOINT = process.env.COMFYUI_CHECKPOINT || "sd_xl_base_1.0.safetensors";
const COMFYUI_PYTHON = process.env.COMFYUI_PYTHON || "C:\\Users\\Kevin\\Desktop\\ComfyUI_windows_portable\\python_embeded\\python.exe";
const FLOORPLAN_PDFTOPPM = process.env.FLOORPLAN_PDFTOPPM || "C:\\Users\\Kevin\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin\\pdftoppm.exe";
const PANORAMA_WORKFLOW_VERSION = "stylematch-panorama-4dir-v1";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_PANORAMA_PRICE_ID = process.env.STRIPE_PANORAMA_PRICE_ID || "";
const OIDC_ISSUER = process.env.OIDC_ISSUER || "";
const OIDC_AUDIENCE = process.env.OIDC_AUDIENCE || "";
const TWCID_API_URL = process.env.TWCID_API_URL || "";
const DATABASE_TYPE = process.env.DATABASE_URL?.startsWith("postgres") ? "postgresql" : "sqlite";
const STYLEMATCH_APP_URL = process.env.STYLEMATCH_APP_URL || "http://127.0.0.1:4175";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "";
const SMTP_ALLOW_INSECURE = process.env.SMTP_ALLOW_INSECURE === "true";
const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:3504",
  "http://localhost:3504",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "http://127.0.0.1:4174",
  "http://localhost:4174",
  "http://127.0.0.1:4175",
  "http://localhost:4175",
  "http://127.0.0.1:4191",
  "http://localhost:4191",
]);
const root = dirname(fileURLToPath(import.meta.url));
const panoramaWorkflowTemplate = JSON.parse(readFileSync(join(root, "workflows", `${PANORAMA_WORKFLOW_VERSION}.api.json`), "utf8"));
const stateMachine = JSON.parse(readFileSync(join(root, "..", "contracts", "isafe-state-machine-r5.2.json"), "utf8"));
const governanceRelease = JSON.parse(readFileSync(join(root, "..", "contracts", "tigi-r9.2-consolidated.json"), "utf8"));
const STEPS = stateMachine.stages.map((stage) => stage.key);
const STAGE_BY_KEY = new Map(stateMachine.stages.map((stage) => [stage.key, stage]));
const OUTCOMES = new Set(stateMachine.gate_outcomes);
const defaultDataDir = join(root, "data");
const dbPath = process.env.ISAFE_DB_PATH || join(defaultDataDir, "isafe.db");
const dataDir = process.env.ISAFE_DATA_DIR || (process.env.ISAFE_DB_PATH ? dirname(dbPath) : defaultDataDir);
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
db.exec(`
  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isafe_case_id TEXT NOT NULL UNIQUE,
    source_project_id TEXT,
    source_case_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    current_stage TEXT NOT NULL DEFAULT 'D1_design_preparation',
    gate_status TEXT NOT NULL DEFAULT 'D1_pending',
    risk_score INTEGER NOT NULL DEFAULT 88,
    stage_status TEXT,
    trace_id TEXT NOT NULL,
    source_payload TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS gate_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    stage TEXT NOT NULL,
    gate_status TEXT NOT NULL,
    actor TEXT NOT NULL,
    detail TEXT,
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    evidence_type TEXT NOT NULL,
    label TEXT,
    sha256 TEXT,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    detail TEXT,
    trace_id TEXT NOT NULL,
    source_log_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS payment_eligibilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    gate_stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_eligible',
    reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(case_id, gate_stage),
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS handovers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handover_id TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    journey_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    isafe_case_id TEXT NOT NULL,
    status TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS link_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    journey_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    isafe_case_id TEXT NOT NULL,
    handover_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS outbox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    event_version TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    producer TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    causation_id TEXT,
    idempotency_key TEXT NOT NULL,
    data TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS direct_intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    direct_intake_id TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    isafe_case_id TEXT NOT NULL,
    status TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ai_image_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ai_task_id TEXT NOT NULL UNIQUE,
    prompt_id TEXT,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    purpose TEXT NOT NULL,
    consent_ref TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    stylematch_project_id TEXT,
    case_code TEXT,
    prompt TEXT NOT NULL,
    negative_prompt TEXT NOT NULL,
    workflow_version TEXT NOT NULL,
    checkpoint TEXT NOT NULL,
    seed INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    status TEXT NOT NULL,
    output_filename TEXT,
    output_subfolder TEXT,
    output_type TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ai_download_entitlements (
    ai_task_id TEXT PRIMARY KEY,
    checkout_session_id TEXT UNIQUE,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    amount_total INTEGER,
    currency TEXT,
    paid_at TEXT,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stylematch_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stylematch_project_id TEXT NOT NULL UNIQUE,
    case_code TEXT,
    user_email TEXT,
    source_status TEXT,
    stage_status TEXT,
    service_option TEXT,
    house_type TEXT,
    room_layout TEXT,
    square_footage REAL,
    budget_range TEXT,
    trace_id TEXT,
    source_payload TEXT NOT NULL DEFAULT '{}',
    synced_at TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS stylematch_style_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    style_test_id TEXT NOT NULL UNIQUE,
    user_email TEXT,
    primary_style TEXT,
    secondary_style TEXT,
    trace_id TEXT,
    source_payload TEXT NOT NULL DEFAULT '{}',
    synced_at TEXT NOT NULL,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS stylematch_knowledge_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id TEXT NOT NULL UNIQUE,
    stylematch_project_id TEXT,
    case_code TEXT,
    query_text TEXT NOT NULL,
    answer TEXT,
    result_count INTEGER NOT NULL DEFAULT 0,
    top_sources TEXT NOT NULL DEFAULT '[]',
    source_payload TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stylematch_risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id TEXT NOT NULL UNIQUE,
    stylematch_project_id TEXT,
    case_code TEXT,
    risk_level TEXT NOT NULL,
    risk_score REAL,
    reasons TEXT NOT NULL DEFAULT '[]',
    source_payload TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stylematch_gate_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gate_event_id TEXT NOT NULL UNIQUE,
    stylematch_project_id TEXT,
    case_code TEXT,
    gate_key TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    source_payload TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stylematch_pgp_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pgp_id TEXT NOT NULL UNIQUE,
    stylematch_project_id TEXT,
    case_code TEXT,
    package_status TEXT NOT NULL DEFAULT 'draft',
    package_payload TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS structured_space_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'candidate',
    schema_version TEXT NOT NULL,
    floorplan_version TEXT NOT NULL,
    confidence REAL,
    payload TEXT NOT NULL,
    correction_refs TEXT NOT NULL DEFAULT '[]',
    checksum TEXT NOT NULL,
    parent_snapshot_id TEXT,
    approved_by TEXT,
    approved_at TEXT,
    requires_confirmation INTEGER NOT NULL DEFAULT 1,
    parser_metadata TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, stylematch_project_id, revision)
  );
  CREATE TABLE IF NOT EXISTS structured_space_corrections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correction_id TEXT NOT NULL UNIQUE,
    snapshot_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    before_value TEXT,
    after_value TEXT,
    reason TEXT,
    actor TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(snapshot_id) REFERENCES structured_space_snapshots(snapshot_id)
  );
  CREATE TABLE IF NOT EXISTS auto_layout_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    layout_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    structured_space_ref TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL,
    conceptual INTEGER NOT NULL DEFAULT 1,
    schema_version TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    placements TEXT NOT NULL,
    validation TEXT NOT NULL,
    score REAL NOT NULL DEFAULT 0,
    checksum TEXT NOT NULL,
    approved_by TEXT,
    approved_at TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, stylematch_project_id, revision),
    FOREIGN KEY(structured_space_ref) REFERENCES structured_space_snapshots(snapshot_id)
  );
  CREATE TABLE IF NOT EXISTS stylematch_proposal_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_snapshot_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'candidate',
    schema_version TEXT NOT NULL,
    structured_space_ref TEXT NOT NULL,
    approved_layout_ref TEXT NOT NULL,
    payload TEXT NOT NULL,
    checksum TEXT NOT NULL,
    parent_snapshot_id TEXT,
    approved_by TEXT,
    approved_at TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, stylematch_project_id, revision),
    FOREIGN KEY(structured_space_ref) REFERENCES structured_space_snapshots(snapshot_id),
    FOREIGN KEY(approved_layout_ref) REFERENCES auto_layout_candidates(layout_id)
  );
  CREATE TABLE IF NOT EXISTS governance_handoffs_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handoff_v2_id TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ready_for_intake',
    schema_version TEXT NOT NULL,
    manifest TEXT NOT NULL,
    manifest_checksum TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, idempotency_key)
  );
  CREATE TABLE IF NOT EXISTS governance_handoff_receipts_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id TEXT NOT NULL UNIQUE,
    handoff_v2_id TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'intake_received',
    schema_version TEXT NOT NULL,
    received_manifest_checksum TEXT NOT NULL,
    receipt_payload TEXT NOT NULL,
    receipt_checksum TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    received_by TEXT NOT NULL,
    received_at TEXT NOT NULL,
    FOREIGN KEY(handoff_v2_id) REFERENCES governance_handoffs_v2(handoff_v2_id)
  );
  CREATE TABLE IF NOT EXISTS isafe_case_creation_proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id TEXT NOT NULL UNIQUE,
    handoff_v2_id TEXT NOT NULL UNIQUE,
    receipt_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review',
    version INTEGER NOT NULL DEFAULT 1,
    schema_version TEXT NOT NULL,
    proposal_payload TEXT NOT NULL,
    reviewed_by TEXT,
    review_rationale TEXT,
    reviewed_at TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(handoff_v2_id) REFERENCES governance_handoffs_v2(handoff_v2_id),
    FOREIGN KEY(receipt_id) REFERENCES governance_handoff_receipts_v2(receipt_id)
  );
  CREATE TABLE IF NOT EXISTS isafe_case_creation_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id TEXT NOT NULL UNIQUE,
    proposal_id TEXT NOT NULL UNIQUE,
    handoff_v2_id TEXT NOT NULL,
    receipt_id TEXT NOT NULL,
    isafe_case_id TEXT NOT NULL UNIQUE,
    idempotency_key TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    schema_version TEXT NOT NULL,
    execution_payload TEXT NOT NULL,
    execution_checksum TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    executed_by TEXT NOT NULL,
    executed_at TEXT NOT NULL,
    FOREIGN KEY(proposal_id) REFERENCES isafe_case_creation_proposals(proposal_id),
    FOREIGN KEY(handoff_v2_id) REFERENCES governance_handoffs_v2(handoff_v2_id),
    FOREIGN KEY(receipt_id) REFERENCES governance_handoff_receipts_v2(receipt_id)
  );
  CREATE TABLE IF NOT EXISTS stylematch_approved_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL UNIQUE,
    logical_asset_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'candidate',
    schema_version TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    label TEXT NOT NULL,
    local_ref TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    checksum TEXT NOT NULL,
    parent_asset_id TEXT,
    approved_by TEXT,
    approved_at TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, stylematch_project_id, logical_asset_id, revision)
  );
  CREATE TABLE IF NOT EXISTS stylematch_local_artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artifact_id TEXT NOT NULL UNIQUE,
    logical_artifact_id TEXT NOT NULL,
    artifact_kind TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'candidate',
    schema_version TEXT NOT NULL,
    label TEXT NOT NULL,
    local_ref TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    checksum TEXT NOT NULL,
    parent_artifact_id TEXT,
    approved_by TEXT,
    approved_at TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, organization_id, stylematch_project_id, artifact_kind, logical_artifact_id, revision)
  );
  CREATE TABLE IF NOT EXISTS stylematch_external_tool_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    connection_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    external_project_ref TEXT NOT NULL,
    adapter_mode TEXT NOT NULL,
    connector_version TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS stylematch_external_tool_scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id TEXT NOT NULL UNIQUE,
    connection_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    stylematch_project_id TEXT NOT NULL,
    external_scene_ref TEXT NOT NULL,
    viewport_ref TEXT,
    camera TEXT NOT NULL,
    geometry_ref TEXT,
    material_refs TEXT NOT NULL DEFAULT '[]',
    structured_space_ref TEXT,
    checksum TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(connection_id) REFERENCES stylematch_external_tool_sessions(connection_id)
  );
  CREATE TABLE IF NOT EXISTS governance_decision_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_object_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    decision_type TEXT NOT NULL,
    outcome TEXT NOT NULL,
    rationale TEXT NOT NULL,
    source_refs TEXT NOT NULL DEFAULT '[]',
    authority_role TEXT NOT NULL,
    decided_by TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS governance_risk_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    risk_state_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    state TEXT NOT NULL,
    score REAL,
    reasons TEXT NOT NULL DEFAULT '[]',
    source_type TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    human_review_status TEXT NOT NULL DEFAULT 'pending',
    decision_object_id TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS governance_trigger_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_evaluation_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    rule_id TEXT NOT NULL,
    result TEXT NOT NULL,
    facts TEXT NOT NULL DEFAULT '{}',
    reason TEXT NOT NULL,
    pending_action TEXT,
    rule_version TEXT NOT NULL,
    human_review_status TEXT NOT NULL DEFAULT 'pending',
    decision_object_id TEXT,
    trace_id TEXT NOT NULL,
    evaluated_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS governance_trigger_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    condition_json TEXT NOT NULL DEFAULT '{}',
    outcome TEXT NOT NULL,
    pending_action TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(rule_id, version, tenant_id, organization_id)
  );
  CREATE TABLE IF NOT EXISTS governance_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'in_app',
    recipient_role TEXT NOT NULL DEFAULT 'reviewer',
    status TEXT NOT NULL DEFAULT 'queued',
    escalation_level INTEGER NOT NULL DEFAULT 0,
    policy_version TEXT NOT NULL,
    due_at TEXT,
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS governance_audit_outputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_output_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    output_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    payload TEXT NOT NULL,
    payload_sha256 TEXT NOT NULL,
    source_refs TEXT NOT NULL DEFAULT '[]',
    decision_object_id TEXT,
    signed_by TEXT,
    trace_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS external_governance_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_evaluation_id TEXT NOT NULL UNIQUE,
    case_id INTEGER NOT NULL,
    provider_id TEXT NOT NULL,
    evaluation_type TEXT NOT NULL,
    authority_classification TEXT NOT NULL DEFAULT 'advisory',
    input_sha256 TEXT NOT NULL,
    output_sha256 TEXT NOT NULL,
    result TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'pending',
    admitted_by TEXT,
    decision_object_id TEXT,
    trace_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(case_id) REFERENCES cases(id)
  );
  CREATE TABLE IF NOT EXISTS style_test_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL UNIQUE,
    style_test_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    result_payload TEXT NOT NULL,
    result_delivery_consent INTEGER NOT NULL,
    marketing_consent INTEGER NOT NULL DEFAULT 0,
    marketing_consent_status TEXT NOT NULL,
    privacy_notice_version TEXT NOT NULL,
    consent_recorded_at TEXT NOT NULL,
    retention_until TEXT NOT NULL,
    marketing_withdrawn_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS style_test_email_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id TEXT NOT NULL UNIQUE,
    lead_id TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    ai_task_ids TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL,
    provider_message_id TEXT,
    outbox_path TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(lead_id) REFERENCES style_test_leads(lead_id)
  );
`);

const productionAdapters = createProductionAdapters(db, {
  stripeSecretKey: STRIPE_SECRET_KEY,
  appUrl: STYLEMATCH_APP_URL,
  smtpConfigured: Boolean(SMTP_HOST && SMTP_FROM),
  oidcIssuer: OIDC_ISSUER,
  twcidApiUrl: TWCID_API_URL,
  databaseType: DATABASE_TYPE,
});

function ensureColumn(table, name, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((column) => column.name === name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
}

[
  ["tenant_id", "TEXT"], ["organization_id", "TEXT"], ["journey_id", "TEXT"],
  ["stylematch_project_id", "TEXT"], ["project_id", "TEXT"], ["handover_id", "TEXT"],
  ["correlation_id", "TEXT"], ["schema_version", `TEXT DEFAULT '${SCHEMA_VERSION}'`], ["version", "INTEGER DEFAULT 1"],
  ["intake_channel", "TEXT DEFAULT 'stylematch_handover'"], ["direct_intake_id", "TEXT"],
  ["migration_source_stage", "TEXT"], ["state_contract_version", `TEXT DEFAULT '${SCHEMA_VERSION}'`],
].forEach(([name, definition]) => ensureColumn("cases", name, definition));
[
  ["gate_decision_id", "TEXT"], ["outcome", "TEXT"], ["reason", "TEXT"], ["rule_version", "TEXT"],
  ["before_version", "INTEGER"], ["after_version", "INTEGER"], ["idempotency_key", "TEXT"],
].forEach(([name, definition]) => ensureColumn("gate_states", name, definition));
[
  ["evidence_id", "TEXT"], ["created_by", "TEXT"], ["version", "INTEGER DEFAULT 1"],
  ["permission_scope", "TEXT"], ["retention_policy", "TEXT"], ["legal_hold", "INTEGER DEFAULT 0"],
  ["step_key", "TEXT"], ["rule_version", "TEXT"], ["schema_version", `TEXT DEFAULT '${SCHEMA_VERSION}'`],
  ["object_ref", "TEXT"], ["trace_id", "TEXT"],
].forEach(([name, definition]) => ensureColumn("evidence", name, definition));
[
  ["eligibility_id", "TEXT"], ["milestone_id", "TEXT"], ["contract_baseline_ref", "TEXT"],
  ["gate_decision_id", "TEXT"], ["evidence_refs", "TEXT"], ["confirmed_by", "TEXT"],
  ["effective_at", "TEXT"], ["expires_at", "TEXT"], ["schema_version", `TEXT DEFAULT '${SCHEMA_VERSION}'`],
].forEach(([name, definition]) => ensureColumn("payment_eligibilities", name, definition));
[
  ["style_id", "TEXT"], ["style_catalog_version", "TEXT"], ["source_media_count", "INTEGER DEFAULT 0"],
  ["requested_output_type", "TEXT DEFAULT 'perspective_draft'"], ["quality_report", "TEXT"],
  ["operation_metadata", "TEXT"], ["output_sha256", "TEXT"],
].forEach(([name, definition]) => ensureColumn("ai_image_tasks", name, definition));
[
  ["requires_confirmation", "INTEGER NOT NULL DEFAULT 1"],
  ["parser_metadata", "TEXT NOT NULL DEFAULT '{}'"],
].forEach(([name, definition]) => ensureColumn("structured_space_snapshots", name, definition));
[
  ["score", "REAL NOT NULL DEFAULT 0"],
  ["approved_by", "TEXT"],
  ["approved_at", "TEXT"],
].forEach(([name, definition]) => ensureColumn("auto_layout_candidates", name, definition));

for (const row of db.prepare("SELECT id,isafe_case_id,source_project_id,trace_id,tenant_id,organization_id,journey_id,stylematch_project_id,project_id,handover_id,correlation_id,schema_version,version,intake_channel FROM cases").all()) {
  db.prepare("UPDATE cases SET tenant_id=?,organization_id=?,journey_id=?,stylematch_project_id=?,project_id=?,handover_id=?,correlation_id=?,schema_version=?,version=? WHERE id=?")
    .run(
      row.tenant_id || DEFAULT_TENANT,
      row.organization_id || DEFAULT_ORGANIZATION,
      row.journey_id || `journey_legacy_${row.id}`,
      row.intake_channel === "isafe_direct" ? null : (row.stylematch_project_id || row.source_project_id || `stylematch_legacy_${row.id}`),
      row.project_id || `project_legacy_${row.id}`,
      row.intake_channel === "isafe_direct" ? null : (row.handover_id || `handover_legacy_${row.id}`),
      row.correlation_id || row.trace_id,
      row.schema_version || SCHEMA_VERSION,
      row.version || 1,
      row.id,
    );
}
for (const row of db.prepare("SELECT id,evidence_id,created_by,permission_scope,retention_policy,step_key,rule_version,schema_version,object_ref,trace_id,sha256,metadata FROM evidence").all()) {
  db.prepare("UPDATE evidence SET evidence_id=?,created_by=?,permission_scope=?,retention_policy=?,step_key=?,rule_version=?,schema_version=?,object_ref=?,trace_id=?,sha256=? WHERE id=?")
    .run(row.evidence_id || `evidence_legacy_${row.id}`, row.created_by || "legacy-import", row.permission_scope || "case_participants", row.retention_policy || "project_lifecycle_plus_7_years", row.step_key || "D1_intake", row.rule_version || SCHEMA_VERSION, row.schema_version || SCHEMA_VERSION, row.object_ref || `legacy://evidence/${row.id}`, row.trace_id || `tr_legacy_${row.id}`, row.sha256 || createHash("sha256").update(row.metadata || String(row.id)).digest("hex"), row.id);
}

const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}_${randomUUID()}`;
const parseJson = (value, fallback = {}) => { try { return JSON.parse(value); } catch { return fallback; } };
const sha256 = (value) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");

function migrateLegacyStateMachine() {
  const mapping = stateMachine.legacy_stage_mapping;
  const rows = db.prepare("SELECT id,isafe_case_id,current_stage,intake_channel,migration_source_stage FROM cases").all();
  for (const row of rows) {
    if (!mapping[row.current_stage]) continue;
    const nextStage = row.current_stage === "D1_intake" && row.intake_channel === "isafe_direct"
      ? "INTAKE_pending"
      : mapping[row.current_stage];
    const at = now();
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE cases SET current_stage=?,gate_status='migration_review_required',migration_source_stage=COALESCE(migration_source_stage,?),state_contract_version=?,schema_version=?,version=COALESCE(version,1)+1,updated_at=? WHERE id=?")
        .run(nextStage, row.current_stage, SCHEMA_VERSION, SCHEMA_VERSION, at, row.id);
      db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)")
        .run(row.id, "state_machine.migrated", "system-migration", `${row.current_stage} -> ${nextStage}; human review required`, `migration_${SCHEMA_VERSION}`, at);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  }
  db.prepare("UPDATE payment_eligibilities SET status='revoked',reason=?,updated_at=?,schema_version=? WHERE status='eligible' AND (milestone_id IS NULL OR contract_baseline_ref IS NULL OR gate_decision_id IS NULL)")
    .run("Revoked by R5.2 migration: Gate completion alone is not a contractual payment milestone.", now(), SCHEMA_VERSION);
}

migrateLegacyStateMachine();

function requestContext(req) {
  const claims = req.oidcClaims || {};
  return {
    tenant_id: claims.tenant_id || req.headers["x-tenant-id"] || DEFAULT_TENANT,
    organization_id: claims.organization_id || req.headers["x-organization-id"] || DEFAULT_ORGANIZATION,
    user_id: claims.sub || req.headers["x-user-id"] || "local-admin",
    member_tier: claims.member_tier || req.headers["x-member-tier"] || "headquarter",
    certified_member_type: req.headers["x-certified-member-type"] || null,
    case_role: claims.role || req.headers["x-case-role"] || "reviewer",
    server_role: claims.server_role || req.headers["x-server-role"] || null,
    case_authorization: claims.case_authorization || req.headers["x-case-authorization"] || null,
    purpose: req.headers["x-purpose"] || "local_trial",
    consent_ref: req.headers["x-consent-ref"] || "consent_local_trial",
    trace_id: req.headers["x-trace-id"] || uid("tr"),
    idempotency_key: req.headers["idempotency-key"] || uid("idem"),
  };
}

function assertRequestContext(req, requireIdempotency = false) {
  if (req.oidcClaims) {
    if (requireIdempotency && !String(req.headers["idempotency-key"] || "").trim()) fail("Idempotency-Key is required for writes.", "REQUEST_CONTEXT_REQUIRED", 400, { missing_headers: ["idempotency-key"] });
    return;
  }
  const required = ["x-tenant-id", "x-organization-id", "x-purpose", "x-consent-ref", "x-trace-id"];
  if (requireIdempotency) required.push("idempotency-key");
  const missing = required.filter((name) => !String(req.headers[name] || "").trim());
  if (missing.length) fail("Required request context is incomplete.", "REQUEST_CONTEXT_REQUIRED", 400, { missing_headers: missing });
}

function assertCaseRequestContext(req) {
  if (req.oidcClaims?.server_role === "headquarter" && (req.oidcClaims.case_authorization || req.headers["x-case-authorization"])) return;
  const missing = ["x-server-role", "x-case-role", "x-case-authorization"]
    .filter((name) => !String(req.headers[name] || "").trim());
  if (missing.length) fail("Server role and case authorization are required.", "CASE_AUTHORIZATION_REQUIRED", 403, { missing_headers: missing });
  if (req.headers["x-server-role"] !== "headquarter") {
    fail("Server role is not authorized for the local case API.", "SERVER_ROLE_FORBIDDEN", 403);
  }
}

function authorizedCaseRefs(ctx) {
  return new Set(String(ctx.case_authorization || "").split(",").map((value) => value.trim()).filter(Boolean));
}

function assertCaseAuthorization(id, ctx) {
  const refs = authorizedCaseRefs(ctx);
  if (refs.has("*") && ctx.server_role === "headquarter") return;
  const row = getCaseRow(id);
  if (!row || (!refs.has(row.isafe_case_id) && !refs.has(row.source_case_code))) {
    fail("Case authorization does not include this case.", "CASE_ACCESS_FORBIDDEN", 403);
  }
}

function assertStyleMatchCaseAuthorization(caseCode, ctx) {
  if (!caseCode) return;
  const refs = authorizedCaseRefs(ctx);
  if ((refs.has("*") && ctx.server_role === "headquarter") || refs.has(caseCode)) return;
  fail("Case authorization does not include this StyleMatch case.", "CASE_ACCESS_FORBIDDEN", 403);
}

function assertAiTaskAuthorization(aiTaskId, ctx) {
  const task = db.prepare("SELECT case_code FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId);
  if (!task) fail("AI image task not found.", "AI_TASK_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(task.case_code, ctx);
}

function assertWriteAccess(req) {
  if (req.oidcClaims) return;
  if (req.headers.authorization !== `Bearer ${LOCAL_TOKEN}`) {
    const error = new Error("Local write authorization failed.");
    error.status = 401;
    error.code = "AUTHORIZATION_REQUIRED";
    throw error;
  }
}

function assertMemberTier(ctx, allowed, action) {
  if (!allowed.includes(ctx.member_tier)) {
    fail("This membership cannot perform the requested action.", "MEMBERSHIP_ACTION_FORBIDDEN", 403, { action, member_tier: ctx.member_tier });
  }
}

const STRUCTURED_SPACE_COLLECTIONS = ["rooms", "walls", "openings", "dimensions", "fixtures", "furniture", "zones"];

function normalizeStructuredSpace(payload) {
  const space = payload.structured_space || payload;
  const normalized = {
    units: space.units || "mm",
    coordinate_system: space.coordinate_system || "floorplan_2d",
    source_assets: Array.isArray(space.source_assets) ? space.source_assets : [],
    circulation_graph: space.circulation_graph || { nodes: [], edges: [] },
    clearance_profiles: space.clearance_profiles || {},
  };
  for (const key of STRUCTURED_SPACE_COLLECTIONS) normalized[key] = Array.isArray(space[key]) ? space[key] : [];
  return normalized;
}

function serializeStructuredSpace(row) {
  return row ? {
    snapshot_id: row.snapshot_id,
    stylematch_project_id: row.stylematch_project_id,
    revision: row.revision,
    status: row.status,
    schema_version: row.schema_version,
    floorplan_version: row.floorplan_version,
    confidence: row.confidence,
    structured_space: parseJson(row.payload),
    correction_refs: parseJson(row.correction_refs, []),
    checksum: row.checksum,
    parent_snapshot_id: row.parent_snapshot_id,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    requires_confirmation: Boolean(row.requires_confirmation),
    parser: parseJson(row.parser_metadata),
    trace_id: row.trace_id,
    created_by: row.created_by,
    created_at: row.created_at,
    state_transition_applied: false,
  } : null;
}

function listStructuredSpaces(projectId, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM structured_space_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializeStructuredSpace);
}

function createStructuredSpace(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  const floorplanVersion = String(payload.floorplan_version || "").trim();
  if (!floorplanVersion) fail("floorplan_version is required.", "STRUCTURED_SPACE_FLOORPLAN_REQUIRED");
  const structuredSpace = normalizeStructuredSpace(payload);
  const previous = db.prepare("SELECT * FROM structured_space_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, projectId);
  const revision = Number(previous?.revision || 0) + 1;
  const snapshotId = uid("space");
  const at = now();
  const canonicalPayload = { schema_version: SPATIAL_SCHEMA_VERSION, floorplan_version: floorplanVersion, structured_space: structuredSpace };
  const checksum = sha256(canonicalPayload);
  db.prepare(`INSERT INTO structured_space_snapshots
    (snapshot_id,tenant_id,organization_id,stylematch_project_id,revision,status,schema_version,floorplan_version,confidence,payload,correction_refs,checksum,parent_snapshot_id,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,'candidate',?,?,?,?,'[]',?,?,?,?,?)`)
    .run(snapshotId, ctx.tenant_id, ctx.organization_id, projectId, revision, SPATIAL_SCHEMA_VERSION, floorplanVersion,
      payload.confidence == null ? null : Number(payload.confidence), JSON.stringify(structuredSpace), checksum,
      previous?.snapshot_id || null, ctx.trace_id, ctx.user_id, at);
  db.prepare("UPDATE structured_space_snapshots SET parser_metadata=?,requires_confirmation=1 WHERE snapshot_id=?")
    .run(JSON.stringify(payload.parser || { adapter: "human_seed", adapter_version: "SS01-manual-1.0", mode: "human_seed" }), snapshotId);
  return serializeStructuredSpace(db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=?").get(snapshotId));
}

async function parseFloorplan(projectId, payload, ctx) {
  const floorplanRef = String(payload.floorplan_ref || "").trim();
  if (!floorplanRef) fail("floorplan_ref is required.", "FLOORPLAN_REF_REQUIRED");
  const hints = payload.hints || {};
  let localVisionError = null;
  if (floorplanRef.startsWith("data:") || /^https?:\/\//.test(floorplanRef)) {
    try {
      const response = await fetch(floorplanRef);
      if (!response.ok) throw new Error(`Floorplan source could not be read (${response.status}).`);
      const contentType = response.headers.get("content-type") || "";
      const supported = contentType.startsWith("image/") || contentType.includes("pdf");
      if (!supported) throw new Error(`Unsupported floorplan content type: ${contentType || "unknown"}.`);
      const parseId = uid("floorparse");
      const parseDir = join(dataDir, "floorplan-parses", parseId);
      mkdirSync(parseDir, { recursive: true });
      const extension = contentType.includes("pdf") ? "pdf" : contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const sourcePath = join(parseDir, `source.${extension}`);
      writeFileSync(sourcePath, Buffer.from(await response.arrayBuffer()));
      let imagePath = sourcePath;
      if (extension === "pdf") {
        const renderPrefix = join(parseDir, "page");
        const rendered = spawnSync(FLOORPLAN_PDFTOPPM, ["-f", "1", "-singlefile", "-png", "-r", "150", sourcePath, renderPrefix], { encoding: "utf8", timeout: 120000, windowsHide: true });
        if (rendered.error || rendered.status !== 0) throw new Error(rendered.error?.message || rendered.stderr || "PDF floorplan rendering failed.");
        imagePath = `${renderPrefix}.png`;
      }
      const outputPath = join(parseDir, "geometry.json");
      const parserScript = join(root, "scripts", "parse_floorplan_geometry.py");
      const mmPerPixel = Number(hints.mm_per_pixel) > 0 ? Number(hints.mm_per_pixel) : 10;
      const parsed = spawnSync(COMFYUI_PYTHON, [parserScript, "--input", imagePath, "--output", outputPath, "--mm-per-pixel", String(mmPerPixel), "--primary-room-name", String(hints.primary_room_name || "待確認空間")], { cwd: root, encoding: "utf8", timeout: 120000, windowsHide: true });
      if (parsed.error || parsed.status !== 0) throw new Error(parsed.error?.message || parsed.stderr || "Local floorplan geometry parsing failed.");
      const geometry = JSON.parse(readFileSync(outputPath, "utf8"));
      geometry.source_assets[0].original_media_type = contentType;
      geometry.source_assets[0].local_evidence_ref = `local://floorplan-parses/${parseId}/${extension === "pdf" ? "page.png" : `source.${extension}`}`;
      const snapshot = createStructuredSpace(projectId, {
        floorplan_version: payload.floorplan_version || `sha256:${geometry.parser.source_ref_sha256}`,
        confidence: geometry.confidence,
        units: "mm",
        coordinate_system: hints.mm_per_pixel ? "floorplan_2d_scaled" : "floorplan_2d_estimated_scale",
        source_assets: geometry.source_assets,
        rooms: geometry.rooms, walls: geometry.walls, openings: geometry.openings, dimensions: geometry.dimensions,
        fixtures: geometry.fixtures, furniture: geometry.furniture, zones: geometry.zones,
        circulation_graph: geometry.circulation_graph, parser: geometry.parser,
      }, ctx);
      db.prepare("UPDATE structured_space_snapshots SET requires_confirmation=1,parser_metadata=? WHERE snapshot_id=?")
        .run(JSON.stringify(geometry.parser), snapshot.snapshot_id);
      return serializeStructuredSpace(db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=?").get(snapshot.snapshot_id));
    } catch (error) {
      localVisionError = error.message;
    }
  }
  const roomNames = Array.isArray(hints.room_names) && hints.room_names.length ? hints.room_names : [hints.primary_room_name || "待確認空間"];
  const confidence = Math.min(0.35, Math.max(0, Number(payload.confidence_hint || 0.28)));
  const rooms = roomNames.map((name, index) => ({
    id: `room-${index + 1}`,
    name: String(name),
    area_sqm: index === 0 && Number.isFinite(Number(hints.area_sqm)) ? Number(hints.area_sqm) : null,
    confidence,
    source: "offline_fallback",
  }));
  const snapshot = createStructuredSpace(projectId, {
    floorplan_version: payload.floorplan_version || `sha256:${sha256(floorplanRef)}`,
    confidence,
    units: hints.units || "mm",
    coordinate_system: "floorplan_2d",
    source_assets: [{ asset_id: "floorplan-source-1", media_type: "reference", sha256: sha256(floorplanRef), source_ref: floorplanRef.startsWith("data:") ? "inline_data_url" : floorplanRef }], rooms,
    walls: [], openings: [], dimensions: [], fixtures: [], furniture: [], zones: [],
    circulation_graph: { nodes: rooms.map((room) => room.id), edges: [] },
  }, ctx);
  const parser = {
    adapter: "offline_floorplan_metadata_heuristic",
    adapter_version: "SS01-parser-0.1",
    mode: "offline_fallback",
    confidence_cap: 0.35,
    source_ref_sha256: sha256(floorplanRef),
    warnings: [localVisionError ? `Local vision parser fallback: ${localVisionError}` : "The source was not an image/PDF readable by the local parser.", "Geometry, dimensions, walls and openings require human confirmation."],
  };
  db.prepare("UPDATE structured_space_snapshots SET requires_confirmation=1,parser_metadata=? WHERE snapshot_id=?")
    .run(JSON.stringify(parser), snapshot.snapshot_id);
  return serializeStructuredSpace(db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=?").get(snapshot.snapshot_id));
}

function approveStructuredSpace(snapshotId, payload, ctx) {
  const row = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=?")
    .get(snapshotId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("StructuredSpace snapshot not found.", "STRUCTURED_SPACE_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  if (payload.expected_revision !== row.revision) fail("StructuredSpace revision conflict.", "VERSION_CONFLICT", 409, { expected_revision: payload.expected_revision, actual_revision: row.revision });
  db.prepare("UPDATE structured_space_snapshots SET status='superseded' WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved'")
    .run(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id);
  db.prepare("UPDATE structured_space_snapshots SET status='approved',approved_by=?,approved_at=?,requires_confirmation=0 WHERE snapshot_id=?")
    .run(ctx.user_id, now(), snapshotId);
  return serializeStructuredSpace(db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=?").get(snapshotId));
}

function correctStructuredSpace(snapshotId, payload, ctx) {
  const source = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=?")
    .get(snapshotId, ctx.tenant_id, ctx.organization_id);
  if (!source) fail("StructuredSpace snapshot not found.", "STRUCTURED_SPACE_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(source.stylematch_project_id, ctx);
  const latest = db.prepare("SELECT * FROM structured_space_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, source.stylematch_project_id);
  if (source.snapshot_id !== latest.snapshot_id || Number(payload.expected_revision) !== source.revision) {
    fail("Corrections must target the latest StructuredSpace revision.", "VERSION_CONFLICT", 409, { expected_revision: payload.expected_revision, actual_revision: latest.revision, latest_snapshot_id: latest.snapshot_id });
  }
  const entityType = String(payload.entity_type || "").trim();
  const entityId = String(payload.entity_id || "").trim();
  const operation = String(payload.operation || "upsert").trim();
  if (!STRUCTURED_SPACE_COLLECTIONS.includes(entityType)) fail("Unsupported StructuredSpace entity type.", "STRUCTURED_SPACE_ENTITY_TYPE_INVALID");
  if (!entityId) fail("entity_id is required.", "STRUCTURED_SPACE_ENTITY_ID_REQUIRED");
  if (!["upsert", "delete"].includes(operation)) fail("operation must be upsert or delete.", "STRUCTURED_SPACE_OPERATION_INVALID");
  const structuredSpace = normalizeStructuredSpace(parseJson(source.payload));
  const collection = structuredSpace[entityType];
  const index = collection.findIndex((entity) => entity?.id === entityId);
  const beforeValue = index >= 0 ? collection[index] : null;
  if (operation === "delete") {
    if (index < 0) fail("StructuredSpace entity not found.", "STRUCTURED_SPACE_ENTITY_NOT_FOUND", 404);
    collection.splice(index, 1);
  } else {
    const afterValue = { ...(beforeValue || {}), ...(payload.value || {}), id: entityId };
    if (index >= 0) collection[index] = afterValue; else collection.push(afterValue);
  }
  const correctionId = uid("correction");
  const nextSnapshotId = uid("space");
  const revision = source.revision + 1;
  const at = now();
  const afterValue = operation === "delete" ? null : collection.find((entity) => entity?.id === entityId);
  const correctionRefs = [...parseJson(source.correction_refs, []), correctionId];
  const canonicalPayload = { schema_version: SPATIAL_SCHEMA_VERSION, floorplan_version: source.floorplan_version, structured_space: structuredSpace };
  const checksum = sha256(canonicalPayload);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO structured_space_snapshots
      (snapshot_id,tenant_id,organization_id,stylematch_project_id,revision,status,schema_version,floorplan_version,confidence,payload,correction_refs,checksum,parent_snapshot_id,trace_id,created_by,created_at)
      VALUES (?,?,?,?,?,'candidate',?,?,?,?,?,?,?,?,?,?)`)
      .run(nextSnapshotId, ctx.tenant_id, ctx.organization_id, source.stylematch_project_id, revision, SPATIAL_SCHEMA_VERSION,
        source.floorplan_version, payload.confidence == null ? source.confidence : Number(payload.confidence), JSON.stringify(structuredSpace),
        JSON.stringify(correctionRefs), checksum, source.snapshot_id, ctx.trace_id, ctx.user_id, at);
    db.prepare("UPDATE structured_space_snapshots SET parser_metadata=?,requires_confirmation=1 WHERE snapshot_id=?")
      .run(JSON.stringify({ adapter: "human_correction", adapter_version: "SS01-correction-1.0", mode: "human_seed", source_parser: parseJson(source.parser_metadata) }), nextSnapshotId);
    db.prepare(`INSERT INTO structured_space_corrections
      (correction_id,snapshot_id,entity_type,entity_id,operation,before_value,after_value,reason,actor,trace_id,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(correctionId, nextSnapshotId, entityType, entityId, operation, beforeValue == null ? null : JSON.stringify(beforeValue),
        afterValue == null ? null : JSON.stringify(afterValue), payload.reason || null, ctx.user_id, ctx.trace_id, at);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return {
    snapshot: serializeStructuredSpace(db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=?").get(nextSnapshotId)),
    correction: { correction_id: correctionId, entity_type: entityType, entity_id: entityId, operation, before_value: beforeValue, after_value: afterValue, reason: payload.reason || null, actor: ctx.user_id, created_at: at },
  };
}

function validRect(rect) {
  return rect && ["x", "y", "width", "depth"].every((key) => Number.isFinite(Number(rect[key]))) && Number(rect.width) > 0 && Number(rect.depth) > 0;
}

function overlaps(a, b) {
  return Number(a.x) < Number(b.x) + Number(b.width)
    && Number(a.x) + Number(a.width) > Number(b.x)
    && Number(a.y) < Number(b.y) + Number(b.depth)
    && Number(a.y) + Number(a.depth) > Number(b.y);
}

function containedBy(inner, outer) {
  return Number(inner.x) >= Number(outer.x) && Number(inner.y) >= Number(outer.y)
    && Number(inner.x) + Number(inner.width) <= Number(outer.x) + Number(outer.width)
    && Number(inner.y) + Number(inner.depth) <= Number(outer.y) + Number(outer.depth);
}

function rotatedBounds(rect) {
  const rotation = Number(rect.rotation || 0);
  const radians = (rotation * Math.PI) / 180;
  const width = Number(rect.width);
  const depth = Number(rect.depth);
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(depth * Math.sin(radians));
  const rotatedDepth = Math.abs(width * Math.sin(radians)) + Math.abs(depth * Math.cos(radians));
  return { ...rect, x: Number(rect.x) + width / 2 - rotatedWidth / 2, y: Number(rect.y) + depth / 2 - rotatedDepth / 2, width: rotatedWidth, depth: rotatedDepth, rotation };
}

function placementPolygon(rect) {
  const x = Number(rect.x); const y = Number(rect.y); const width = Number(rect.width); const depth = Number(rect.depth);
  const centerX = x + width / 2; const centerY = y + depth / 2; const radians = (Number(rect.rotation || 0) * Math.PI) / 180;
  return [[-width / 2, -depth / 2], [width / 2, -depth / 2], [width / 2, depth / 2], [-width / 2, depth / 2]].map(([dx, dy]) => [
    centerX + dx * Math.cos(radians) - dy * Math.sin(radians),
    centerY + dx * Math.sin(radians) + dy * Math.cos(radians),
  ]);
}

function validPolygon(polygon) {
  return Array.isArray(polygon) && polygon.length >= 3 && polygon.every((point) => Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])));
}

function pointOnSegment(point, left, right) {
  const cross = (Number(point[1]) - Number(left[1])) * (Number(right[0]) - Number(left[0])) - (Number(point[0]) - Number(left[0])) * (Number(right[1]) - Number(left[1]));
  if (Math.abs(cross) > 0.001) return false;
  return Number(point[0]) >= Math.min(Number(left[0]), Number(right[0])) - 0.001 && Number(point[0]) <= Math.max(Number(left[0]), Number(right[0])) + 0.001
    && Number(point[1]) >= Math.min(Number(left[1]), Number(right[1])) - 0.001 && Number(point[1]) <= Math.max(Number(left[1]), Number(right[1])) + 0.001;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    if (pointOnSegment(point, polygon[previous], polygon[current])) return true;
    const xi = Number(polygon[current][0]); const yi = Number(polygon[current][1]);
    const xj = Number(polygon[previous][0]); const yj = Number(polygon[previous][1]);
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function containedByPolygon(rect, polygon) {
  const corners = placementPolygon(rect);
  const samples = [...corners, ...corners.map((point, index) => [(point[0] + corners[(index + 1) % corners.length][0]) / 2, (point[1] + corners[(index + 1) % corners.length][1]) / 2])];
  return samples.every((point) => pointInPolygon(point, polygon));
}

function expandedRect(rect, amount) {
  return { x: Number(rect.x) - amount, y: Number(rect.y) - amount, width: Number(rect.width) + amount * 2, depth: Number(rect.depth) + amount * 2 };
}

function circulationPathZones(structuredSpace) {
  const width = Number(structuredSpace.clearance_profiles?.circulation_width_mm || 0);
  if (!(width > 0)) return [];
  return (structuredSpace.circulation_graph?.edges || []).flatMap((edge, edgeIndex) => {
    const path = Array.isArray(edge.path) ? edge.path : [];
    return path.slice(1).map((point, index) => {
      const previous = path[index]; const x1 = Number(previous?.[0]); const y1 = Number(previous?.[1]); const x2 = Number(point?.[0]); const y2 = Number(point?.[1]);
      if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
      return { id: `${edge.id || `edge-${edgeIndex}`}-segment-${index}`, room_id: edge.room_id, type: "circulation", bounds: { x: Math.min(x1, x2) - width / 2, y: Math.min(y1, y2) - width / 2, width: Math.abs(x2 - x1) + width, depth: Math.abs(y2 - y1) + width } };
    }).filter(Boolean);
  });
}

function validateLayoutGeometry(structuredSpace, placements, context = {}) {
  const hardViolations = [];
  const warnings = [];
  const sourcePlacements = placements.map((placement) => ({ ...placement, x: Number(placement.x), y: Number(placement.y), width: Number(placement.width), depth: Number(placement.depth), rotation: Number(placement.rotation || 0) }));
  const normalized = sourcePlacements.map(rotatedBounds);
  const rooms = new Map(structuredSpace.rooms.map((room) => [room.id, room]));
  for (let placementIndex = 0; placementIndex < normalized.length; placementIndex += 1) {
    const placement = normalized[placementIndex]; const sourcePlacement = sourcePlacements[placementIndex];
    if (!placement.id || !placement.room_id || !validRect(placement)) {
      hardViolations.push({ code: "PLACEMENT_GEOMETRY_INVALID", placement_id: placement.id || null, message: "Placement requires id, room_id and positive rectangle geometry." });
      continue;
    }
    const room = rooms.get(placement.room_id);
    if (!room) {
      hardViolations.push({ code: "ROOM_REFERENCE_INVALID", placement_id: placement.id, room_id: placement.room_id, message: "Placement references an unknown room." });
    } else if (validPolygon(room.polygon)) {
      if (!containedByPolygon(sourcePlacement, room.polygon)) hardViolations.push({ code: "OUTSIDE_ROOM_POLYGON", placement_id: placement.id, room_id: room.id, message: "Placement extends outside the room polygon." });
    } else if (!validRect(room.bounds)) {
      warnings.push({ code: "ROOM_BOUNDS_UNKNOWN", room_id: room.id, message: "Room bounds are missing; containment was not evaluated." });
    } else if (!containedBy(placement, room.bounds)) {
      hardViolations.push({ code: "OUTSIDE_ROOM_BOUNDS", placement_id: placement.id, room_id: room.id, message: "Placement extends outside room bounds." });
    }
  }
  for (let left = 0; left < normalized.length; left += 1) {
    if (!validRect(normalized[left])) continue;
    for (let right = left + 1; right < normalized.length; right += 1) {
      if (normalized[left].room_id === normalized[right].room_id && validRect(normalized[right]) && overlaps(normalized[left], normalized[right])) {
        hardViolations.push({ code: "PLACEMENT_COLLISION", placement_ids: [normalized[left].id, normalized[right].id], message: "Furniture placements overlap." });
      }
    }
  }
  for (const opening of structuredSpace.openings) {
    const openingDepth = Number(opening.clearance_depth_mm || structuredSpace.clearance_profiles?.opening_depth_mm || 0);
    const clearance = validRect(opening.clearance) ? opening.clearance : validRect(opening.bounds) && openingDepth > 0 ? expandedRect(opening.bounds, openingDepth) : null;
    if (!validRect(clearance)) {
      warnings.push({ code: "OPENING_CLEARANCE_UNKNOWN", opening_id: opening.id, message: "Opening clearance geometry is missing." });
      continue;
    }
    for (const placement of normalized) {
      if ((!opening.room_id || opening.room_id === placement.room_id) && validRect(placement) && overlaps(placement, clearance)) {
        hardViolations.push({ code: "OPENING_CLEARANCE_BLOCKED", opening_id: opening.id, placement_id: placement.id, message: "Placement blocks a door or opening clearance zone." });
      }
    }
  }
  const circulationZones = [...structuredSpace.zones.filter((zone) => zone.type === "circulation"), ...circulationPathZones(structuredSpace)];
  if (!circulationZones.length) warnings.push({ code: "CIRCULATION_DATA_MISSING", message: "No circulation zones were supplied." });
  for (const zone of circulationZones) {
    if (!validRect(zone.bounds)) { warnings.push({ code: "CIRCULATION_GEOMETRY_UNKNOWN", zone_id: zone.id, message: "Circulation zone geometry is missing." }); continue; }
    for (const placement of normalized) if ((!zone.room_id || zone.room_id === placement.room_id) && validRect(placement) && overlaps(placement, zone.bounds)) {
      hardViolations.push({ code: "CIRCULATION_BLOCKED", zone_id: zone.id, placement_id: placement.id, message: "Placement blocks a required circulation zone." });
    }
  }
  const available = new Set(normalized.flatMap((item) => [item.id, item.catalog_id, item.category, ...(item.tags || [])].filter(Boolean).map(String)));
  for (const required of Array.isArray(context.must_have) ? context.must_have : []) if (!available.has(String(required))) {
    hardViolations.push({ code: "MUST_HAVE_MISSING", requirement: String(required), message: "A required furniture item or feature is missing." });
  }
  for (const avoided of Array.isArray(context.avoid) ? context.avoid : []) if (available.has(String(avoided))) {
    hardViolations.push({ code: "AVOID_ITEM_PRESENT", requirement: String(avoided), message: "An explicitly avoided furniture item or feature is present." });
  }
  const score = Math.max(0, 100 - hardViolations.length * 30 - warnings.length * 5);
  return { valid: hardViolations.length === 0, hard_violations: hardViolations, warnings, score, rule_version: LAYOUT_RULE_VERSION };
}

function serializeAutoLayout(row) {
  return row ? { layout_id: row.layout_id, stylematch_project_id: row.stylematch_project_id, structured_space_ref: row.structured_space_ref,
    revision: row.revision, status: row.status, conceptual: Boolean(row.conceptual), schema_version: row.schema_version,
    rule_version: row.rule_version, placements: parseJson(row.placements, []), validation: parseJson(row.validation), score: Number(row.score || 0), checksum: row.checksum,
    approved_by: row.approved_by, approved_at: row.approved_at, trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at, state_transition_applied: false } : null;
}

function createAutoLayout(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  const space = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.structured_space_ref, ctx.tenant_id, ctx.organization_id, projectId);
  if (!space) fail("StructuredSpace snapshot not found for this project.", "STRUCTURED_SPACE_NOT_FOUND", 404);
  const placements = Array.isArray(payload.placements) ? payload.placements : [];
  const validation = validateLayoutGeometry(normalizeStructuredSpace(parseJson(space.payload)), placements, payload.context || {});
  const previous = db.prepare("SELECT revision FROM auto_layout_candidates WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, projectId);
  const revision = Number(previous?.revision || 0) + 1;
  const layoutId = uid("layout");
  const conceptual = space.status !== "approved";
  const status = validation.valid ? "valid" : "invalid";
  const at = now();
  const checksum = sha256({ schema_version: LAYOUT_SCHEMA_VERSION, structured_space_ref: space.snapshot_id, placements, validation });
  db.prepare(`INSERT INTO auto_layout_candidates
    (layout_id,tenant_id,organization_id,stylematch_project_id,structured_space_ref,revision,status,conceptual,schema_version,rule_version,placements,validation,score,checksum,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(layoutId, ctx.tenant_id, ctx.organization_id, projectId, space.snapshot_id, revision, status, conceptual ? 1 : 0,
      LAYOUT_SCHEMA_VERSION, LAYOUT_RULE_VERSION, JSON.stringify(placements), JSON.stringify(validation), validation.score, checksum, ctx.trace_id, ctx.user_id, at);
  return serializeAutoLayout(db.prepare("SELECT * FROM auto_layout_candidates WHERE layout_id=?").get(layoutId));
}

function listAutoLayouts(projectId, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM auto_layout_candidates WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY CASE status WHEN 'approved' THEN 0 ELSE 1 END, score DESC, revision DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializeAutoLayout);
}

function approveAutoLayout(layoutId, payload, ctx) {
  const row = db.prepare("SELECT * FROM auto_layout_candidates WHERE layout_id=? AND tenant_id=? AND organization_id=?")
    .get(layoutId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Auto Layout candidate not found.", "AUTO_LAYOUT_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  const latest = db.prepare("SELECT * FROM auto_layout_candidates WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id);
  if (row.layout_id !== latest.layout_id || Number(payload.expected_revision) !== row.revision) {
    fail("Layout approval requires the latest revision.", "VERSION_CONFLICT", 409, { expected_revision: payload.expected_revision, actual_revision: latest.revision, latest_layout_id: latest.layout_id });
  }
  const validation = parseJson(row.validation);
  if (!validation.valid || row.status === "invalid") fail("A layout with hard violations cannot be approved.", "AUTO_LAYOUT_HARD_VIOLATIONS", 409, { hard_violations: validation.hard_violations });
  if (row.conceptual) fail("A conceptual layout cannot be approved until its StructuredSpace is approved.", "AUTO_LAYOUT_CONCEPTUAL", 409);
  const space = db.prepare("SELECT status FROM structured_space_snapshots WHERE snapshot_id=?").get(row.structured_space_ref);
  if (space?.status !== "approved") fail("The source StructuredSpace is not approved.", "STRUCTURED_SPACE_APPROVAL_REQUIRED", 409);
  const at = now();
  db.prepare("UPDATE auto_layout_candidates SET status='superseded' WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved'")
    .run(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id);
  db.prepare("UPDATE auto_layout_candidates SET status='approved',approved_by=?,approved_at=? WHERE layout_id=?").run(ctx.user_id, at, layoutId);
  return serializeAutoLayout(db.prepare("SELECT * FROM auto_layout_candidates WHERE layout_id=?").get(layoutId));
}

function serializeExternalToolSession(row) {
  if (!row) return null;
  return { connection_id: row.connection_id, stylematch_project_id: row.stylematch_project_id, tool_type: row.tool_type, external_project_ref: row.external_project_ref, adapter_mode: row.adapter_mode, connector_version: row.connector_version, status: row.status, metadata: parseJson(row.metadata), trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at, updated_at: row.updated_at };
}

function createExternalToolSession(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  if (payload.tool_type !== "sketchup") fail("The MVP supports the SketchUp adapter only.", "EXTERNAL_TOOL_TYPE_INVALID");
  if (!String(payload.external_project_ref || "").trim()) fail("external_project_ref is required.", "EXTERNAL_PROJECT_REF_REQUIRED");
  const connectionId = uid("connector"); const at = now();
  db.prepare(`INSERT INTO stylematch_external_tool_sessions
    (connection_id,tenant_id,organization_id,stylematch_project_id,tool_type,external_project_ref,adapter_mode,connector_version,status,metadata,trace_id,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,'local_native','EDT01-sketchup-1.0','ready',?,?,?,?,?)`)
    .run(connectionId, ctx.tenant_id, ctx.organization_id, projectId, payload.tool_type, String(payload.external_project_ref), JSON.stringify(payload.metadata || {}), ctx.trace_id, ctx.user_id, at, at);
  return serializeExternalToolSession(db.prepare("SELECT * FROM stylematch_external_tool_sessions WHERE connection_id=?").get(connectionId));
}

function getExternalToolSession(connectionId, ctx) {
  const row = db.prepare("SELECT * FROM stylematch_external_tool_sessions WHERE connection_id=? AND tenant_id=? AND organization_id=?").get(connectionId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("External tool connection not found.", "EXTERNAL_TOOL_CONNECTION_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  return serializeExternalToolSession(row);
}

function captureExternalToolScene(connectionId, payload, ctx) {
  const session = getExternalToolSession(connectionId, ctx);
  if (!String(payload.external_scene_ref || "").trim()) fail("external_scene_ref is required.", "EXTERNAL_SCENE_REF_REQUIRED");
  const camera = payload.camera || {};
  if (![camera.position, camera.target].every((value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite)) || !(Number(camera.fov) > 0)) {
    fail("camera requires numeric position[3], target[3], and positive fov.", "EXTERNAL_CAMERA_INVALID");
  }
  const sceneId = uid("scene"); const at = now();
  const canonical = { external_scene_ref: payload.external_scene_ref, viewport_ref: payload.viewport_ref || null, camera: { position: camera.position, target: camera.target, fov: Number(camera.fov), eye_height: camera.eye_height == null ? null : Number(camera.eye_height) }, geometry_ref: payload.geometry_ref || null, material_refs: payload.material_refs || [], structured_space_ref: payload.structured_space_ref || null };
  const checksum = sha256({ schema_version: EXTERNAL_TOOL_CONNECTOR_SCHEMA_VERSION, connection_id: connectionId, ...canonical });
  db.prepare(`INSERT INTO stylematch_external_tool_scenes
    (scene_id,connection_id,tenant_id,organization_id,stylematch_project_id,external_scene_ref,viewport_ref,camera,geometry_ref,material_refs,structured_space_ref,checksum,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(sceneId, connectionId, ctx.tenant_id, ctx.organization_id, session.stylematch_project_id, canonical.external_scene_ref, canonical.viewport_ref, JSON.stringify(canonical.camera), canonical.geometry_ref, JSON.stringify(canonical.material_refs), canonical.structured_space_ref, checksum, ctx.trace_id, ctx.user_id, at);
  return { schema_version: EXTERNAL_TOOL_CONNECTOR_SCHEMA_VERSION, scene_id: sceneId, connection_id: connectionId, stylematch_project_id: session.stylematch_project_id, ...canonical, checksum, created_at: at };
}

function getLatestExternalToolScene(connectionId, ctx) {
  const session = getExternalToolSession(connectionId, ctx);
  const row = db.prepare("SELECT * FROM stylematch_external_tool_scenes WHERE connection_id=? AND tenant_id=? AND organization_id=? ORDER BY id DESC LIMIT 1")
    .get(connectionId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Captured scene not found.", "EXTERNAL_SCENE_NOT_FOUND", 404);
  return { schema_version: EXTERNAL_TOOL_CONNECTOR_SCHEMA_VERSION, scene_id: row.scene_id, connection_id: connectionId,
    stylematch_project_id: session.stylematch_project_id, external_scene_ref: row.external_scene_ref,
    viewport_ref: row.viewport_ref, camera: parseJson(row.camera), geometry_ref: row.geometry_ref,
    material_refs: parseJson(row.material_refs, []), structured_space_ref: row.structured_space_ref,
    checksum: row.checksum, created_at: row.created_at };
}

function createExternalRenderRoundTrip(connectionId, payload, ctx) {
  const session = getExternalToolSession(connectionId, ctx);
  const scene = db.prepare("SELECT * FROM stylematch_external_tool_scenes WHERE scene_id=? AND connection_id=? AND tenant_id=? AND organization_id=?").get(payload.scene_id, connectionId, ctx.tenant_id, ctx.organization_id);
  if (!scene) fail("Captured scene not found.", "EXTERNAL_SCENE_NOT_FOUND", 404);
  return { render_task_id: uid("external_render"), connection_id: connectionId, scene_id: scene.scene_id, stylematch_project_id: session.stylematch_project_id, status: "ready_for_stylematch_render", adapter_mode: session.adapter_mode, source_trace: { external_scene_ref: scene.external_scene_ref, viewport_ref: scene.viewport_ref, camera: parseJson(scene.camera), checksum: scene.checksum }, state_transition_applied: false, created_at: now() };
}

function serializeApprovedAsset(row) {
  return row ? { asset_id: row.asset_id, logical_asset_id: row.logical_asset_id, stylematch_project_id: row.stylematch_project_id,
    revision: row.revision, status: row.status, schema_version: row.schema_version, asset_type: row.asset_type, label: row.label,
    local_ref: row.local_ref, metadata: parseJson(row.metadata), checksum: row.checksum, parent_asset_id: row.parent_asset_id,
    approved_by: row.approved_by, approved_at: row.approved_at, trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at } : null;
}

function listApprovedAssets(projectId, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM stylematch_approved_assets WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY logical_asset_id,revision DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializeApprovedAsset);
}

function createApprovedAsset(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  const allowedTypes = new Set(["image", "floorplan", "proposal", "document", "other"]);
  if (!allowedTypes.has(payload.asset_type)) fail("Unsupported asset_type.", "APPROVED_ASSET_TYPE_INVALID");
  if (!String(payload.local_ref || "").trim()) fail("local_ref is required.", "APPROVED_ASSET_LOCAL_REF_REQUIRED");
  const logicalAssetId = String(payload.logical_asset_id || uid("logical_asset"));
  const previous = db.prepare("SELECT * FROM stylematch_approved_assets WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND logical_asset_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, projectId, logicalAssetId);
  const revision = Number(previous?.revision || 0) + 1;
  const assetId = uid("asset_revision");
  const at = now();
  const metadata = payload.metadata || {};
  const checksum = payload.checksum || sha256({ local_ref: String(payload.local_ref), metadata, revision });
  db.prepare(`INSERT INTO stylematch_approved_assets
    (asset_id,logical_asset_id,tenant_id,organization_id,stylematch_project_id,revision,status,schema_version,asset_type,label,local_ref,metadata,checksum,parent_asset_id,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,?,'candidate',?,?,?,?,?,?,?,?,?,?)`)
    .run(assetId, logicalAssetId, ctx.tenant_id, ctx.organization_id, projectId, revision, APPROVED_ASSET_SCHEMA_VERSION,
      payload.asset_type, String(payload.label || payload.asset_type), String(payload.local_ref), JSON.stringify(metadata), checksum, previous?.asset_id || null,
      ctx.trace_id, ctx.user_id, at);
  return serializeApprovedAsset(db.prepare("SELECT * FROM stylematch_approved_assets WHERE asset_id=?").get(assetId));
}

function approveAsset(assetId, payload, ctx) {
  const row = db.prepare("SELECT * FROM stylematch_approved_assets WHERE asset_id=? AND tenant_id=? AND organization_id=?").get(assetId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Approved Asset candidate not found.", "APPROVED_ASSET_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  const latest = db.prepare("SELECT * FROM stylematch_approved_assets WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND logical_asset_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id, row.logical_asset_id);
  if (latest.asset_id !== row.asset_id || Number(payload.expected_revision) !== row.revision) fail("Asset approval requires the latest revision.", "VERSION_CONFLICT", 409, { actual_revision: latest.revision });
  db.prepare("UPDATE stylematch_approved_assets SET status='superseded' WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND logical_asset_id=? AND status='approved'")
    .run(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id, row.logical_asset_id);
  db.prepare("UPDATE stylematch_approved_assets SET status='approved',approved_by=?,approved_at=? WHERE asset_id=?").run(ctx.user_id, now(), assetId);
  return serializeApprovedAsset(db.prepare("SELECT * FROM stylematch_approved_assets WHERE asset_id=?").get(assetId));
}

function serializeLocalArtifact(row) {
  return row ? { artifact_id: row.artifact_id, logical_artifact_id: row.logical_artifact_id, artifact_kind: row.artifact_kind,
    stylematch_project_id: row.stylematch_project_id, revision: row.revision, status: row.status, schema_version: row.schema_version,
    label: row.label, local_ref: row.local_ref, metadata: parseJson(row.metadata), checksum: row.checksum,
    parent_artifact_id: row.parent_artifact_id, approved_by: row.approved_by, approved_at: row.approved_at,
    trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at } : null;
}

function assertLocalArtifactKind(kind) {
  if (!LOCAL_ARTIFACT_SCHEMA_VERSIONS[kind]) fail("Unsupported local artifact kind.", "LOCAL_ARTIFACT_KIND_INVALID");
}

function listLocalArtifacts(projectId, kind, ctx) {
  assertLocalArtifactKind(kind); assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM stylematch_local_artifacts WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND artifact_kind=? ORDER BY logical_artifact_id,revision DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId, kind).map(serializeLocalArtifact);
}

function createLocalArtifact(projectId, kind, payload, ctx) {
  assertLocalArtifactKind(kind); assertStyleMatchCaseAuthorization(projectId, ctx);
  if (!String(payload.local_ref || "").trim()) fail("local_ref is required.", "LOCAL_ARTIFACT_REF_REQUIRED");
  const logicalId = String(payload.logical_artifact_id || uid(`logical_${kind}`));
  const previous = db.prepare("SELECT * FROM stylematch_local_artifacts WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND artifact_kind=? AND logical_artifact_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, projectId, kind, logicalId);
  const revision = Number(previous?.revision || 0) + 1;
  const artifactId = uid(`${kind}_revision`);
  const metadata = payload.metadata || {};
  const checksum = payload.checksum || sha256({ artifact_kind: kind, local_ref: String(payload.local_ref), metadata, revision });
  db.prepare(`INSERT INTO stylematch_local_artifacts
    (artifact_id,logical_artifact_id,artifact_kind,tenant_id,organization_id,stylematch_project_id,revision,status,schema_version,label,local_ref,metadata,checksum,parent_artifact_id,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,?,?,'candidate',?,?,?,?,?,?,?,?,?)`)
    .run(artifactId, logicalId, kind, ctx.tenant_id, ctx.organization_id, projectId, revision, LOCAL_ARTIFACT_SCHEMA_VERSIONS[kind],
      String(payload.label || kind), String(payload.local_ref), JSON.stringify(metadata), checksum, previous?.artifact_id || null, ctx.trace_id, ctx.user_id, now());
  return serializeLocalArtifact(db.prepare("SELECT * FROM stylematch_local_artifacts WHERE artifact_id=?").get(artifactId));
}

function approveLocalArtifact(artifactId, payload, ctx) {
  const row = db.prepare("SELECT * FROM stylematch_local_artifacts WHERE artifact_id=? AND tenant_id=? AND organization_id=?").get(artifactId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Local artifact candidate not found.", "LOCAL_ARTIFACT_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  const latest = db.prepare("SELECT * FROM stylematch_local_artifacts WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND artifact_kind=? AND logical_artifact_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id, row.artifact_kind, row.logical_artifact_id);
  if (latest.artifact_id !== row.artifact_id || Number(payload.expected_revision) !== row.revision) fail("Artifact approval requires the latest revision.", "VERSION_CONFLICT", 409, { actual_revision: latest.revision });
  db.prepare("UPDATE stylematch_local_artifacts SET status='superseded' WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND artifact_kind=? AND logical_artifact_id=? AND status='approved'")
    .run(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id, row.artifact_kind, row.logical_artifact_id);
  db.prepare("UPDATE stylematch_local_artifacts SET status='approved',approved_by=?,approved_at=? WHERE artifact_id=?").run(ctx.user_id, now(), artifactId);
  return serializeLocalArtifact(db.prepare("SELECT * FROM stylematch_local_artifacts WHERE artifact_id=?").get(artifactId));
}

function serializeProposalSnapshot(row) {
  return row ? { ...parseJson(row.payload), proposal_snapshot_id: row.proposal_snapshot_id,
    stylematch_project_id: row.stylematch_project_id, revision: row.revision, status: row.status,
    schema_version: row.schema_version, structured_space_ref: row.structured_space_ref,
    approved_layout_ref: row.approved_layout_ref, checksum: row.checksum,
    parent_snapshot_id: row.parent_snapshot_id, approved_by: row.approved_by,
    approved_at: row.approved_at, trace_id: row.trace_id, created_by: row.created_by,
    created_at: row.created_at, state_transition_applied: false } : null;
}

function listProposalSnapshots(projectId, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializeProposalSnapshot);
}

function createProposalSnapshot(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  const space = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.structured_space_ref, ctx.tenant_id, ctx.organization_id, projectId);
  const layout = db.prepare("SELECT * FROM auto_layout_candidates WHERE layout_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.approved_layout_ref, ctx.tenant_id, ctx.organization_id, projectId);
  if (!space || space.status !== "approved") fail("Proposal Snapshot requires an approved StructuredSpace.", "PROPOSAL_SPACE_APPROVAL_REQUIRED", 409);
  if (!layout || layout.status !== "approved") fail("Proposal Snapshot requires an approved Auto Layout.", "PROPOSAL_LAYOUT_APPROVAL_REQUIRED", 409);
  if (layout.structured_space_ref !== space.snapshot_id) fail("Proposal references do not share the same StructuredSpace.", "PROPOSAL_REFERENCE_MISMATCH", 409);
  if (!payload.requirements || typeof payload.requirements !== "object") fail("requirements snapshot is required.", "PROPOSAL_REQUIREMENTS_REQUIRED");
  if (!payload.style_dna || typeof payload.style_dna !== "object") fail("style_dna snapshot is required.", "PROPOSAL_STYLE_DNA_REQUIRED");
  if (!payload.budget || typeof payload.budget !== "object") fail("budget snapshot is required.", "PROPOSAL_BUDGET_REQUIRED");
  const previous = db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, projectId);
  const revision = Number(previous?.revision || 0) + 1;
  const proposalSnapshotId = uid("proposal_snapshot");
  const canonical = {
    requirements: payload.requirements,
    style_dna: payload.style_dna,
    budget: payload.budget,
    confirmed_reference_set: Array.isArray(payload.confirmed_reference_set) ? payload.confirmed_reference_set : [],
    approved_asset_refs: db.prepare("SELECT asset_id,revision,checksum FROM stylematch_approved_assets WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved' ORDER BY logical_asset_id")
      .all(ctx.tenant_id, ctx.organization_id, projectId),
    assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [],
    unresolved_risks: Array.isArray(payload.unresolved_risks) ? payload.unresolved_risks : [],
    authority_boundary: { design_proposal_approval: true, isafe_gate_decision: false, r5_2_state_transition: false },
  };
  const checksum = sha256({ schema_version: PROPOSAL_SNAPSHOT_SCHEMA_VERSION, project_id: projectId, revision,
    structured_space_ref: space.snapshot_id, structured_space_checksum: space.checksum,
    approved_layout_ref: layout.layout_id, layout_checksum: layout.checksum, payload: canonical });
  const at = now();
  db.prepare(`INSERT INTO stylematch_proposal_snapshots
    (proposal_snapshot_id,tenant_id,organization_id,stylematch_project_id,revision,status,schema_version,structured_space_ref,approved_layout_ref,payload,checksum,parent_snapshot_id,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,'candidate',?,?,?,?,?,?,?,?,?)`)
    .run(proposalSnapshotId, ctx.tenant_id, ctx.organization_id, projectId, revision, PROPOSAL_SNAPSHOT_SCHEMA_VERSION,
      space.snapshot_id, layout.layout_id, JSON.stringify(canonical), checksum, previous?.proposal_snapshot_id || null, ctx.trace_id, ctx.user_id, at);
  return serializeProposalSnapshot(db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE proposal_snapshot_id=?").get(proposalSnapshotId));
}

function approveProposalSnapshot(proposalSnapshotId, payload, ctx) {
  const row = db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE proposal_snapshot_id=? AND tenant_id=? AND organization_id=?")
    .get(proposalSnapshotId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Proposal Snapshot not found.", "PROPOSAL_SNAPSHOT_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  const latest = db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY revision DESC LIMIT 1")
    .get(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id);
  if (latest.proposal_snapshot_id !== row.proposal_snapshot_id || Number(payload.expected_revision) !== row.revision) {
    fail("Proposal approval requires the latest revision.", "VERSION_CONFLICT", 409, { actual_revision: latest.revision });
  }
  const space = db.prepare("SELECT status FROM structured_space_snapshots WHERE snapshot_id=?").get(row.structured_space_ref);
  const layout = db.prepare("SELECT status,structured_space_ref FROM auto_layout_candidates WHERE layout_id=?").get(row.approved_layout_ref);
  if (space?.status !== "approved" || layout?.status !== "approved" || layout.structured_space_ref !== row.structured_space_ref) {
    fail("Proposal source approvals changed or no longer match.", "PROPOSAL_SOURCE_APPROVAL_INVALID", 409);
  }
  db.prepare("UPDATE stylematch_proposal_snapshots SET status='superseded' WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved'")
    .run(ctx.tenant_id, ctx.organization_id, row.stylematch_project_id);
  db.prepare("UPDATE stylematch_proposal_snapshots SET status='approved',approved_by=?,approved_at=? WHERE proposal_snapshot_id=?")
    .run(ctx.user_id, now(), proposalSnapshotId);
  return serializeProposalSnapshot(db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE proposal_snapshot_id=?").get(proposalSnapshotId));
}

function serializeHandoffV2(row) {
  if (!row) return null;
  const receiptRow = db.prepare("SELECT * FROM governance_handoff_receipts_v2 WHERE handoff_v2_id=?").get(row.handoff_v2_id);
  const receipt = receiptRow ? { ...parseJson(receiptRow.receipt_payload), receipt_checksum: receiptRow.receipt_checksum, trace_id: receiptRow.trace_id, received_by: receiptRow.received_by, received_at: receiptRow.received_at } : null;
  const proposalRow = db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE handoff_v2_id=?").get(row.handoff_v2_id);
  return { ...parseJson(row.manifest), status: row.status, manifest_checksum: row.manifest_checksum, receipt, case_creation_proposal: proposalRow ? serializeCaseCreationProposal(proposalRow) : null, trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at, state_transition_applied: false };
}

function listHandoffsV2(projectId, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  return db.prepare("SELECT * FROM governance_handoffs_v2 WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? ORDER BY id DESC")
    .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializeHandoffV2);
}

function buildHandoffV2(projectId, payload, ctx) {
  assertStyleMatchCaseAuthorization(projectId, ctx);
  const replay = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE tenant_id=? AND organization_id=? AND idempotency_key=?")
    .get(ctx.tenant_id, ctx.organization_id, ctx.idempotency_key);
  if (replay) return { ...serializeHandoffV2(replay), idempotent_replay: true };
  const space = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.structured_space_ref, ctx.tenant_id, ctx.organization_id, projectId);
  const layout = db.prepare("SELECT * FROM auto_layout_candidates WHERE layout_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.approved_layout_ref, ctx.tenant_id, ctx.organization_id, projectId);
  const proposal = db.prepare("SELECT * FROM stylematch_proposal_snapshots WHERE proposal_snapshot_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
    .get(payload.approved_proposal_ref, ctx.tenant_id, ctx.organization_id, projectId);
  if (!space || space.status !== "approved") fail("Handoff V2 requires an approved StructuredSpace.", "HANDOFF_V2_SPACE_APPROVAL_REQUIRED", 409);
  if (!layout || layout.status !== "approved") fail("Handoff V2 requires an approved Auto Layout.", "HANDOFF_V2_LAYOUT_APPROVAL_REQUIRED", 409);
  if (layout.structured_space_ref !== space.snapshot_id) fail("Approved layout does not reference the selected StructuredSpace.", "HANDOFF_V2_REFERENCE_MISMATCH", 409);
  if (!proposal || proposal.status !== "approved") fail("Handoff V2 requires an approved Proposal Snapshot.", "HANDOFF_V2_PROPOSAL_APPROVAL_REQUIRED", 409);
  if (proposal.structured_space_ref !== space.snapshot_id || proposal.approved_layout_ref !== layout.layout_id) fail("Approved Proposal Snapshot does not reference the selected space and layout.", "HANDOFF_V2_REFERENCE_MISMATCH", 409);
  if (payload.structured_space_checksum && payload.structured_space_checksum !== space.checksum) fail("StructuredSpace checksum mismatch.", "HANDOFF_V2_CHECKSUM_MISMATCH", 409);
  if (payload.layout_checksum && payload.layout_checksum !== layout.checksum) fail("Auto Layout checksum mismatch.", "HANDOFF_V2_CHECKSUM_MISMATCH", 409);
  const handoffId = uid("handoff_v2");
  const at = now();
  const approvedAssets = db.prepare("SELECT * FROM stylematch_approved_assets WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved' ORDER BY logical_asset_id")
    .all(ctx.tenant_id, ctx.organization_id, projectId);
  const approvedLocalArtifacts = db.prepare("SELECT * FROM stylematch_local_artifacts WHERE tenant_id=? AND organization_id=? AND stylematch_project_id=? AND status='approved' ORDER BY artifact_kind,logical_artifact_id")
    .all(ctx.tenant_id, ctx.organization_id, projectId);
  const artifactRefs = (kind) => approvedLocalArtifacts.filter((item) => item.artifact_kind === kind)
    .map((item) => ({ id: item.artifact_id, revision: item.revision, checksum: item.checksum, approval_status: "approved" }));
  const manifest = {
    schema_version: HANDOFF_V2_SCHEMA_VERSION,
    handoff_id: handoffId,
    stylematch_project_id: projectId,
    status: "ready_for_intake",
    artifacts: {
      structured_space_ref: { id: space.snapshot_id, revision: space.revision, checksum: space.checksum, approval_status: "approved" },
      approved_layout_ref: { id: layout.layout_id, revision: layout.revision, checksum: layout.checksum, approval_status: "approved" },
      approved_proposal_ref: { id: proposal.proposal_snapshot_id, revision: proposal.revision, checksum: proposal.checksum, approval_status: "approved" },
      approved_viewset_refs: artifactRefs("viewset"), material_selection_refs: artifactRefs("material_selection"), external_scene_refs: artifactRefs("external_scene"),
      asset_revision_refs: approvedAssets.map((asset) => ({ id: asset.asset_id, revision: asset.revision, checksum: asset.checksum, approval_status: "approved" })),
    },
    evidence_manifest: [
      { evidence_type: "structured_space_snapshot", object_ref: space.snapshot_id, checksum: space.checksum },
      { evidence_type: "approved_auto_layout", object_ref: layout.layout_id, checksum: layout.checksum },
      { evidence_type: "approved_proposal_snapshot", object_ref: proposal.proposal_snapshot_id, checksum: proposal.checksum },
      ...approvedAssets.map((asset) => ({ evidence_type: `approved_asset:${asset.asset_type}`, object_ref: asset.asset_id, checksum: asset.checksum })),
      ...approvedLocalArtifacts.map((item) => ({ evidence_type: `approved_${item.artifact_kind}`, object_ref: item.artifact_id, checksum: item.checksum })),
    ],
    assumptions: Array.isArray(payload.assumptions) ? payload.assumptions : [],
    unresolved_risks: Array.isArray(payload.unresolved_risks) ? payload.unresolved_risks : [],
    authority_boundary: { design_artifact_approval: true, isafe_gate_decision: false, r5_2_state_transition: false },
  };
  const manifestChecksum = sha256(manifest);
  db.prepare(`INSERT INTO governance_handoffs_v2
    (handoff_v2_id,idempotency_key,tenant_id,organization_id,stylematch_project_id,status,schema_version,manifest,manifest_checksum,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,'ready_for_intake',?,?,?,?,?,?)`)
    .run(handoffId, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id, projectId, HANDOFF_V2_SCHEMA_VERSION,
      JSON.stringify(manifest), manifestChecksum, ctx.trace_id, ctx.user_id, at);
  return serializeHandoffV2(db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=?").get(handoffId));
}

function receiveHandoffV2(handoffId, payload, ctx) {
  const handoff = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=? AND tenant_id=? AND organization_id=?")
    .get(handoffId, ctx.tenant_id, ctx.organization_id);
  if (!handoff) fail("Governance Handoff V2 not found.", "HANDOFF_V2_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(handoff.stylematch_project_id, ctx);
  const existing = db.prepare("SELECT * FROM governance_handoff_receipts_v2 WHERE handoff_v2_id=?").get(handoffId);
  if (existing) return { handoff: serializeHandoffV2(handoff), receipt: serializeHandoffV2(handoff).receipt, idempotent_replay: true, state_transition_applied: false };
  if (handoff.status !== "ready_for_intake") fail("Handoff is not ready for intake.", "HANDOFF_V2_NOT_READY", 409, { status: handoff.status });
  if (!payload.manifest_checksum || payload.manifest_checksum !== handoff.manifest_checksum) {
    fail("Handoff manifest checksum mismatch.", "HANDOFF_V2_CHECKSUM_MISMATCH", 409);
  }
  const receiptId = uid("receipt_v2");
  const at = now();
  const receiptPayload = {
    schema_version: HANDOFF_RECEIPT_SCHEMA_VERSION,
    receipt_id: receiptId,
    handoff_id: handoffId,
    status: "intake_received",
    received_manifest_checksum: handoff.manifest_checksum,
    authority_boundary: { case_created: false, gate_decision: false, r5_2_state_transition: false },
  };
  const receiptChecksum = sha256(receiptPayload);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO governance_handoff_receipts_v2
      (receipt_id,handoff_v2_id,idempotency_key,tenant_id,organization_id,status,schema_version,received_manifest_checksum,receipt_payload,receipt_checksum,trace_id,received_by,received_at)
      VALUES (?,?,?,?,?,'intake_received',?,?,?,?,?,?,?)`)
      .run(receiptId, handoffId, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id, HANDOFF_RECEIPT_SCHEMA_VERSION,
        handoff.manifest_checksum, JSON.stringify(receiptPayload), receiptChecksum, ctx.trace_id, ctx.user_id, at);
    db.prepare("UPDATE governance_handoffs_v2 SET status='intake_received' WHERE handoff_v2_id=?").run(handoffId);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  const updated = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=?").get(handoffId);
  return { handoff: serializeHandoffV2(updated), receipt: serializeHandoffV2(updated).receipt, idempotent_replay: false, state_transition_applied: false };
}

function serializeCaseCreationProposal(row) {
  if (!row) return null;
  const payload = parseJson(row.proposal_payload);
  const executionRow = db.prepare("SELECT * FROM isafe_case_creation_executions WHERE proposal_id=?").get(row.proposal_id);
  return { ...payload, status: row.status, version: row.version, review: row.reviewed_by ? { reviewed_by: row.reviewed_by, rationale: row.review_rationale, reviewed_at: row.reviewed_at } : null,
    execution: executionRow ? serializeCaseCreationExecution(executionRow) : null, trace_id: row.trace_id, created_by: row.created_by, created_at: row.created_at,
    state_transition_applied: false, case_created: Boolean(executionRow) };
}

function listCaseCreationProposals(handoffId, ctx) {
  const handoff = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=? AND tenant_id=? AND organization_id=?")
    .get(handoffId, ctx.tenant_id, ctx.organization_id);
  if (!handoff) fail("Governance Handoff V2 not found.", "HANDOFF_V2_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(handoff.stylematch_project_id, ctx);
  return db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE handoff_v2_id=? ORDER BY id DESC").all(handoffId).map(serializeCaseCreationProposal);
}

function createCaseCreationProposal(handoffId, payload, ctx) {
  const handoff = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=? AND tenant_id=? AND organization_id=?")
    .get(handoffId, ctx.tenant_id, ctx.organization_id);
  if (!handoff) fail("Governance Handoff V2 not found.", "HANDOFF_V2_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(handoff.stylematch_project_id, ctx);
  const existing = db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE handoff_v2_id=?").get(handoffId);
  if (existing) return { ...serializeCaseCreationProposal(existing), idempotent_replay: true };
  const receipt = db.prepare("SELECT * FROM governance_handoff_receipts_v2 WHERE handoff_v2_id=?").get(handoffId);
  if (!receipt || handoff.status !== "intake_received") fail("A valid iSAFE intake receipt is required.", "HANDOFF_V2_RECEIPT_REQUIRED", 409);
  const handoffManifest = parseJson(handoff.manifest);
  const proposalId = uid("case_proposal");
  const at = now();
  const proposal = {
    schema_version: CASE_PROPOSAL_SCHEMA_VERSION,
    proposal_id: proposalId,
    handoff_id: handoffId,
    receipt_id: receipt.receipt_id,
    status: "pending_review",
    project_summary: {
      stylematch_project_id: handoff.stylematch_project_id,
      title: String(payload.title || `iSAFE intake for ${handoff.stylematch_project_id}`).trim(),
      applicant_name: String(payload.applicant_name || "").trim(),
      contact: String(payload.contact || "").trim(),
      source_manifest_checksum: handoff.manifest_checksum,
      artifact_refs: handoffManifest.artifacts,
    },
    assumptions: handoffManifest.assumptions || [],
    unresolved_risks: handoffManifest.unresolved_risks || [],
    authority_boundary: { case_created: false, gate_decision: false, r5_2_state_transition: false },
  };
  if (!proposal.project_summary.applicant_name || !proposal.project_summary.contact) fail("applicant_name and contact are required.", "CASE_PROPOSAL_CONTACT_REQUIRED");
  db.prepare(`INSERT INTO isafe_case_creation_proposals
    (proposal_id,handoff_v2_id,receipt_id,idempotency_key,tenant_id,organization_id,stylematch_project_id,status,version,schema_version,proposal_payload,trace_id,created_by,created_at)
    VALUES (?,?,?,?,?,?,?,'pending_review',1,?,?,?,?,?)`)
    .run(proposalId, handoffId, receipt.receipt_id, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id, handoff.stylematch_project_id,
      CASE_PROPOSAL_SCHEMA_VERSION, JSON.stringify(proposal), ctx.trace_id, ctx.user_id, at);
  return serializeCaseCreationProposal(db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE proposal_id=?").get(proposalId));
}

function decideCaseCreationProposal(proposalId, payload, ctx) {
  const row = db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE proposal_id=? AND tenant_id=? AND organization_id=?")
    .get(proposalId, ctx.tenant_id, ctx.organization_id);
  if (!row) fail("Case Creation Proposal not found.", "CASE_PROPOSAL_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(row.stylematch_project_id, ctx);
  if (row.status !== "pending_review") return { ...serializeCaseCreationProposal(row), idempotent_replay: true };
  const expected = Number(payload.expected_version);
  if (expected !== row.version) fail("Case Creation Proposal version conflict.", "VERSION_CONFLICT", 409, { expected_version: expected, actual_version: row.version });
  if (!["approved_for_case_creation", "rejected"].includes(payload.decision)) fail("decision must be approved_for_case_creation or rejected.", "CASE_PROPOSAL_DECISION_INVALID");
  if (!String(payload.rationale || "").trim()) fail("rationale is required.", "CASE_PROPOSAL_RATIONALE_REQUIRED");
  const at = now();
  db.prepare("UPDATE isafe_case_creation_proposals SET status=?,version=version+1,reviewed_by=?,review_rationale=?,reviewed_at=?,trace_id=? WHERE proposal_id=? AND version=?")
    .run(payload.decision, ctx.user_id, String(payload.rationale).trim(), at, ctx.trace_id, proposalId, expected);
  return serializeCaseCreationProposal(db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE proposal_id=?").get(proposalId));
}

function serializeCaseCreationExecution(row) {
  return row ? { ...parseJson(row.execution_payload), execution_checksum: row.execution_checksum, trace_id: row.trace_id, executed_by: row.executed_by, executed_at: row.executed_at, state_transition_applied: false } : null;
}

function executeCaseCreationProposal(proposalId, payload, ctx) {
  const proposal = db.prepare("SELECT * FROM isafe_case_creation_proposals WHERE proposal_id=? AND tenant_id=? AND organization_id=?")
    .get(proposalId, ctx.tenant_id, ctx.organization_id);
  if (!proposal) fail("Case Creation Proposal not found.", "CASE_PROPOSAL_NOT_FOUND", 404);
  assertStyleMatchCaseAuthorization(proposal.stylematch_project_id, ctx);
  const existing = db.prepare("SELECT * FROM isafe_case_creation_executions WHERE proposal_id=?").get(proposalId);
  if (existing) return { execution: serializeCaseCreationExecution(existing), case: getCase(existing.isafe_case_id), idempotent_replay: true, state_transition_applied: false };
  if (proposal.status !== "approved_for_case_creation") fail("Proposal is not approved for case creation.", "CASE_PROPOSAL_APPROVAL_REQUIRED", 409, { status: proposal.status });
  if (Number(payload.expected_version) !== proposal.version) fail("Case Creation Proposal version conflict.", "VERSION_CONFLICT", 409, { expected_version: payload.expected_version, actual_version: proposal.version });
  if (payload.confirmation !== "CREATE_ISAFE_CASE") fail("Explicit CREATE_ISAFE_CASE confirmation is required.", "CASE_CREATION_CONFIRMATION_REQUIRED", 409);
  const handoff = db.prepare("SELECT * FROM governance_handoffs_v2 WHERE handoff_v2_id=?").get(proposal.handoff_v2_id);
  const receipt = db.prepare("SELECT * FROM governance_handoff_receipts_v2 WHERE handoff_v2_id=?").get(proposal.handoff_v2_id);
  if (!handoff || handoff.status !== "intake_received" || !receipt) fail("Received Handoff V2 is required.", "HANDOFF_V2_RECEIPT_REQUIRED", 409);
  const proposalPayload = parseJson(proposal.proposal_payload);
  const isafeCaseId = nextCaseId();
  const executionId = uid("case_execution");
  const projectId = uid("project");
  const journeyId = uid("journey");
  const sourceCaseCode = `HOV2-${proposalId.slice(-12).toUpperCase()}`;
  const at = now();
  const sourcePayload = { intake_channel: "stylematch_handoff_v2", handoff_v2_id: handoff.handoff_v2_id, receipt_id: receipt.receipt_id,
    proposal_id: proposalId, manifest_checksum: handoff.manifest_checksum, project_summary: proposalPayload.project_summary,
    assumptions: proposalPayload.assumptions, unresolved_risks: proposalPayload.unresolved_risks };
  const executionPayload = {
    schema_version: CASE_EXECUTION_SCHEMA_VERSION,
    execution_id: executionId,
    proposal_id: proposalId,
    handoff_id: handoff.handoff_v2_id,
    receipt_id: receipt.receipt_id,
    isafe_case_id: isafeCaseId,
    workspace_url: `http://127.0.0.1:4174/?view=projects&case=${encodeURIComponent(isafeCaseId)}&role=headquarter`,
    initial_state: { current_stage: "INTAKE_pending", gate_status: "intake_pending" },
    authority_boundary: { case_created: true, gate_decision: false, r5_2_state_transition: false },
  };
  const executionChecksum = sha256(executionPayload);
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`INSERT INTO cases
      (isafe_case_id,source_project_id,source_case_code,title,status,current_stage,gate_status,risk_score,stage_status,trace_id,source_payload,created_at,updated_at,tenant_id,organization_id,journey_id,stylematch_project_id,project_id,handover_id,correlation_id,schema_version,version,intake_channel)
      VALUES (?,?,?,?,?,'INTAKE_pending','intake_pending',88,?,?,?,?,?,?,?,?,?,?,?,?,?,1,'stylematch_handoff_v2')`)
      .run(isafeCaseId, proposal.stylematch_project_id, sourceCaseCode, proposalPayload.project_summary.title, "intake_review", JSON.stringify("case_created_from_approved_proposal"),
        ctx.trace_id, JSON.stringify(sourcePayload), at, at, ctx.tenant_id, ctx.organization_id, journeyId, proposal.stylematch_project_id, projectId, handoff.handoff_v2_id,
        ctx.correlation_id || ctx.trace_id, SCHEMA_VERSION);
    const caseId = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO gate_states (case_id,stage,gate_status,actor,detail,trace_id,created_at,gate_decision_id,outcome,reason,rule_version,before_version,after_version,idempotency_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(caseId, "INTAKE_pending", "intake_pending", ctx.user_id, "Case created from approved Handoff V2 proposal; governance not started", ctx.trace_id, at, uid("gate"), "Conditional", "Human governance start required", SCHEMA_VERSION, 0, 1, `${ctx.idempotency_key}:intake`);
    for (const [type, value, objectRef] of [["handoff_v2_manifest", parseJson(handoff.manifest), handoff.handoff_v2_id], ["case_creation_proposal", proposalPayload, proposalId], ["intake_receipt", parseJson(receipt.receipt_payload), receipt.receipt_id]]) {
      db.prepare("INSERT INTO evidence (case_id,evidence_type,label,sha256,metadata,created_at,evidence_id,created_by,version,permission_scope,retention_policy,legal_hold,step_key,rule_version,schema_version,object_ref,trace_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(caseId, type, type, sha256(value), JSON.stringify({ source: "StyleMatchAI Handoff V2", captured_at: at }), at, uid("evidence"), ctx.user_id, 1, "headquarter", "project_lifecycle_plus_7_years", 0, "INTAKE_pending", SCHEMA_VERSION, SCHEMA_VERSION, objectRef, ctx.trace_id);
    }
    db.prepare(`INSERT INTO isafe_case_creation_executions
      (execution_id,proposal_id,handoff_v2_id,receipt_id,isafe_case_id,idempotency_key,tenant_id,organization_id,schema_version,execution_payload,execution_checksum,trace_id,executed_by,executed_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(executionId, proposalId, handoff.handoff_v2_id, receipt.receipt_id, isafeCaseId, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id,
        CASE_EXECUTION_SCHEMA_VERSION, JSON.stringify(executionPayload), executionChecksum, ctx.trace_id, ctx.user_id, at);
    db.prepare("UPDATE isafe_case_creation_proposals SET status='executed',version=version+1,trace_id=? WHERE proposal_id=?").run(ctx.trace_id, proposalId);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { execution: serializeCaseCreationExecution(db.prepare("SELECT * FROM isafe_case_creation_executions WHERE execution_id=?").get(executionId)), case: getCase(isafeCaseId), idempotent_replay: false, state_transition_applied: false };
}

function fail(message, code = "VALIDATION_ERROR", status = 400, details = {}) {
  const error = new Error(message); error.code = code; error.status = status; error.details = details; throw error;
}

function nextCaseId() {
  const year = new Date().getFullYear();
  const row = db.prepare("SELECT isafe_case_id FROM cases WHERE isafe_case_id LIKE ? ORDER BY isafe_case_id DESC LIMIT 1").get(`IS-${year}-%`);
  return `IS-${year}-${String(row ? Number(row.isafe_case_id.split("-").at(-1)) + 1 : 1).padStart(4, "0")}`;
}

function emitEvent(type, ctx, data, causationId = null) {
  const envelope = {
    event_id: uid("evt"), event_type: type, event_version: "1.0", occurred_at: now(), producer: "isafe-local-api",
    tenant_id: ctx.tenant_id, organization_id: ctx.organization_id, trace_id: ctx.trace_id,
    correlation_id: ctx.correlation_id || ctx.trace_id, causation_id: causationId,
    idempotency_key: `${ctx.idempotency_key}:${type}`, data,
  };
  db.prepare(`INSERT INTO outbox_events (event_id,event_type,event_version,occurred_at,producer,tenant_id,organization_id,trace_id,correlation_id,causation_id,idempotency_key,data,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(envelope.event_id, envelope.event_type, envelope.event_version, envelope.occurred_at, envelope.producer, envelope.tenant_id, envelope.organization_id, envelope.trace_id, envelope.correlation_id, envelope.causation_id, envelope.idempotency_key, JSON.stringify(data), envelope.occurred_at);
  return envelope;
}

const legacyParity = createLegacyParity({ db, schemaVersion: SCHEMA_VERSION, fail, emitEvent });

function governanceSteps(currentStage) {
  const active = STEPS.indexOf(currentStage);
  return stateMachine.stages.map((stage, index) => ({
    sequence: stage.sequence,
    code: stage.code,
    key: stage.key,
    phase: stage.phase,
    name: stage.name,
    description: stage.description,
    status: active < 0 ? "not_started" : index < active ? "completed" : index === active ? "active" : "not_started",
    required_evidence: stage.required_evidence,
  }));
}

function serializeCase(row) {
  if (!row) return null;
  const source = parseJson(row.source_payload);
  const evidence = db.prepare("SELECT * FROM evidence WHERE case_id=? ORDER BY id DESC").all(row.id).map((item) => ({ ...item, legal_hold: Boolean(item.legal_hold), metadata: parseJson(item.metadata) }));
  const auditLogs = db.prepare("SELECT action,actor,detail,trace_id,source_log_id,created_at FROM audit_logs WHERE case_id=? ORDER BY id DESC").all(row.id);
  const eligibility = db.prepare("SELECT eligibility_id,milestone_id,gate_stage,status,reason,contract_baseline_ref,gate_decision_id,evidence_refs,confirmed_by,effective_at,expires_at,updated_at FROM payment_eligibilities WHERE case_id=? ORDER BY id DESC").all(row.id)
    .map((item) => ({ ...item, evidence_refs: parseJson(item.evidence_refs, []) }));
  return {
    id: `isafe_${row.isafe_case_id}`,
    isafe_project_id: row.isafe_case_id,
    schema_version: row.schema_version || SCHEMA_VERSION, tenant_id: row.tenant_id || DEFAULT_TENANT,
    organization_id: row.organization_id || DEFAULT_ORGANIZATION, journey_id: row.journey_id,
    stylematch_project_id: row.stylematch_project_id || row.source_project_id, project_id: row.project_id,
    isafe_case_id: row.isafe_case_id, handover_id: row.handover_id, direct_intake_id: row.direct_intake_id,
    intake_channel: row.intake_channel || "stylematch_handover", correlation_id: row.correlation_id,
    source_project_id: row.source_project_id, source_case_code: row.source_case_code,
    source: row.intake_channel === "isafe_direct" ? "iSAFE Direct" : "StyleMatchAI",
    title: row.title, status: row.status, current_stage: row.current_stage, gate_status: row.gate_status,
    stage_status: row.stage_status, risk_score: row.risk_score, version: row.version || 1,
    risk_assessment: {
      value: row.risk_score,
      status: "pilot_unverified",
      formal: false,
      source: "legacy_seed",
      rule_version: null,
      confirmed_by: null,
      human_confirmation: false,
      note: "Local pilot indicator only; not a formally approved R6 RiskScore.",
    },
    pgp_url: `http://${HOST}:${PORT}/api/v1/isafe/cases/${row.isafe_case_id}/pgp`,
    workspace_url: `http://127.0.0.1:4174/?view=projects&case=${encodeURIComponent(row.isafe_case_id)}&role=headquarter`,
    owner: source.user_email || "local-admin", governance_steps: governanceSteps(row.current_stage), evidence,
    evidence_summary: { timeline_events: Array.isArray(source.timeline) ? source.timeline.length : 0, source_audit_logs: auditLogs.length, registered_evidence: evidence.length, project_photos: source.total_photo_count || 0, reference_photos: source.reference_photo_count || 0 },
    payment_eligibilities: eligibility, timeline: Array.isArray(source.timeline) ? source.timeline : [], audit_logs: auditLogs,
    trace_id: row.trace_id, created_at: row.created_at, updated_at: row.updated_at,
  };
}

const getCaseRow = (id) => db.prepare("SELECT * FROM cases WHERE isafe_case_id=? OR source_case_code=?").get(id, id);
const getCase = (id) => serializeCase(getCaseRow(id));

function assertCaseScope(id, ctx) {
  const row = getCaseRow(id);
  if (!row || row.tenant_id !== ctx.tenant_id || row.organization_id !== ctx.organization_id) {
    fail("Case not found.", "CASE_NOT_FOUND", 404);
  }
  return row;
}

function createHandover(payload, ctx) {
  const previous = db.prepare("SELECT isafe_case_id FROM handovers WHERE idempotency_key=?").get(ctx.idempotency_key);
  if (previous) return { created: false, case: getCase(previous.isafe_case_id), idempotent_replay: true };
  const project = payload.project || payload.data || payload;
  if (!project.case_code) fail("case_code is required.");
  if (!project.twcid_match_id || project.match_status !== "matched_confirmed") {
    fail("TWCID match confirmation is required before iSAFE handover.", "MATCH_CONFIRMATION_REQUIRED", 409, {
      required_match_status: "matched_confirmed",
      actual_match_status: project.match_status || null,
      has_twcid_match_id: Boolean(project.twcid_match_id),
    });
  }
  const existing = getCase(project.case_code);
  if (existing) return { created: false, case: existing, idempotent_replay: true };
  const stylematchProjectId = project.stylematch_project_id || project.project_id;
  if (!stylematchProjectId) fail("stylematch_project_id is required.");
  const at = now();
  const ids = { journey_id: project.journey_id || uid("journey"), project_id: project.canonical_project_id || uid("project"), handover_id: uid("handover"), isafe_case_id: nextCaseId() };
  ctx.correlation_id = payload.correlation_id || project.correlation_id || ctx.trace_id;
  const sourcePayload = { ...project, audit_logs: payload.audit_logs || [], timeline: project.timeline || [] };
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`INSERT INTO cases (isafe_case_id,source_project_id,source_case_code,title,status,current_stage,gate_status,risk_score,stage_status,trace_id,source_payload,created_at,updated_at,tenant_id,organization_id,journey_id,stylematch_project_id,project_id,handover_id,correlation_id,schema_version,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`)
      .run(ids.isafe_case_id, stylematchProjectId, project.case_code, project.title || `${project.case_code} iSAFE governance project`, "active", "D1_design_preparation", "D1_pending", 88, JSON.stringify(project.stage_status || {}), ctx.trace_id, JSON.stringify(sourcePayload), at, at, ctx.tenant_id, ctx.organization_id, ids.journey_id, stylematchProjectId, ids.project_id, ids.handover_id, ctx.correlation_id, SCHEMA_VERSION);
    const caseId = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO handovers (handover_id,idempotency_key,tenant_id,organization_id,journey_id,stylematch_project_id,project_id,isafe_case_id,status,trace_id,correlation_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(ids.handover_id, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id, ids.journey_id, stylematchProjectId, ids.project_id, ids.isafe_case_id, "approved", ctx.trace_id, ctx.correlation_id, at);
    db.prepare("INSERT INTO link_registry (link_id,tenant_id,journey_id,stylematch_project_id,project_id,isafe_case_id,handover_id,created_at) VALUES (?,?,?,?,?,?,?,?)")
      .run(uid("link"), ctx.tenant_id, ids.journey_id, stylematchProjectId, ids.project_id, ids.isafe_case_id, ids.handover_id, at);
    db.prepare("INSERT INTO gate_states (case_id,stage,gate_status,actor,detail,trace_id,created_at,gate_decision_id,outcome,reason,rule_version,before_version,after_version,idempotency_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(caseId, "D1_design_preparation", "D1_pending", "local-admin", "Governance initiated", ctx.trace_id, at, uid("gate"), "Conditional", "D1 design preparation evidence review required", SCHEMA_VERSION, 0, 1, `${ctx.idempotency_key}:D1`);
    for (const type of ["case_master", "timeline", "audit_log"]) {
      const value = type === "case_master" ? project : (sourcePayload[type] || sourcePayload.audit_logs || []);
      db.prepare("INSERT INTO evidence (case_id,evidence_type,label,sha256,metadata,created_at,evidence_id,created_by,version,permission_scope,retention_policy,legal_hold,step_key,rule_version,schema_version,object_ref,trace_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(caseId, type, type, sha256(value), JSON.stringify({ source: "StyleMatchAI", captured_at: at }), at, uid("evidence"), "StyleMatchAI", 1, "case_participants", "project_lifecycle_plus_7_years", 0, "D1_design_preparation", SCHEMA_VERSION, SCHEMA_VERSION, `${stylematchProjectId}:${type}`, ctx.trace_id);
    }
    for (const log of payload.audit_logs || []) db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,source_log_id,created_at) VALUES (?,?,?,?,?,?,?)").run(caseId, log.action || "source.audit.imported", log.user_id || "StyleMatchAI", log.detail || "Imported audit event", log.trace_id || ctx.trace_id, log.id || null, log.created_at || at);
    const handoverEvent = emitEvent("ProjectHandoverApproved", ctx, { ...ids, stylematch_project_id: stylematchProjectId });
    emitEvent("ProjectCreated", ctx, { ...ids, stylematch_project_id: stylematchProjectId }, handoverEvent.event_id);
    emitEvent("ISAFECaseCreated", ctx, { ...ids, stylematch_project_id: stylematchProjectId }, handoverEvent.event_id);
    emitEvent("GovernanceInitiated", ctx, { ...ids, current_stage: "D1_design_preparation" }, handoverEvent.event_id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { created: true, case: getCase(ids.isafe_case_id), handover: ids };
}

function createDirectIntake(payload, ctx) {
  const previous = db.prepare("SELECT isafe_case_id FROM direct_intakes WHERE idempotency_key=?").get(ctx.idempotency_key);
  if (previous) return { created: false, case: getCase(previous.isafe_case_id), idempotent_replay: true };
  if (!payload.title?.trim()) fail("title is required.");
  if (!payload.applicant_name?.trim()) fail("applicant_name is required.");
  if (!payload.contact?.trim()) fail("contact is required.");
  const at = now();
  const directIntakeId = uid("direct_intake");
  const projectId = uid("project");
  const journeyId = uid("journey");
  const isafeCaseId = nextCaseId();
  const sourceCaseCode = `DIRECT-${new Date().getFullYear()}-${directIntakeId.slice(-8).toUpperCase()}`;
  ctx.correlation_id = payload.correlation_id || ctx.trace_id;
  const sourcePayload = { ...payload, intake_channel: "isafe_direct", timeline: [] };
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare(`INSERT INTO cases (isafe_case_id,source_project_id,source_case_code,title,status,current_stage,gate_status,risk_score,stage_status,trace_id,source_payload,created_at,updated_at,tenant_id,organization_id,journey_id,stylematch_project_id,project_id,handover_id,correlation_id,schema_version,version,intake_channel,direct_intake_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`)
      .run(isafeCaseId, null, sourceCaseCode, payload.title.trim(), "intake_review", "INTAKE_pending", "intake_pending", 88, JSON.stringify("direct_intake_created"), ctx.trace_id, JSON.stringify(sourcePayload), at, at, ctx.tenant_id, ctx.organization_id, journeyId, null, projectId, null, ctx.correlation_id, SCHEMA_VERSION, "isafe_direct", directIntakeId);
    const caseId = Number(result.lastInsertRowid);
    db.prepare("INSERT INTO direct_intakes (direct_intake_id,idempotency_key,tenant_id,organization_id,project_id,isafe_case_id,status,trace_id,correlation_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .run(directIntakeId, ctx.idempotency_key, ctx.tenant_id, ctx.organization_id, projectId, isafeCaseId, "accepted", ctx.trace_id, ctx.correlation_id, at);
    db.prepare("INSERT INTO gate_states (case_id,stage,gate_status,actor,detail,trace_id,created_at,gate_decision_id,outcome,reason,rule_version,before_version,after_version,idempotency_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(caseId, "INTAKE_pending", "intake_pending", "local-admin", "Direct intake accepted for human review", ctx.trace_id, at, uid("gate"), "Conditional", "Governance has not started", SCHEMA_VERSION, 0, 1, `${ctx.idempotency_key}:intake`);
    for (const type of ["direct_intake", "contact_record"]) {
      const value = type === "direct_intake" ? sourcePayload : { applicant_name: payload.applicant_name, contact: payload.contact };
      db.prepare("INSERT INTO evidence (case_id,evidence_type,label,sha256,metadata,created_at,evidence_id,created_by,version,permission_scope,retention_policy,legal_hold,step_key,rule_version,schema_version,object_ref,trace_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(caseId, type, type, sha256(value), JSON.stringify({ source: "iSAFE Direct", captured_at: at }), at, uid("evidence"), payload.applicant_name, 1, "headquarter", "project_lifecycle_plus_7_years", 0, "INTAKE_pending", SCHEMA_VERSION, SCHEMA_VERSION, `${directIntakeId}:${type}`, ctx.trace_id);
    }
    const createdEvent = emitEvent("ProjectCreated", ctx, { project_id: projectId, isafe_case_id: isafeCaseId, direct_intake_id: directIntakeId, intake_channel: "isafe_direct" });
    emitEvent("ISAFECaseCreated", ctx, { project_id: projectId, isafe_case_id: isafeCaseId, direct_intake_id: directIntakeId, intake_channel: "isafe_direct" }, createdEvent.event_id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { created: true, case: getCase(isafeCaseId), direct_intake: { direct_intake_id: directIntakeId, project_id: projectId, isafe_case_id: isafeCaseId } };
}

function registerEvidence(id, payload, ctx) {
  const row = getCaseRow(id); if (!row) fail("Case not found.", "CASE_NOT_FOUND", 404);
  if (!payload.evidence_type) fail("evidence_type is required.");
  const at = now(); const evidenceId = uid("evidence"); const digest = payload.sha256 || sha256(payload.content ?? payload.metadata ?? payload.object_ref ?? payload.evidence_type);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO evidence (case_id,evidence_type,label,sha256,metadata,created_at,evidence_id,created_by,version,permission_scope,retention_policy,legal_hold,step_key,rule_version,schema_version,object_ref,trace_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(row.id, payload.evidence_type, payload.label || payload.evidence_type, digest, JSON.stringify(payload.metadata || {}), at, evidenceId, payload.created_by || "local-admin", payload.version || 1, payload.permission_scope || "case_participants", payload.retention_policy || "project_lifecycle_plus_7_years", payload.legal_hold ? 1 : 0, payload.step_key || row.current_stage, payload.rule_version || SCHEMA_VERSION, SCHEMA_VERSION, payload.object_ref || `inline://${evidenceId}`, ctx.trace_id);
    db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)").run(row.id, "evidence.registered", payload.created_by || "local-admin", evidenceId, ctx.trace_id, at);
    emitEvent("EvidenceRegistered", { ...ctx, correlation_id: row.correlation_id }, { evidence_id: evidenceId, isafe_case_id: row.isafe_case_id, sha256: digest, step_key: payload.step_key || row.current_stage });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getCase(row.isafe_case_id);
}

function startGovernance(id, payload, ctx) {
  const row = getCaseRow(id); if (!row) fail("Case not found.", "CASE_NOT_FOUND", 404);
  if (row.current_stage !== "INTAKE_pending") fail("Case is not awaiting intake approval.", "INVALID_STATE_TRANSITION", 409, { current_stage: row.current_stage });
  if (!stateMachine.waiver_authorities.includes(payload.actor_role)) fail("Governance start requires headquarter or governance_admin authority.", "AUTHORITY_REQUIRED", 403);
  const expected = Number(payload.expected_version); if (!Number.isInteger(expected)) fail("expected_version is required.");
  if ((row.version || 1) !== expected) fail("Case version conflict.", "VERSION_CONFLICT", 409, { expected_version: expected, actual_version: row.version || 1 });
  const at = now();
  db.exec("BEGIN IMMEDIATE");
  try {
    const changed = db.prepare("UPDATE cases SET status='active',current_stage='D1_design_preparation',gate_status='D1_pending',version=?,state_contract_version=?,schema_version=?,updated_at=? WHERE id=? AND version=?")
      .run(expected + 1, SCHEMA_VERSION, SCHEMA_VERSION, at, row.id, expected);
    if (!changed.changes) fail("Case version conflict.", "VERSION_CONFLICT", 409);
    db.prepare("UPDATE direct_intakes SET status='governance_started' WHERE isafe_case_id=?").run(row.isafe_case_id);
    db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)")
      .run(row.id, "governance.started", payload.actor || "local-admin", payload.reason || "Direct intake approved", ctx.trace_id, at);
    emitEvent("GovernanceInitiated", { ...ctx, correlation_id: row.correlation_id }, { isafe_case_id: row.isafe_case_id, current_stage: "D1_design_preparation", before_version: expected, after_version: expected + 1 });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getCase(row.isafe_case_id);
}

function evaluateGate(id, payload, ctx) {
  const row = getCaseRow(id); if (!row) fail("Case not found.", "CASE_NOT_FOUND", 404);
  if (!OUTCOMES.has(payload.outcome)) fail("outcome must be Passed, Failed, Conditional, or Waived.");
  const stage = STAGE_BY_KEY.get(row.current_stage);
  if (!stage) fail("Current state is not an evaluable governance stage.", "INVALID_STATE_TRANSITION", 409, { current_stage: row.current_stage });
  if (!payload.actor_role) fail("actor_role is required.", "AUTHORITY_REQUIRED", 403);
  const expected = Number(payload.expected_version); if (!Number.isInteger(expected)) fail("expected_version is required.");
  if ((row.version || 1) !== expected) fail("Case version conflict.", "VERSION_CONFLICT", 409, { expected_version: expected, actual_version: row.version || 1 });
  const existingDecision = db.prepare("SELECT gate_decision_id FROM gate_states WHERE case_id=? AND idempotency_key=? ORDER BY id DESC LIMIT 1").get(row.id, ctx.idempotency_key);
  if (existingDecision) return getCase(row.isafe_case_id);
  const evidenceTypes = new Set(db.prepare("SELECT evidence_type FROM evidence WHERE case_id=?").all(row.id).map((item) => item.evidence_type));
  const missingEvidence = stage.required_evidence.filter((type) => !evidenceTypes.has(type));
  if (payload.outcome === "Passed" && missingEvidence.length) {
    fail("Required evidence is incomplete.", "GATE_EVIDENCE_INCOMPLETE", 409, { stage: stage.key, missing_evidence: missingEvidence });
  }
  if (payload.outcome === "Waived") {
    const waiver = payload.waiver || {};
    if (!stateMachine.waiver_authorities.includes(waiver.authority) || waiver.authority !== payload.actor_role) fail("Waiver authority is invalid.", "WAIVER_AUTHORITY_REQUIRED", 403);
    if (!waiver.reason?.trim() || !waiver.expires_at) fail("Waiver reason and expires_at are required.", "WAIVER_DETAILS_REQUIRED", 400);
    if (Number.isNaN(Date.parse(waiver.expires_at)) || Date.parse(waiver.expires_at) <= Date.now()) fail("Waiver expires_at must be a future ISO date.", "WAIVER_EXPIRY_INVALID", 400);
  }
  const index = STEPS.indexOf(row.current_stage); const advances = stateMachine.advance_outcomes.includes(payload.outcome);
  const nextStage = advances ? (index < STEPS.length - 1 ? STEPS[index + 1] : "CLOSED") : row.current_stage;
  const nextVersion = expected + 1; const gateStatus = `${stage.code}_${payload.outcome.toLowerCase()}`; const at = now(); const decisionId = uid("gate");
  db.exec("BEGIN IMMEDIATE");
  try {
    const changed = db.prepare("UPDATE cases SET current_stage=?,gate_status=?,status=?,version=?,state_contract_version=?,schema_version=?,updated_at=? WHERE id=? AND version=?")
      .run(nextStage, gateStatus, nextStage === "CLOSED" ? "closed" : row.status, nextVersion, SCHEMA_VERSION, SCHEMA_VERSION, at, row.id, expected);
    if (!changed.changes) fail("Case version conflict.", "VERSION_CONFLICT", 409);
    db.prepare("INSERT INTO gate_states (case_id,stage,gate_status,actor,detail,trace_id,created_at,gate_decision_id,outcome,reason,rule_version,before_version,after_version,idempotency_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(row.id, row.current_stage, gateStatus, payload.actor || "local-admin", payload.detail || JSON.stringify({ missing_evidence: missingEvidence, waiver: payload.waiver || null }), ctx.trace_id, at, decisionId, payload.outcome, payload.reason || payload.waiver?.reason || "", payload.rule_version || SCHEMA_VERSION, expected, nextVersion, ctx.idempotency_key);
    db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)").run(row.id, "gate.evaluated", payload.actor || "local-admin", `${row.current_stage}:${payload.outcome}`, ctx.trace_id, at);
    emitEvent("GateEvaluated", { ...ctx, correlation_id: row.correlation_id }, { gate_decision_id: decisionId, isafe_case_id: row.isafe_case_id, stage: row.current_stage, stage_code: stage.code, outcome: payload.outcome, missing_evidence: missingEvidence, before_version: expected, after_version: nextVersion });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getCase(row.isafe_case_id);
}

function evaluatePaymentEligibility(id, payload, ctx) {
  const row = getCaseRow(id); if (!row) fail("Case not found.", "CASE_NOT_FOUND", 404);
  for (const field of stateMachine.payment_policy.required_fields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") fail(`${field} is required.`, "PAYMENT_MILESTONE_INCOMPLETE");
  }
  if (!Array.isArray(payload.evidence_refs) || !payload.evidence_refs.length) fail("evidence_refs must be a non-empty array.", "PAYMENT_MILESTONE_INCOMPLETE");
  const decision = db.prepare("SELECT gate_decision_id,stage,outcome FROM gate_states WHERE case_id=? AND gate_decision_id=?").get(row.id, payload.gate_decision_id);
  if (!decision || !stateMachine.advance_outcomes.includes(decision.outcome)) fail("A Passed or authorized Waived gate decision is required.", "PAYMENT_GATE_NOT_SATISFIED", 409);
  const knownEvidence = new Set(db.prepare("SELECT evidence_id FROM evidence WHERE case_id=?").all(row.id).map((item) => item.evidence_id));
  const missingRefs = payload.evidence_refs.filter((ref) => !knownEvidence.has(ref));
  if (missingRefs.length) fail("Payment evidence references are not registered.", "PAYMENT_EVIDENCE_MISSING", 409, { missing_evidence_refs: missingRefs });
  const at = now(); const eligibilityId = uid("eligibility"); const stageCode = decision.stage.split("_")[0];
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO payment_eligibilities (case_id,gate_stage,status,reason,created_at,updated_at,eligibility_id,milestone_id,contract_baseline_ref,gate_decision_id,evidence_refs,confirmed_by,effective_at,expires_at,schema_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(case_id,gate_stage) DO UPDATE SET status=excluded.status,reason=excluded.reason,updated_at=excluded.updated_at,eligibility_id=excluded.eligibility_id,milestone_id=excluded.milestone_id,contract_baseline_ref=excluded.contract_baseline_ref,gate_decision_id=excluded.gate_decision_id,evidence_refs=excluded.evidence_refs,confirmed_by=excluded.confirmed_by,effective_at=excluded.effective_at,expires_at=excluded.expires_at,schema_version=excluded.schema_version")
      .run(row.id, stageCode, "eligible", payload.reason, at, at, eligibilityId, payload.milestone_id, payload.contract_baseline_ref, payload.gate_decision_id, JSON.stringify(payload.evidence_refs), payload.confirmed_by, payload.effective_at || at, payload.expires_at || null, SCHEMA_VERSION);
    db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)")
      .run(row.id, "payment_eligibility.evaluated", payload.confirmed_by, `${payload.milestone_id}:eligible`, ctx.trace_id, at);
    emitEvent("PaymentEligibilityChanged", { ...ctx, correlation_id: row.correlation_id }, { eligibility_id: eligibilityId, isafe_case_id: row.isafe_case_id, gate_stage: decision.stage, milestone_id: payload.milestone_id, status: "eligible", payment_approved: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getCase(row.isafe_case_id);
}

function buildPassport(caseData) {
  const parity = legacyParity.serialize(getCaseRow(caseData.isafe_case_id));
  return {
    schema: "TIGI.PGP/20260722_R5_2", schema_version: SCHEMA_VERSION, generated_at: now(),
    reviewer_note: "Reviewer-ready governance passport generated from the R5.2 state contract, evidence, timeline, audit, gate, and link registry records.",
    identifiers: { tenant_id: caseData.tenant_id, organization_id: caseData.organization_id, journey_id: caseData.journey_id, stylematch_project_id: caseData.stylematch_project_id, project_id: caseData.project_id, isafe_case_id: caseData.isafe_case_id, handover_id: caseData.handover_id, trace_id: caseData.trace_id, correlation_id: caseData.correlation_id },
    case_master: { case_code: caseData.source_case_code, title: caseData.title, status: caseData.status, current_stage: caseData.current_stage, gate_status: caseData.gate_status, version: caseData.version, stage_status: parseJson(caseData.stage_status, caseData.stage_status) },
    governance_nodes: caseData.governance_steps, evidence_register: caseData.evidence,
    evidence_summary: caseData.evidence_summary, payment_eligibilities: caseData.payment_eligibilities,
    legacy_functional_parity: {
      contract_version: parity.contract_version,
      checklist_summary: parity.checklist_summary,
      contract_baseline: parity.baseline,
      payment_milestones: parity.milestones,
      receipts: parity.receipts,
      change_orders: parity.change_orders,
      messages: parity.messages,
    },
    timeline: caseData.timeline, audit_logs: caseData.audit_logs,
    integrity: { algorithm: "SHA-256", canonical_payload_hash: sha256({ ids: caseData.isafe_case_id, evidence: caseData.evidence.map((e) => e.sha256), version: caseData.version }) },
  };
}

function buildSdxlWorkflow({ prompt, negativePrompt, seed, width, height, filenamePrefix, sourceImage }) {
  const latentInput = sourceImage ? ["12", 0] : ["5", 0];
  return {
    "3": { class_type: "KSampler", inputs: { seed, steps: 24, cfg: 7, sampler_name: "euler", scheduler: "normal", denoise: sourceImage ? 0.72 : 1, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: latentInput } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: COMFYUI_CHECKPOINT } },
    "5": { class_type: "EmptyLatentImage", inputs: { width, height, batch_size: 1 } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: negativePrompt, clip: ["4", 1] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: filenamePrefix, images: ["8", 0] } },
    ...(sourceImage ? {
      "10": { class_type: "LoadImage", inputs: { image: sourceImage } },
      "11": { class_type: "ImageScale", inputs: { image: ["10", 0], upscale_method: "lanczos", width, height, crop: "center" } },
      "12": { class_type: "VAEEncode", inputs: { pixels: ["11", 0], vae: ["4", 2] } },
    } : {}),
  };
}

function hydrateWorkflowTemplate(value, replacements) {
  if (Array.isArray(value)) return value.map((item) => hydrateWorkflowTemplate(item, replacements));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, hydrateWorkflowTemplate(item, replacements)]));
  return typeof value === "string" && Object.hasOwn(replacements, value) ? replacements[value] : value;
}

function buildPanoramaWorkflow({ prompt, negativePrompt, seed, filenamePrefix, sourceImage }) {
  return hydrateWorkflowTemplate(panoramaWorkflowTemplate, {
    "{{seed}}": seed,
    "{{checkpoint}}": COMFYUI_CHECKPOINT,
    "{{prompt}}": `${prompt} Preserve all unmasked geometry. Repair only masked polar gaps and blend seams continuously across the left/right ERP boundary.`,
    "{{negative_prompt}}": `${negativePrompt}, changed room layout, changed doors, changed windows, duplicated objects, visible seams, broken panorama boundary`,
    "{{filename_prefix}}": filenamePrefix,
    "{{source_image}}": sourceImage,
  });
}

async function materializeImageSource(sourceUrl, outputBase) {
  if (!sourceUrl || (!sourceUrl.startsWith("data:image/") && !/^https?:\/\//.test(sourceUrl))) throw new Error("Unsupported panorama source URL.");
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Panorama source could not be read (${response.status}).`);
  const contentType = response.headers.get("content-type") || "";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${outputBase}.${extension}`;
  writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  return path;
}

async function uploadComfyFile(path, filename) {
  const bytes = readFileSync(path);
  const form = new FormData();
  form.append("image", new Blob([bytes], { type: "image/png" }), filename);
  form.append("type", "input");
  form.append("overwrite", "true");
  const response = await fetch(`${COMFYUI_URL}/upload/image`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`ComfyUI panorama upload failed (${response.status}).`);
  const uploaded = await response.json();
  return uploaded.subfolder ? `${uploaded.subfolder}/${uploaded.name}` : uploaded.name;
}

async function preparePanoramaInput(payload, aiTaskId, width, height) {
  const capture = payload.source_content?.panorama_capture;
  const ordered = Array.isArray(capture?.ordered_sources) ? capture.ordered_sources : [];
  const expected = ["front", "right", "back", "left"];
  if (capture?.input_mode !== "four_direction_photos" || ordered.length !== 4 || expected.some((direction, index) => ordered[index]?.id !== direction || !ordered[index]?.media_url)) {
    fail("Panorama generation requires four ordered sources: front, right, back, left.", "PANORAMA_FOUR_DIRECTION_SOURCES_REQUIRED", 400, { expected_order: expected });
  }
  if (width !== height * 2) fail("Panorama output must use an exact 2:1 ratio.", "PANORAMA_RATIO_INVALID", 400, { width, height });

  const taskDir = join(dataDir, "panorama-tasks", aiTaskId);
  mkdirSync(taskDir, { recursive: true });
  const inputPaths = {};
  for (const direction of expected) {
    const entry = ordered.find((item) => item.id === direction);
    inputPaths[direction] = await materializeImageSource(entry.media_url, join(taskDir, direction));
  }
  const outputPath = join(taskDir, "erp-draft.png");
  const maskPath = join(taskDir, "erp-mask.png");
  const manifestPath = join(taskDir, "manifest.json");
  const script = join(root, "scripts", "four_direction_to_erp.py");
  const args = [script,
    "--front", inputPaths.front, "--right", inputPaths.right, "--back", inputPaths.back, "--left", inputPaths.left,
    "--output", outputPath, "--mask-output", maskPath, "--manifest-output", manifestPath,
    "--width", String(width), "--height", String(height), "--hfov", String(Number(capture.horizontal_fov_degrees) || 100),
  ];
  const result = spawnSync(COMFYUI_PYTHON, args, { cwd: root, encoding: "utf8", timeout: 120000, windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || "Panorama projection failed.");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const sourceImage = await uploadComfyFile(outputPath, `${aiTaskId}-erp-draft.png`);
  return { sourceImage, manifest };
}

async function uploadComfySource(sourceUrl, aiTaskId) {
  if (!sourceUrl || (!sourceUrl.startsWith("data:image/") && !/^https?:\/\//.test(sourceUrl))) return null;
  const sourceResponse = await fetch(sourceUrl);
  if (!sourceResponse.ok) throw new Error(`Source image could not be read (${sourceResponse.status}).`);
  const blob = await sourceResponse.blob();
  const extension = blob.type.includes("png") ? "png" : "jpg";
  const filename = `${aiTaskId}-source.${extension}`;
  const form = new FormData();
  form.append("image", blob, filename);
  form.append("type", "input");
  form.append("overwrite", "true");
  const response = await fetch(`${COMFYUI_URL}/upload/image`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`ComfyUI source upload failed (${response.status}).`);
  const uploaded = await response.json();
  return uploaded.subfolder ? `${uploaded.subfolder}/${uploaded.name}` : uploaded.name;
}

function serializeImageTask(row) {
  return {
    ...row,
    quality_report: row.quality_report ? JSON.parse(row.quality_report) : null,
    operation: row.operation_metadata ? JSON.parse(row.operation_metadata) : null,
    image_url: row.status === "completed" ? `http://${HOST}:${PORT}/api/v1/ai/image-tasks/${row.ai_task_id}/image` : null,
    human_review_required: true,
    advisory_only: true,
    output_label: "AI 設計建議草案，非施工圖或正式決策",
  };
}

async function createImageTask(payload, ctx) {
  if (!payload.prompt?.trim()) fail("prompt is required.", "AI_PROMPT_REQUIRED");
  let operation;
  try {
    operation = normalizeVisualEditOperation(payload.operation || {}, payload.source_media_urls || []);
  } catch (error) {
    fail(error.message, error.code || "VISUAL_EDIT_CONTRACT_INVALID", 400, error.details);
  }
  const existing = db.prepare("SELECT * FROM ai_image_tasks WHERE idempotency_key=?").get(ctx.idempotency_key);
  if (existing) return { task: serializeImageTask(existing), created: false };
  const aiTaskId = uid("aitask");
  const at = now();
  const seed = Number.isSafeInteger(payload.seed) ? payload.seed : Math.floor(Math.random() * 2147483647);
  const width = Math.min(1536, Math.max(512, Number(payload.width) || 1024));
  const height = Math.min(1536, Math.max(512, Number(payload.height) || 1024));
  const negativePrompt = payload.negative_prompt || "low quality, blurry, distorted, watermark, text, unsafe construction detail";
  const panorama = payload.output_type === "equirectangular_2_1";
  const sourceMedia = Array.isArray(payload.source_media_urls) ? payload.source_media_urls.find(Boolean) : null;
  let sourceImage = null;
  let panoramaManifest = null;
  try {
    if (panorama) {
      const prepared = await preparePanoramaInput(payload, aiTaskId, width, height);
      sourceImage = prepared.sourceImage;
      panoramaManifest = prepared.manifest;
    } else {
      sourceImage = await uploadComfySource(sourceMedia, aiTaskId);
    }
  } catch (error) {
    if (error?.status) throw error;
    fail(panorama ? "The four panorama sources could not be projected and imported into ComfyUI." : "The project reference image could not be imported into ComfyUI.", panorama ? "PANORAMA_PREPROCESS_FAILED" : "COMFYUI_SOURCE_IMPORT_FAILED", 502, { cause: error.message });
  }
  const workflow = panorama
    ? buildPanoramaWorkflow({ prompt: payload.prompt.trim(), negativePrompt, seed, filenamePrefix: `StyleMatchAI/${aiTaskId}`, sourceImage })
    : buildSdxlWorkflow({ prompt: payload.prompt.trim(), negativePrompt, seed, width, height, filenamePrefix: `StyleMatchAI/${aiTaskId}`, sourceImage });
  let response;
  try {
    response = await fetch(`${COMFYUI_URL}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: workflow, client_id: "stylematch-local-api" }) });
  } catch (error) {
    fail("ComfyUI is not reachable. Start the local ComfyUI service on port 8188.", "COMFYUI_OFFLINE", 503, { cause: error.message, comfyui_url: COMFYUI_URL });
  }
  if (!response.ok) fail("ComfyUI rejected the workflow.", "COMFYUI_WORKFLOW_REJECTED", 502, { response: await response.text() });
  const queued = await response.json();
  db.prepare(`INSERT INTO ai_image_tasks (ai_task_id,prompt_id,tenant_id,organization_id,purpose,consent_ref,trace_id,idempotency_key,stylematch_project_id,case_code,prompt,negative_prompt,workflow_version,checkpoint,seed,width,height,status,created_at,updated_at,style_id,style_catalog_version,source_media_count,requested_output_type,operation_metadata) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(aiTaskId, queued.prompt_id, ctx.tenant_id, ctx.organization_id, ctx.purpose, ctx.consent_ref, ctx.trace_id, ctx.idempotency_key, payload.stylematch_project_id || null, payload.case_code || null, payload.prompt.trim(), negativePrompt, panorama ? PANORAMA_WORKFLOW_VERSION : sourceImage ? "stylematch-sdxl-img2img-v1" : "stylematch-sdxl-v1", COMFYUI_CHECKPOINT, seed, width, height, "queued", at, at, payload.style_id || null, payload.style_catalog_version || null, Number(payload.source_media_count) || 0, payload.output_type || "perspective_draft", JSON.stringify(panoramaManifest ? { ...operation, panorama_capture: panoramaManifest } : operation));
  return { task: serializeImageTask(db.prepare("SELECT * FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId)), created: true };
}

async function refreshImageTask(aiTaskId) {
  const row = db.prepare("SELECT * FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId);
  if (!row) fail("AI image task not found.", "AI_TASK_NOT_FOUND", 404);
  if (["completed", "failed"].includes(row.status)) return row;
  try {
    const response = await fetch(`${COMFYUI_URL}/history/${encodeURIComponent(row.prompt_id)}`);
    if (!response.ok) return row;
    const history = await response.json();
    const item = history[row.prompt_id];
    const image = item && Object.values(item.outputs || {}).flatMap((output) => output.images || [])[0];
    if (image) {
      let qualityReport = null;
      let outputSha256 = null;
      try {
        const query = new URLSearchParams({ filename: image.filename, subfolder: image.subfolder || "", type: image.type || "output" });
        const imageResponse = await fetch(`${COMFYUI_URL}/view?${query}`);
        if (imageResponse.ok) {
          const bytes = Buffer.from(await imageResponse.arrayBuffer());
          outputSha256 = createHash("sha256").update(bytes).digest("hex");
          qualityReport = inspectGeneratedImage({ bytes, contentType: imageResponse.headers.get("content-type") || "", expectedWidth: row.width, expectedHeight: row.height, outputType: row.requested_output_type });
        }
      } catch { /* Completion remains valid; QA can be retried while ComfyUI restarts. */ }
      db.prepare("UPDATE ai_image_tasks SET status='completed',output_filename=?,output_subfolder=?,output_type=?,quality_report=?,output_sha256=?,updated_at=? WHERE ai_task_id=?").run(image.filename, image.subfolder || "", image.type || "output", qualityReport ? JSON.stringify(qualityReport) : null, outputSha256, now(), aiTaskId);
    } else if (item?.status?.status_str === "error") {
      db.prepare("UPDATE ai_image_tasks SET status='failed',error=?,updated_at=? WHERE ai_task_id=?").run(JSON.stringify(item.status.messages || []), now(), aiTaskId);
    } else {
      db.prepare("UPDATE ai_image_tasks SET status='running',updated_at=? WHERE ai_task_id=?").run(now(), aiTaskId);
    }
  } catch { /* Keep the persisted task retryable while ComfyUI restarts. */ }
  return db.prepare("SELECT * FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId);
}

function validateStyleTestDelivery(payload) {
  const email = String(payload.to || payload.lead?.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("A valid recipient email is required.", "INVALID_EMAIL");
  if (!payload.lead?.style_test_id || !String(payload.lead?.name || "").trim() || !String(payload.lead?.phone || "").trim()) fail("Style test lead name and phone are required.", "STYLE_TEST_LEAD_REQUIRED");
  if (payload.consent?.result_delivery_consent !== true) fail("Result delivery consent is required.", "RESULT_DELIVERY_CONSENT_REQUIRED");
  if (!payload.consent?.privacy_notice_version || !payload.consent?.consent_recorded_at || !payload.consent?.retention_until) {
    fail("Consent evidence is incomplete.", "CONSENT_EVIDENCE_REQUIRED");
  }
  if (!Array.isArray(payload.ai_task_ids) || payload.ai_task_ids.length !== 4) {
    fail("Exactly four generated reference images are required.", "REFERENCE_IMAGES_REQUIRED");
  }
  if (!String(payload.subject || "").trim() || !String(payload.body || "").trim()) fail("Email subject and body are required.", "EMAIL_CONTENT_REQUIRED");
  return email;
}

async function loadStyleTestAttachments(aiTaskIds, ctx) {
  return Promise.all(aiTaskIds.map(async (aiTaskId, index) => {
    const task = await refreshImageTask(aiTaskId);
    if (task.tenant_id !== ctx.tenant_id || task.organization_id !== ctx.organization_id) {
      fail("AI image task is outside the current tenant.", "AI_TASK_FORBIDDEN", 403);
    }
    if (task.status !== "completed") fail("A reference image is not ready.", "AI_IMAGE_NOT_READY", 409);
    const query = new URLSearchParams({
      filename: task.output_filename,
      subfolder: task.output_subfolder || "",
      type: task.output_type || "output",
    });
    const response = await fetch(`${COMFYUI_URL}/view?${query}`);
    if (!response.ok) fail("Generated image could not be attached.", "COMFYUI_IMAGE_READ_FAILED", 502);
    return {
      filename: `stylematch-reference-${index + 1}.png`,
      content: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") || "image/png",
    };
  }));
}

function waitForSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let response = "";
    const timer = setTimeout(() => finish(new Error("SMTP response timed out.")), 20000);
    const onData = (chunk) => {
      response += chunk.toString("utf8");
      const lines = response.split("\r\n").filter(Boolean);
      if (lines.some((line) => /^\d{3} /.test(line))) finish(null, response);
    };
    const onError = (error) => finish(error);
    const finish = (error, value) => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
      if (error) reject(error);
      else resolve(value);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function smtpCommand(socket, command, acceptedCodes) {
  const responsePromise = waitForSmtpResponse(socket);
  socket.write(`${command}\r\n`);
  const response = await responsePromise;
  const code = Number(response.slice(0, 3));
  if (!acceptedCodes.includes(code)) throw new Error(`SMTP rejected ${command.split(" ")[0]} with ${response.trim()}`);
  return response;
}

function connectSmtpSocket(factory, eventName) {
  return new Promise((resolve, reject) => {
    const socket = factory();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timed out."));
    }, 20000);
    socket.once(eventName, () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function mimeHeader(value) {
  const safeValue = String(value || "").replace(/[\r\n]+/g, " ").trim();
  return `=?UTF-8?B?${Buffer.from(safeValue, "utf8").toString("base64")}?=`;
}

function wrapBase64(buffer) {
  return buffer.toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
}

function buildMimeMessage({ fromName, to, subject, text, attachments }) {
  const boundary = `stylematch-${randomUUID()}`;
  const lines = [
    `From: ${mimeHeader(fromName)} <${SMTP_FROM}>`,
    `To: <${to}>`,
    `Subject: ${mimeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(Buffer.from(text, "utf8")),
  ];
  attachments.forEach((attachment) => {
    lines.push(
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "",
      wrapBase64(attachment.content)
    );
  });
  lines.push(`--${boundary}--`, "");
  return lines.join("\r\n");
}

async function sendSmtpMail(message) {
  let socket = SMTP_SECURE
    ? await connectSmtpSocket(() => connectTls({ host: SMTP_HOST, port: SMTP_PORT, servername: SMTP_HOST }), "secureConnect")
    : await connectSmtpSocket(() => connectNet({ host: SMTP_HOST, port: SMTP_PORT }), "connect");
  try {
    const greeting = await waitForSmtpResponse(socket);
    if (Number(greeting.slice(0, 3)) !== 220) throw new Error(`SMTP greeting failed: ${greeting.trim()}`);
    let capabilities = await smtpCommand(socket, `EHLO ${HOST}`, [250]);
    if (!SMTP_SECURE && capabilities.includes("STARTTLS")) {
      await smtpCommand(socket, "STARTTLS", [220]);
      socket = await connectSmtpSocket(() => connectTls({ socket, servername: SMTP_HOST }), "secureConnect");
      capabilities = await smtpCommand(socket, `EHLO ${HOST}`, [250]);
    } else if (!SMTP_SECURE && !SMTP_ALLOW_INSECURE) {
      throw new Error("SMTP server does not offer STARTTLS. Refusing an insecure connection.");
    }
    if (SMTP_USER) {
      await smtpCommand(socket, "AUTH LOGIN", [334]);
      await smtpCommand(socket, Buffer.from(SMTP_USER).toString("base64"), [334]);
      await smtpCommand(socket, Buffer.from(SMTP_PASS).toString("base64"), [235]);
    }
    await smtpCommand(socket, `MAIL FROM:<${SMTP_FROM}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${message.to}>`, [250, 251]);
    await smtpCommand(socket, "DATA", [354]);
    const mime = buildMimeMessage(message).replace(/(^|\r\n)\./g, "$1..");
    const dataResponse = await smtpCommand(socket, `${mime}\r\n.`, [250]);
    await smtpCommand(socket, "QUIT", [221]);
    return { messageId: dataResponse.trim() };
  } finally {
    socket.destroy();
  }
}

async function deliverStyleTestResult(payload, ctx) {
  const email = validateStyleTestDelivery(payload);
  const at = now();
  const leadId = `lead_${createHash("sha256").update(`${payload.lead.style_test_id}:${email}`).digest("hex").slice(0, 20)}`;
  const deliveryId = uid("mail");
  const marketingConsent = payload.consent.marketing_consent === true;

  db.prepare(`INSERT INTO style_test_leads
    (lead_id,style_test_id,name,email,phone,result_payload,result_delivery_consent,marketing_consent,marketing_consent_status,privacy_notice_version,consent_recorded_at,retention_until,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(style_test_id) DO UPDATE SET
      name=excluded.name,email=excluded.email,phone=excluded.phone,result_payload=excluded.result_payload,
      result_delivery_consent=excluded.result_delivery_consent,marketing_consent=excluded.marketing_consent,
      marketing_consent_status=excluded.marketing_consent_status,privacy_notice_version=excluded.privacy_notice_version,
      consent_recorded_at=excluded.consent_recorded_at,retention_until=excluded.retention_until,updated_at=excluded.updated_at`)
    .run(
      leadId,
      payload.lead.style_test_id,
      String(payload.lead.name).trim(),
      email,
      String(payload.lead.phone || "").trim() || null,
      JSON.stringify(payload.result || {}),
      1,
      marketingConsent ? 1 : 0,
      marketingConsent ? "opted_in" : "declined",
      payload.consent.privacy_notice_version,
      payload.consent.consent_recorded_at,
      payload.consent.retention_until,
      at,
      at
    );

  const attachments = await loadStyleTestAttachments(payload.ai_task_ids, ctx);
  const emailOutboxDir = join(dataDir, "email-outbox");
  mkdirSync(emailOutboxDir, { recursive: true });
  const outboxPath = join(emailOutboxDir, `${deliveryId}.json`);
  let status = "outbox_only";
  let providerMessageId = null;
  let deliveryError = null;

  writeFileSync(outboxPath, JSON.stringify({
    delivery_id: deliveryId,
    lead_id: leadId,
    to: email,
    subject: payload.subject,
    body: payload.body,
    ai_task_ids: payload.ai_task_ids,
    marketing_consent: marketingConsent,
    created_at: at,
  }, null, 2), "utf8");

  if (SMTP_HOST && SMTP_FROM) {
    try {
      const info = await sendSmtpMail({
        fromName: payload.from_name || "StyleMatch AI",
        to: email,
        subject: payload.subject,
        text: payload.body,
        attachments,
      });
      status = "sent";
      providerMessageId = info.messageId || null;
    } catch (error) {
      status = "failed";
      deliveryError = error.message;
    }
  }

  db.prepare(`INSERT INTO style_test_email_deliveries
    (delivery_id,lead_id,recipient_email,subject,ai_task_ids,status,provider_message_id,outbox_path,error,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(deliveryId, leadId, email, payload.subject, JSON.stringify(payload.ai_task_ids), status, providerMessageId, outboxPath, deliveryError, at, now());

  if (status === "failed") fail(`Email delivery failed; the message remains in the local outbox. ${deliveryError}`, "EMAIL_DELIVERY_FAILED", 502, { delivery_id: deliveryId });
  return {
    success: true,
    delivery_id: deliveryId,
    lead_id: leadId,
    delivery_status: status,
    marketing_consent: marketingConsent,
    message: status === "sent"
      ? `郵件已寄至 ${email}。`
      : `尚未設定 SMTP，結果已保存在本機待寄匣；設定郵件帳號後才能寄到 ${email}。`,
  };
}

function listStyleTestLeads(ctx, marketingOnly) {
  assertMemberTier(ctx, ["headquarter"], "style_test_leads_read");
  const where = marketingOnly
    ? "WHERE marketing_consent=1 AND marketing_consent_status='opted_in' AND retention_until>?"
    : "WHERE retention_until>?";
  return db.prepare(`SELECT lead_id,style_test_id,name,email,phone,result_payload,marketing_consent,marketing_consent_status,privacy_notice_version,consent_recorded_at,retention_until,marketing_withdrawn_at,created_at,updated_at
    FROM style_test_leads ${where} ORDER BY created_at DESC`)
    .all(now())
    .map((lead) => ({
      ...lead,
      result: JSON.parse(lead.result_payload),
      result_payload: undefined,
      marketing_consent: Boolean(lead.marketing_consent),
    }));
}

function updateStyleTestLeadPrivacy(leadId, action, ctx) {
  assertMemberTier(ctx, ["headquarter"], "style_test_lead_privacy");
  const lead = db.prepare("SELECT * FROM style_test_leads WHERE lead_id=?").get(leadId);
  if (!lead) fail("Style test lead not found.", "STYLE_TEST_LEAD_NOT_FOUND", 404);
  if (action === "withdraw-marketing") {
    const at = now();
    db.prepare("UPDATE style_test_leads SET marketing_consent=0,marketing_consent_status='withdrawn',marketing_withdrawn_at=?,updated_at=? WHERE lead_id=?")
      .run(at, at, leadId);
    return { lead_id: leadId, marketing_consent: false, marketing_consent_status: "withdrawn", marketing_withdrawn_at: at };
  }

  const deliveries = db.prepare("SELECT outbox_path FROM style_test_email_deliveries WHERE lead_id=?").all(leadId);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM style_test_email_deliveries WHERE lead_id=?").run(leadId);
    db.prepare("DELETE FROM style_test_leads WHERE lead_id=?").run(leadId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  deliveries.forEach(({ outbox_path: outboxPath }) => {
    if (!outboxPath) return;
    try { unlinkSync(outboxPath); } catch { /* The database deletion remains authoritative. */ }
  });
  return { lead_id: leadId, deleted: true };
}

function cleanupExpiredStyleTestLeads() {
  const expired = db.prepare("SELECT lead_id FROM style_test_leads WHERE retention_until<=?").all(now());
  expired.forEach(({ lead_id: leadId }) => updateStyleTestLeadPrivacy(leadId, "delete", {
    member_tier: "headquarter",
  }));
}

function getDownloadEntitlement(aiTaskId) {
  const task = db.prepare("SELECT ai_task_id,status FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId);
  if (!task) fail("AI image task not found.", "AI_TASK_NOT_FOUND", 404);
  const entitlement = db.prepare("SELECT * FROM ai_download_entitlements WHERE ai_task_id=?").get(aiTaskId);
  return {
    ai_task_id: aiTaskId,
    generation_status: task.status,
    payment_status: entitlement?.payment_status || "unpaid",
    download_unlocked: entitlement?.payment_status === "paid",
    checkout_session_id: entitlement?.checkout_session_id || null,
    paid_at: entitlement?.paid_at || null,
  };
}

function fulfillCheckoutSession(session) {
  const aiTaskId = session?.metadata?.ai_task_id || session?.client_reference_id;
  if (!aiTaskId || session.payment_status === "unpaid") return null;
  const at = now();
  db.prepare(`
    INSERT INTO ai_download_entitlements
      (ai_task_id,checkout_session_id,payment_status,amount_total,currency,paid_at,updated_at)
    VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(ai_task_id) DO UPDATE SET
      checkout_session_id=excluded.checkout_session_id,
      payment_status=excluded.payment_status,
      amount_total=excluded.amount_total,
      currency=excluded.currency,
      paid_at=COALESCE(ai_download_entitlements.paid_at,excluded.paid_at),
      updated_at=excluded.updated_at
  `).run(aiTaskId, session.id, "paid", session.amount_total || null, session.currency || null, at, at);
  return getDownloadEntitlement(aiTaskId);
}

async function retrieveStripeSession(sessionId) {
  if (!STRIPE_SECRET_KEY) fail("Stripe is not configured.", "PAYMENT_PROVIDER_NOT_CONFIGURED", 503);
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const session = await response.json();
  if (!response.ok) fail("Stripe Checkout session could not be verified.", "PAYMENT_SESSION_VERIFY_FAILED", 502, { stripe: session.error?.message });
  return session;
}

async function createDownloadCheckout(aiTaskId) {
  const task = db.prepare("SELECT ai_task_id,status,case_code FROM ai_image_tasks WHERE ai_task_id=?").get(aiTaskId);
  if (!task) fail("AI image task not found.", "AI_TASK_NOT_FOUND", 404);
  if (task.status !== "completed") fail("The generated file must be completed before checkout.", "AI_TASK_NOT_COMPLETED", 409);
  if (!STRIPE_SECRET_KEY || !STRIPE_PANORAMA_PRICE_ID) {
    fail("Stripe Checkout is not configured. Set STRIPE_SECRET_KEY and STRIPE_PANORAMA_PRICE_ID.", "PAYMENT_PROVIDER_NOT_CONFIGURED", 503);
  }
  const current = getDownloadEntitlement(aiTaskId);
  if (current.download_unlocked) return { entitlement: current, checkout_url: null };

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price]", STRIPE_PANORAMA_PRICE_ID);
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", aiTaskId);
  params.set("metadata[ai_task_id]", aiTaskId);
  params.set("success_url", `${STYLEMATCH_APP_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}#/AIGenerate`);
  params.set("cancel_url", `${STYLEMATCH_APP_URL}/?payment=cancelled#/AIGenerate`);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const session = await response.json();
  if (!response.ok) fail("Stripe Checkout session could not be created.", "PAYMENT_SESSION_CREATE_FAILED", 502, { stripe: session.error?.message });
  db.prepare(`
    INSERT INTO ai_download_entitlements
      (ai_task_id,checkout_session_id,payment_status,amount_total,currency,updated_at)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(ai_task_id) DO UPDATE SET
      checkout_session_id=excluded.checkout_session_id,
      payment_status='unpaid',
      updated_at=excluded.updated_at
  `).run(aiTaskId, session.id, "unpaid", session.amount_total || null, session.currency || null, now());
  return { entitlement: getDownloadEntitlement(aiTaskId), checkout_url: session.url };
}

function verifyStripeSignature(rawBody, signatureHeader) {
  if (!STRIPE_WEBHOOK_SECRET) return false;
  const values = Object.fromEntries(String(signatureHeader || "").split(",").map((part) => part.split("=")));
  if (!values.t || !values.v1 || Math.abs(Date.now() / 1000 - Number(values.t)) > 300) return false;
  const expected = createHmac("sha256", STRIPE_WEBHOOK_SECRET).update(`${values.t}.${rawBody}`).digest("hex");
  const actualBuffer = Buffer.from(values.v1, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function upsertStyleMatchProject(project, syncedAt = now()) {
  const projectId = project.stylematch_project_id || project.project_id || project.id || project.case_code;
  if (!projectId) return null;
  db.prepare(`
    INSERT INTO stylematch_projects (
      stylematch_project_id,case_code,user_email,source_status,stage_status,service_option,
      house_type,room_layout,square_footage,budget_range,trace_id,source_payload,synced_at,created_at,updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(stylematch_project_id) DO UPDATE SET
      case_code=excluded.case_code,
      user_email=excluded.user_email,
      source_status=excluded.source_status,
      stage_status=excluded.stage_status,
      service_option=excluded.service_option,
      house_type=excluded.house_type,
      room_layout=excluded.room_layout,
      square_footage=excluded.square_footage,
      budget_range=excluded.budget_range,
      trace_id=excluded.trace_id,
      source_payload=excluded.source_payload,
      synced_at=excluded.synced_at,
      updated_at=excluded.updated_at
  `).run(
    projectId,
    project.case_code || null,
    project.user_email || null,
    project.match_status || project.status || null,
    project.stage_status || null,
    project.service_option || null,
    project.house_type || null,
    project.room_layout || null,
    Number.isFinite(Number(project.square_footage)) ? Number(project.square_footage) : null,
    project.budget_range || null,
    project.trace_id || project.correlation_id || uid("tr"),
    JSON.stringify(project),
    syncedAt,
    project.created_at || syncedAt,
    project.updated_at || syncedAt,
  );
  return projectId;
}

function upsertStyleMatchStyleTest(styleTest, syncedAt = now()) {
  const styleTestId = styleTest.id || styleTest.style_test_id || styleTest.trace_id;
  if (!styleTestId) return null;
  db.prepare(`
    INSERT INTO stylematch_style_tests (
      style_test_id,user_email,primary_style,secondary_style,trace_id,source_payload,synced_at,created_at
    ) VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(style_test_id) DO UPDATE SET
      user_email=excluded.user_email,
      primary_style=excluded.primary_style,
      secondary_style=excluded.secondary_style,
      trace_id=excluded.trace_id,
      source_payload=excluded.source_payload,
      synced_at=excluded.synced_at
  `).run(
    styleTestId,
    styleTest.user_email || null,
    styleTest.primary_style || styleTest.result?.primary_style || null,
    styleTest.secondary_style || styleTest.result?.secondary_style || null,
    styleTest.trace_id || uid("tr"),
    JSON.stringify(styleTest),
    syncedAt,
    styleTest.created_at || syncedAt,
  );
  return styleTestId;
}

function syncStyleMatchLocalStore(payload, ctx) {
  const database = payload.database || payload;
  const projects = Array.isArray(database.projects) ? database.projects : [];
  const styleTests = Array.isArray(database.styleTests) ? database.styleTests : [];
  const syncedAt = now();
  const imported = { projects: 0, style_tests: 0 };

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const project of projects) if (upsertStyleMatchProject(project, syncedAt)) imported.projects += 1;
    for (const styleTest of styleTests) if (upsertStyleMatchStyleTest(styleTest, syncedAt)) imported.style_tests += 1;
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  emitEvent("stylematch.local_store_synced", ctx, {
    import_id: uid("stylematch_import"),
    imported,
    source: payload.origin || "StyleMatchAI localStorage export",
    synced_at: syncedAt,
  });
  return { status: "synced", synced_at: syncedAt, imported };
}

function serializeStyleMatchProject(row) {
  return {
    ...row,
    source_payload: parseJson(row.source_payload),
  };
}

function listStyleMatchProjects() {
  return db.prepare("SELECT * FROM stylematch_projects ORDER BY COALESCE(updated_at, synced_at) DESC, id DESC").all().map(serializeStyleMatchProject);
}

function recordKnowledgeQuery(payload, ctx) {
  const queryId = payload.query_id || uid("kq");
  const results = Array.isArray(payload.results) ? payload.results : [];
  const topSources = results.slice(0, 8).map((item) => ({
    document_id: item.documentId || item.document_id || null,
    category: item.category || item.categoryLabel || null,
    title: item.title || null,
    heading: item.heading || null,
    path: item.path || item.sourceUrl || null,
    score: item.score ?? null,
  }));
  const at = now();
  db.prepare(`
    INSERT INTO stylematch_knowledge_queries (
      query_id,stylematch_project_id,case_code,query_text,answer,result_count,top_sources,source_payload,trace_id,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(query_id) DO UPDATE SET
      answer=excluded.answer,
      result_count=excluded.result_count,
      top_sources=excluded.top_sources,
      source_payload=excluded.source_payload
  `).run(
    queryId,
    payload.stylematch_project_id || payload.project_id || null,
    payload.case_code || null,
    payload.query || payload.query_text || "",
    payload.answer || "",
    results.length,
    JSON.stringify(topSources),
    JSON.stringify(payload),
    ctx.trace_id,
    at,
  );
  return { query_id: queryId, top_sources: topSources, result_count: results.length, created_at: at };
}

function createRiskAssessment(payload, ctx) {
  const assessmentId = payload.assessment_id || uid("risk");
  const score = Number.isFinite(Number(payload.risk_score)) ? Number(payload.risk_score) : null;
  const level = payload.risk_level || (score === null ? "R1" : score >= 85 ? "R4" : score >= 70 ? "R3" : score >= 45 ? "R2" : score >= 20 ? "R1" : "R0");
  const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
  const at = now();
  db.prepare(`
    INSERT INTO stylematch_risk_assessments (
      assessment_id,stylematch_project_id,case_code,risk_level,risk_score,reasons,source_payload,trace_id,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    assessmentId,
    payload.stylematch_project_id || payload.project_id || null,
    payload.case_code || null,
    level,
    score,
    JSON.stringify(reasons),
    JSON.stringify(payload),
    ctx.trace_id,
    at,
  );
  return { assessment_id: assessmentId, risk_level: level, risk_score: score, reasons, created_at: at };
}

function createGateEvent(payload, ctx) {
  const gateEventId = payload.gate_event_id || uid("sm_gate");
  const at = now();
  db.prepare(`
    INSERT INTO stylematch_gate_events (
      gate_event_id,stylematch_project_id,case_code,gate_key,status,reason,source_payload,trace_id,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    gateEventId,
    payload.stylematch_project_id || payload.project_id || null,
    payload.case_code || null,
    payload.gate_key || "knowledge_review",
    payload.status || "pending",
    payload.reason || "",
    JSON.stringify(payload),
    ctx.trace_id,
    at,
  );
  return { gate_event_id: gateEventId, gate_key: payload.gate_key || "knowledge_review", status: payload.status || "pending", created_at: at };
}

function buildStyleMatchPgpPackage(projectIdOrCode, ctx) {
  const project = db.prepare("SELECT * FROM stylematch_projects WHERE stylematch_project_id=? OR case_code=?").get(projectIdOrCode, projectIdOrCode);
  if (!project) fail("StyleMatch project was not found in local SQLite.", "STYLEMATCH_PROJECT_NOT_FOUND", 404);
  const knowledgeQueries = db.prepare("SELECT * FROM stylematch_knowledge_queries WHERE stylematch_project_id=? OR case_code=? ORDER BY id DESC LIMIT 20").all(project.stylematch_project_id, project.case_code)
    .map((row) => ({ ...row, top_sources: parseJson(row.top_sources, []), source_payload: parseJson(row.source_payload) }));
  const risks = db.prepare("SELECT * FROM stylematch_risk_assessments WHERE stylematch_project_id=? OR case_code=? ORDER BY id DESC LIMIT 20").all(project.stylematch_project_id, project.case_code)
    .map((row) => ({ ...row, reasons: parseJson(row.reasons, []), source_payload: parseJson(row.source_payload) }));
  const gates = db.prepare("SELECT * FROM stylematch_gate_events WHERE stylematch_project_id=? OR case_code=? ORDER BY id DESC LIMIT 20").all(project.stylematch_project_id, project.case_code)
    .map((row) => ({ ...row, source_payload: parseJson(row.source_payload) }));
  const at = now();
  const pgp = {
    pgp_id: uid("sm_pgp"),
    schema: "StyleMatchAI.LocalPGP/0.1",
    generated_at: at,
    project: serializeStyleMatchProject(project),
    knowledge_queries: knowledgeQueries,
    risk_assessments: risks,
    gate_events: gates,
    status: gates.some((gate) => gate.status === "hold" || gate.status === "fail") ? "review_required" : "draft",
  };
  db.prepare(`
    INSERT INTO stylematch_pgp_packages (
      pgp_id,stylematch_project_id,case_code,package_status,package_payload,trace_id,created_at,updated_at
    ) VALUES (?,?,?,?,?,?,?,?)
  `).run(pgp.pgp_id, project.stylematch_project_id, project.case_code, pgp.status, JSON.stringify(pgp), ctx.trace_id, at, at);
  return pgp;
}

const R9_RISK_STATES = new Set(["NORMAL", "WARNING", "RESTRICTED", "HOLD", "BLOCKED", "ESCALATED", "RESOLVED"]);
const R9_TRIGGER_RESULTS = new Set(["ALLOW", "WARN", "CONDITIONAL", "RESTRICT", "HOLD", "BLOCK", "ESCALATE"]);
const R9_REVIEW_STATUSES = new Set(["pending", "accepted", "rejected"]);

function assertNoDirectStateTransition(payload) {
  const forbidden = ["current_stage", "next_stage", "formal_state", "formal_state_transition", "gate_status"]
    .filter((field) => payload[field] !== undefined);
  if (forbidden.length) {
    fail(
      "R9 evaluation objects cannot directly change the R5.2 state machine. Use the authorized Gate evaluation endpoint.",
      "R9_DIRECT_STATE_TRANSITION_FORBIDDEN",
      409,
      { forbidden_fields: forbidden },
    );
  }
}

function caseRowForR9(id, ctx) {
  const row = assertCaseScope(id, ctx);
  assertCaseAuthorization(id, ctx);
  return row;
}

function r9RecordEvent(row, action, detail, ctx, eventType, data) {
  const at = now();
  db.prepare("INSERT INTO audit_logs (case_id,action,actor,detail,trace_id,created_at) VALUES (?,?,?,?,?,?)")
    .run(row.id, action, ctx.user_id, detail, ctx.trace_id, at);
  emitEvent(eventType, { ...ctx, correlation_id: row.correlation_id }, data);
  return at;
}

function createGovernanceDecision(id, payload, ctx) {
  assertNoDirectStateTransition(payload);
  const row = caseRowForR9(id, ctx);
  if (!payload.decision_type || !payload.outcome || !payload.rationale || !payload.rule_version) {
    fail("decision_type, outcome, rationale, and rule_version are required.");
  }
  const decisionObjectId = payload.decision_object_id || uid("decision");
  const existing = db.prepare("SELECT * FROM governance_decision_objects WHERE decision_object_id=?").get(decisionObjectId);
  if (existing) return { ...existing, source_refs: parseJson(existing.source_refs, []), idempotent_replay: true };
  const sourceRefs = Array.isArray(payload.source_refs) ? payload.source_refs : [];
  const at = now();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO governance_decision_objects (decision_object_id,case_id,decision_type,outcome,rationale,source_refs,authority_role,decided_by,rule_version,trace_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(decisionObjectId, row.id, payload.decision_type, payload.outcome, payload.rationale, JSON.stringify(sourceRefs), ctx.case_role, ctx.user_id, payload.rule_version, ctx.trace_id, at);
    r9RecordEvent(row, "governance.decision.recorded", `${decisionObjectId}:${payload.outcome}`, ctx, "GovernanceDecisionRecorded", { decision_object_id: decisionObjectId, isafe_case_id: row.isafe_case_id, outcome: payload.outcome, state_transition_applied: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { decision_object_id: decisionObjectId, decision_type: payload.decision_type, outcome: payload.outcome, rationale: payload.rationale, source_refs: sourceRefs, authority_role: ctx.case_role, decided_by: ctx.user_id, rule_version: payload.rule_version, trace_id: ctx.trace_id, created_at: at, state_transition_applied: false };
}

function createGovernanceRiskState(id, payload, ctx) {
  assertNoDirectStateTransition(payload);
  const row = caseRowForR9(id, ctx);
  if (!R9_RISK_STATES.has(payload.state)) fail("state is not a Patent V7 risk state.", "R9_RISK_STATE_INVALID");
  if (!payload.rule_version || !payload.source_type) fail("rule_version and source_type are required.");
  const review = payload.human_review_status || "pending";
  if (!R9_REVIEW_STATUSES.has(review)) fail("human_review_status is invalid.");
  const riskStateId = payload.risk_state_id || uid("risk_state");
  const reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
  const at = now();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO governance_risk_states (risk_state_id,case_id,state,score,reasons,source_type,rule_version,human_review_status,decision_object_id,trace_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(riskStateId, row.id, payload.state, Number.isFinite(Number(payload.score)) ? Number(payload.score) : null, JSON.stringify(reasons), payload.source_type, payload.rule_version, review, payload.decision_object_id || null, ctx.trace_id, ctx.user_id, at);
    r9RecordEvent(row, "governance.risk_state.recorded", `${riskStateId}:${payload.state}`, ctx, "GovernanceRiskStateRecorded", { risk_state_id: riskStateId, isafe_case_id: row.isafe_case_id, state: payload.state, state_transition_applied: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { risk_state_id: riskStateId, state: payload.state, score: Number.isFinite(Number(payload.score)) ? Number(payload.score) : null, reasons, source_type: payload.source_type, rule_version: payload.rule_version, human_review_status: review, decision_object_id: payload.decision_object_id || null, trace_id: ctx.trace_id, created_at: at, state_transition_applied: false };
}

function upsertTriggerRule(payload, ctx) {
  if (!payload.rule_id || !payload.name || !payload.version || !R9_TRIGGER_RESULTS.has(payload.outcome)) {
    fail("rule_id, name, version, and a valid Patent V7 outcome are required.");
  }
  const status = payload.status || "draft";
  if (!["draft", "active", "retired"].includes(status)) fail("Trigger rule status is invalid.");
  const at = now();
  db.prepare(`
    INSERT INTO governance_trigger_rules (rule_id,tenant_id,organization_id,name,version,status,condition_json,outcome,pending_action,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(rule_id,version,tenant_id,organization_id) DO UPDATE SET
      name=excluded.name,status=excluded.status,condition_json=excluded.condition_json,outcome=excluded.outcome,
      pending_action=excluded.pending_action,updated_at=excluded.updated_at
  `).run(payload.rule_id, ctx.tenant_id, ctx.organization_id, payload.name, payload.version, status, JSON.stringify(payload.condition || {}), payload.outcome, payload.pending_action || null, ctx.user_id, at, at);
  return { rule_id: payload.rule_id, name: payload.name, version: payload.version, status, condition: payload.condition || {}, outcome: payload.outcome, pending_action: payload.pending_action || null, updated_at: at };
}

function listTriggerRules(ctx) {
  return db.prepare("SELECT rule_id,name,version,status,condition_json,outcome,pending_action,created_by,created_at,updated_at FROM governance_trigger_rules WHERE tenant_id=? AND organization_id=? ORDER BY id DESC")
    .all(ctx.tenant_id, ctx.organization_id)
    .map((item) => ({ ...item, condition: parseJson(item.condition_json), condition_json: undefined }));
}

function queueGovernanceNotification(row, sourceType, sourceId, severity, policyVersion, ctx) {
  const notificationId = uid("notification");
  const at = now();
  db.prepare(`INSERT INTO governance_notifications (notification_id,case_id,source_type,source_id,severity,channel,recipient_role,status,escalation_level,policy_version,due_at,trace_id,created_at) VALUES (?,?,?,?,?,'in_app','reviewer','queued',0,?,?,?,?)`)
    .run(notificationId, row.id, sourceType, sourceId, severity, policyVersion, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), ctx.trace_id, at);
  return notificationId;
}

function updateGovernanceNotification(id, notificationId, action, ctx) {
  const row = caseRowForR9(id, ctx);
  const notification = db.prepare("SELECT * FROM governance_notifications WHERE notification_id=? AND case_id=?").get(notificationId, row.id);
  if (!notification) fail("Governance notification was not found.", "R9_NOTIFICATION_NOT_FOUND", 404);
  const at = now();
  if (action === "acknowledge") {
    db.prepare("UPDATE governance_notifications SET status='acknowledged',acknowledged_by=?,acknowledged_at=? WHERE id=?")
      .run(ctx.user_id, at, notification.id);
  } else if (action === "escalate") {
    db.prepare("UPDATE governance_notifications SET status='escalated',escalation_level=escalation_level+1 WHERE id=?")
      .run(notification.id);
  } else {
    fail("Notification action is invalid.");
  }
  r9RecordEvent(row, `governance.notification.${action}d`, notificationId, ctx, action === "acknowledge" ? "GovernanceNotificationAcknowledged" : "GovernanceNotificationEscalated", { notification_id: notificationId, isafe_case_id: row.isafe_case_id, state_transition_applied: false });
  const updated = db.prepare("SELECT * FROM governance_notifications WHERE id=?").get(notification.id);
  delete updated.id; delete updated.case_id;
  return { ...updated, state_transition_applied: false };
}

function createTriggerEvaluation(id, payload, ctx) {
  assertNoDirectStateTransition(payload);
  const row = caseRowForR9(id, ctx);
  if (!payload.rule_id || !payload.reason) fail("rule_id and reason are required.");
  const configuredRule = db.prepare("SELECT * FROM governance_trigger_rules WHERE rule_id=? AND tenant_id=? AND organization_id=? AND status='active' ORDER BY id DESC LIMIT 1")
    .get(payload.rule_id, ctx.tenant_id, ctx.organization_id);
  const ruleVersion = payload.rule_version || configuredRule?.version;
  const result = payload.result || configuredRule?.outcome;
  if (!ruleVersion) fail("rule_version is required when no active rule exists.", "R9_TRIGGER_RULE_VERSION_REQUIRED");
  if (!R9_TRIGGER_RESULTS.has(result)) fail("result is not a Patent V7 trigger result.", "R9_TRIGGER_RESULT_INVALID");
  const review = payload.human_review_status || "pending";
  if (!R9_REVIEW_STATUSES.has(review)) fail("human_review_status is invalid.");
  const triggerEvaluationId = payload.trigger_evaluation_id || uid("trigger");
  const pendingAction = payload.pending_action || configuredRule?.pending_action || (result === "ALLOW" ? null : "human_governance_review");
  const at = now();
  let notificationId = null;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO governance_trigger_evaluations (trigger_evaluation_id,case_id,rule_id,result,facts,reason,pending_action,rule_version,human_review_status,decision_object_id,trace_id,evaluated_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(triggerEvaluationId, row.id, payload.rule_id, result, JSON.stringify(payload.facts || {}), payload.reason, pendingAction, ruleVersion, review, payload.decision_object_id || null, ctx.trace_id, ctx.user_id, at);
    if (result !== "ALLOW") notificationId = queueGovernanceNotification(row, "trigger_evaluation", triggerEvaluationId, result, ruleVersion, ctx);
    r9RecordEvent(row, "governance.trigger.evaluated", `${triggerEvaluationId}:${result}`, ctx, "GovernanceTriggerEvaluated", { trigger_evaluation_id: triggerEvaluationId, isafe_case_id: row.isafe_case_id, result, pending_action: pendingAction, notification_id: notificationId, state_transition_applied: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { trigger_evaluation_id: triggerEvaluationId, rule_id: payload.rule_id, result, facts: payload.facts || {}, reason: payload.reason, pending_action: pendingAction, rule_version: ruleVersion, human_review_status: review, decision_object_id: payload.decision_object_id || null, notification_id: notificationId, trace_id: ctx.trace_id, created_at: at, state_transition_applied: false };
}

function createExternalGovernanceEvaluation(id, payload, ctx) {
  assertNoDirectStateTransition(payload);
  const row = caseRowForR9(id, ctx);
  if (!payload.provider_id || !payload.evaluation_type || payload.input === undefined || payload.output === undefined) fail("provider_id, evaluation_type, input, and output are required.");
  const review = payload.review_status || "pending";
  if (!R9_REVIEW_STATUSES.has(review)) fail("review_status is invalid.");
  const externalEvaluationId = payload.external_evaluation_id || uid("external_eval");
  const at = now();
  const inputSha = sha256(payload.input);
  const outputSha = sha256(payload.output);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO external_governance_evaluations (external_evaluation_id,case_id,provider_id,evaluation_type,authority_classification,input_sha256,output_sha256,result,review_status,admitted_by,decision_object_id,trace_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(externalEvaluationId, row.id, payload.provider_id, payload.evaluation_type, payload.authority_classification || "advisory", inputSha, outputSha, JSON.stringify(payload.output), review, review === "accepted" ? ctx.user_id : null, payload.decision_object_id || null, ctx.trace_id, at);
    r9RecordEvent(row, "governance.external_evaluation.recorded", `${externalEvaluationId}:${review}`, ctx, "ExternalGovernanceEvaluationRecorded", { external_evaluation_id: externalEvaluationId, isafe_case_id: row.isafe_case_id, review_status: review, state_transition_applied: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { external_evaluation_id: externalEvaluationId, provider_id: payload.provider_id, evaluation_type: payload.evaluation_type, authority_classification: payload.authority_classification || "advisory", input_sha256: inputSha, output_sha256: outputSha, result: payload.output, review_status: review, admitted_by: review === "accepted" ? ctx.user_id : null, decision_object_id: payload.decision_object_id || null, trace_id: ctx.trace_id, created_at: at, state_transition_applied: false };
}

function createGovernanceAuditOutput(id, payload, ctx) {
  assertNoDirectStateTransition(payload);
  const row = caseRowForR9(id, ctx);
  if (!payload.output_type || payload.payload === undefined) fail("output_type and payload are required.");
  const auditOutputId = payload.audit_output_id || uid("audit_output");
  const sourceRefs = Array.isArray(payload.source_refs) ? payload.source_refs : [];
  const status = payload.status || "draft";
  const digest = sha256(payload.payload);
  const at = now();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO governance_audit_outputs (audit_output_id,case_id,output_type,status,payload,payload_sha256,source_refs,decision_object_id,signed_by,trace_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(auditOutputId, row.id, payload.output_type, status, JSON.stringify(payload.payload), digest, JSON.stringify(sourceRefs), payload.decision_object_id || null, payload.signed_by || null, ctx.trace_id, ctx.user_id, at);
    r9RecordEvent(row, "governance.audit_output.created", `${auditOutputId}:${status}`, ctx, "GovernanceAuditOutputCreated", { audit_output_id: auditOutputId, isafe_case_id: row.isafe_case_id, payload_sha256: digest, status, state_transition_applied: false });
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return { audit_output_id: auditOutputId, output_type: payload.output_type, status, payload: payload.payload, payload_sha256: digest, source_refs: sourceRefs, decision_object_id: payload.decision_object_id || null, signed_by: payload.signed_by || null, trace_id: ctx.trace_id, created_at: at, state_transition_applied: false };
}

function listR9GovernanceObjects(id, ctx) {
  const row = caseRowForR9(id, ctx);
  const parseRows = (sql, fields = []) => db.prepare(sql).all(row.id).map((item) => {
    const output = { ...item };
    for (const field of fields) output[field] = parseJson(output[field], field.endsWith("refs") || field === "reasons" ? [] : {});
    delete output.case_id;
    delete output.id;
    return output;
  });
  return {
    release_id: governanceRelease.release_id,
    state_contract_version: SCHEMA_VERSION,
    isafe_case_id: row.isafe_case_id,
    current_stage: row.current_stage,
    gate_status: row.gate_status,
    risk_states: parseRows("SELECT * FROM governance_risk_states WHERE case_id=? ORDER BY id DESC", ["reasons"]),
    trigger_evaluations: parseRows("SELECT * FROM governance_trigger_evaluations WHERE case_id=? ORDER BY id DESC", ["facts"]),
    audit_outputs: parseRows("SELECT * FROM governance_audit_outputs WHERE case_id=? ORDER BY id DESC", ["payload", "source_refs"]),
    external_evaluations: parseRows("SELECT * FROM external_governance_evaluations WHERE case_id=? ORDER BY id DESC", ["result"]),
    decision_objects: parseRows("SELECT * FROM governance_decision_objects WHERE case_id=? ORDER BY id DESC", ["source_refs"]),
    notifications: parseRows("SELECT * FROM governance_notifications WHERE case_id=? ORDER BY id DESC"),
  };
}

function corsHeaders(req) {
  const origin = req.headers.origin;
  return { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "http://127.0.0.1:4173", "Vary": "Origin", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Tenant-Id, X-Organization-Id, X-User-Id, X-Member-Tier, X-Certified-Member-Type, X-Case-Role, X-Server-Role, X-Case-Authorization, X-Purpose, X-Consent-Ref, X-Trace-Id, Idempotency-Key", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
}
function send(req, res, status, value) { res.writeHead(status, corsHeaders(req)); res.end(JSON.stringify(value, null, 2)); }
async function readBody(req) { const chunks = []; for await (const chunk of req) chunks.push(chunk); if (!chunks.length) return {}; try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { fail("Request body must be valid JSON.", "INVALID_JSON"); } }
async function readRawBody(req) { const chunks = []; for await (const chunk of req) chunks.push(chunk); return Buffer.concat(chunks).toString("utf8"); }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`); const ctx = requestContext(req);
  if (req.method === "OPTIONS") return send(req, res, 204, {});
  try {
    if (req.method === "POST" && url.pathname === "/api/v1/payments/stripe/webhook") {
      const rawBody = await readRawBody(req);
      if (!verifyStripeSignature(rawBody, req.headers["stripe-signature"])) return send(req, res, 400, { status: "invalid_signature" });
      const event = JSON.parse(rawBody);
      if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
        fulfillCheckoutSession(event.data.object);
        productionAdapters.fulfillProjectPayment(event.data.object);
      }
      return send(req, res, 200, { received: true });
    }
    if (req.method === "GET" && ["/api/v1/health", "/api/health"].includes(url.pathname)) return send(req, res, 200, { status: "ok", service: "isafe-local-api", governance_version: GOVERNANCE_VERSION, implementation_baseline: IMPLEMENTATION_BASELINE, governance_release_id: governanceRelease.release_id, governance_status: governanceRelease.status, active_baseline: governanceRelease.active_baseline, rag_active_version: governanceRelease.rag_active_version, archived_predecessors: governanceRelease.archived_predecessors, state_authority: governanceRelease.state_authority, patent_version: governanceRelease.patent_version, final_official_allowed: governanceRelease.final_official_allowed, schema_version: SCHEMA_VERSION, spatial_schema_version: SPATIAL_SCHEMA_VERSION, parity_contract_version: legacyParity.contract.contract_version, database: DATABASE_TYPE, auth_mode: OIDC_ISSUER ? "oidc_configured" : "local-development-token", production_adapters: productionAdapters.capabilities(), time: now() });
    if (req.method === "GET" && url.pathname === "/api/v1/platform/capabilities") return send(req, res, 200, productionAdapters.capabilities());
    if (req.method === "GET" && url.pathname === "/api/v1/governance/release") return send(req, res, 200, governanceRelease);
    if (req.method === "GET" && url.pathname === "/api/v1/isafe/state-machine") return send(req, res, 200, stateMachine);
    if (req.method === "GET" && url.pathname === "/api/v1/isafe/legacy-parity-contract") return send(req, res, 200, legacyParity.contract);
    if (req.method === "GET" && url.pathname === "/api/v1/ai/health") {
      let comfyui = "offline";
      try { const response = await fetch(`${COMFYUI_URL}/system_stats`); if (response.ok) comfyui = "online"; } catch { /* Report offline below. */ }
      return send(req, res, 200, { status: "ok", adapter: "comfyui", comfyui, comfyui_url: COMFYUI_URL, checkpoint: COMFYUI_CHECKPOINT, workflow_version: "stylematch-sdxl-v1", panorama_workflow_version: PANORAMA_WORKFLOW_VERSION, panorama_input: "front_right_back_left", panorama_projection: "equirectangular_2_1" });
    }
    if (req.method === "GET" && url.pathname === "/api/v1/ai/style-vision/health") {
      let models = [];
      try {
        const response = await fetch(`${COMFYUI_URL}/object_info/CLIPVisionLoader`);
        if (response.ok) {
          const objectInfo = await response.json();
          models = objectInfo?.CLIPVisionLoader?.input?.required?.clip_name?.[0] || [];
        }
      } catch { /* Empty model list selects the explicit offline fallback. */ }
      return send(req, res, 200, {
        status: models.length ? "ready" : "fallback_only",
        adapter: models.length ? "comfyui_clip_vision" : "offline_color_geometry_heuristic_v1",
        models,
        confidence_cap: models.length ? null : 35,
        requires_confirmation: true,
        message: models.length ? "CLIP Vision model is available." : "No CLIP Vision model is installed; only low-confidence local candidates are available.",
      });
    }
    req.oidcClaims = await authenticateOidcRequest(req, { issuer: OIDC_ISSUER, audience: OIDC_AUDIENCE });
    if (req.oidcClaims) Object.assign(ctx, requestContext(req));
    assertRequestContext(req, req.method !== "GET");
    const isCaseRequest = url.pathname === "/api/v1/isafe/cases"
      || url.pathname === "/api/cases"
      || url.pathname === "/api/v1/outbox-events"
      || url.pathname.startsWith("/api/v1/isafe/cases/")
      || url.pathname.startsWith("/api/cases/")
      || url.pathname.startsWith("/api/v1/project/")
      || (url.pathname.startsWith("/api/v1/ai/image-tasks") && !url.pathname.endsWith("/image"))
      || ["/api/v1/handovers", "/api/handoffs/isafe", "/api/v1/isafe/case-create", "/api/v1/isafe/direct-intakes"].includes(url.pathname);
    if (isCaseRequest) assertCaseRequestContext(req);
    const scopedCaseRequest = url.pathname.match(/^\/(?:api\/v1\/isafe\/cases|api\/cases)\/([^/]+)/);
    if (scopedCaseRequest) assertCaseAuthorization(decodeURIComponent(scopedCaseRequest[1]), ctx);
    const twcidMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/twcid\/matches$/);
    if (req.method === "POST" && twcidMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "twcid_match_create");
      return send(req, res, 201, productionAdapters.createMatch(decodeURIComponent(twcidMatch[1]), await readBody(req), ctx));
    }
    const twcidConfirm = url.pathname.match(/^\/api\/v1\/stylematch\/twcid\/matches\/([^/]+)\/confirm$/);
    if (req.method === "POST" && twcidConfirm) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "twcid_match_confirm");
      return send(req, res, 200, productionAdapters.confirmMatch(decodeURIComponent(twcidConfirm[1]), await readBody(req), ctx));
    }
    const projectCheckout = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/payment-orders$/);
    if (req.method === "POST" && projectCheckout) {
      assertWriteAccess(req);
      return send(req, res, 201, await productionAdapters.createPayment(decodeURIComponent(projectCheckout[1]), await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/authorization/decisions") {
      assertWriteAccess(req); return send(req, res, 200, productionAdapters.authorize(await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/jobs") {
      assertWriteAccess(req); return send(req, res, 201, productionAdapters.enqueue(await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/jobs:lease") {
      assertWriteAccess(req); return send(req, res, 200, { job: productionAdapters.leaseJob(await readBody(req), ctx) });
    }
    const finishJobMatch = url.pathname.match(/^\/api\/v1\/jobs\/([^/]+):finish$/);
    if (req.method === "POST" && finishJobMatch) {
      assertWriteAccess(req); return send(req, res, 200, productionAdapters.finishJob(decodeURIComponent(finishJobMatch[1]), await readBody(req)));
    }
    const exchangeMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/connectors\/(revit|ifc|autocad|rhino|blender)\/packages$/);
    if (req.method === "POST" && exchangeMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "connector_package_create");
      return send(req, res, 201, productionAdapters.createConnectorPackage(decodeURIComponent(exchangeMatch[1]), exchangeMatch[2], await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/style-test-deliveries") {
      assertWriteAccess(req);
      return send(req, res, 201, await deliverStyleTestResult(await readBody(req), ctx));
    }
    if (req.method === "GET" && url.pathname === "/api/v1/stylematch/style-test-leads") {
      return send(req, res, 200, {
        leads: listStyleTestLeads(ctx, url.searchParams.get("marketing") === "opted_in"),
      });
    }
    const styleTestLeadPrivacyMatch = url.pathname.match(/^\/api\/v1\/stylematch\/style-test-leads\/([^/]+)\/(withdraw-marketing|delete)$/);
    if (req.method === "POST" && styleTestLeadPrivacyMatch) {
      assertWriteAccess(req);
      return send(req, res, 200, updateStyleTestLeadPrivacy(
        decodeURIComponent(styleTestLeadPrivacyMatch[1]),
        styleTestLeadPrivacyMatch[2],
        ctx
      ));
    }
    if (req.method === "GET" && url.pathname === "/api/v1/stylematch/schema") {
      return send(req, res, 200, {
        schema: "StyleMatchAI.LocalSQLite/0.1",
        database: "sqlite",
        tables: [
          "stylematch_projects",
          "stylematch_style_tests",
          "stylematch_knowledge_queries",
          "stylematch_risk_assessments",
          "stylematch_gate_events",
          "stylematch_pgp_packages",
          "structured_space_snapshots",
          "structured_space_corrections",
          "auto_layout_candidates",
          "governance_handoffs_v2",
          "governance_handoff_receipts_v2",
          "isafe_case_creation_proposals",
          "isafe_case_creation_executions",
          "stylematch_approved_assets",
        ],
        ingest: {
          local_store: "POST /api/v1/stylematch/local-store/sync",
          style_test_delivery: "POST /api/v1/stylematch/style-test-deliveries",
          style_test_marketing_leads: "GET /api/v1/stylematch/style-test-leads?marketing=opted_in",
          style_test_marketing_withdrawal: "POST /api/v1/stylematch/style-test-leads/{lead_id}/withdraw-marketing",
          style_test_privacy_delete: "POST /api/v1/stylematch/style-test-leads/{lead_id}/delete",
          knowledge_query: "POST /api/v1/stylematch/knowledge-queries",
          risk_assessment: "POST /api/v1/stylematch/risk-assessments",
          gate_event: "POST /api/v1/stylematch/gate-events",
          structured_space: "GET|POST /api/v1/stylematch/projects/{id}/structured-spaces",
          structured_space_approve: "POST /api/v1/stylematch/structured-spaces/{snapshot_id}/approve",
          structured_space_correct: "POST /api/v1/stylematch/structured-spaces/{snapshot_id}/corrections",
          floorplan_parse: "POST /api/v1/stylematch/projects/{id}/structured-spaces:parse",
          auto_layout: "GET|POST /api/v1/stylematch/projects/{id}/layouts",
          auto_layout_approve: "POST /api/v1/stylematch/layouts/{layout_id}/approve",
          governance_handoff_v2: "GET|POST /api/v1/stylematch/projects/{id}/governance-handoffs/v2",
          governance_handoff_v2_receive: "POST /api/v1/isafe/intake/handoffs/v2/{handoff_id}/receive",
          case_creation_proposal: "GET|POST /api/v1/isafe/intake/handoffs/v2/{handoff_id}/case-creation-proposals",
          case_creation_proposal_decision: "POST /api/v1/isafe/case-creation-proposals/{proposal_id}/decision",
          case_creation_execute: "POST /api/v1/isafe/case-creation-proposals/{proposal_id}/execute",
          approved_assets: "GET|POST /api/v1/stylematch/projects/{id}/approved-assets",
          approved_asset_approve: "POST /api/v1/stylematch/approved-assets/{asset_id}/approve",
        },
      });
    }
    if (req.method === "GET" && url.pathname === "/api/v1/isafe/governance/trigger-rules") {
      return send(req, res, 200, { rules: listTriggerRules(ctx) });
    }
    if (req.method === "POST" && url.pathname === "/api/v1/isafe/governance/trigger-rules") {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_trigger_rule_manage");
      return send(req, res, 201, upsertTriggerRule(await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/local-store/sync") {
      assertWriteAccess(req);
      return send(req, res, 200, syncStyleMatchLocalStore(await readBody(req), ctx));
    }
    if (req.method === "GET" && url.pathname === "/api/v1/stylematch/projects") {
      return send(req, res, 200, { projects: listStyleMatchProjects() });
    }
    const structuredSpacesMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/structured-spaces$/);
    const approvedAssetsMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/approved-assets$/);
    const localArtifactsMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/local-artifacts\/(viewset|material_selection|external_scene)$/);
    if (req.method === "GET" && localArtifactsMatch) {
      const projectId = decodeURIComponent(localArtifactsMatch[1]);
      const artifactKind = localArtifactsMatch[2];
      return send(req, res, 200, { schema_version: LOCAL_ARTIFACT_SCHEMA_VERSIONS[artifactKind], artifacts: listLocalArtifacts(projectId, artifactKind, ctx) });
    }
    if (req.method === "POST" && localArtifactsMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "local_artifact_create");
      return send(req, res, 201, createLocalArtifact(decodeURIComponent(localArtifactsMatch[1]), localArtifactsMatch[2], await readBody(req), ctx));
    }
    const localArtifactApproveMatch = url.pathname.match(/^\/api\/v1\/stylematch\/local-artifacts\/([^/]+)\/approve$/);
    if (req.method === "POST" && localArtifactApproveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "local_artifact_approve");
      return send(req, res, 200, approveLocalArtifact(decodeURIComponent(localArtifactApproveMatch[1]), await readBody(req), ctx));
    }
    if (req.method === "GET" && approvedAssetsMatch) {
      const projectId = decodeURIComponent(approvedAssetsMatch[1]);
      return send(req, res, 200, { schema_version: APPROVED_ASSET_SCHEMA_VERSION, assets: listApprovedAssets(projectId, ctx) });
    }
    if (req.method === "POST" && approvedAssetsMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "approved_asset_create");
      const projectId = decodeURIComponent(approvedAssetsMatch[1]);
      return send(req, res, 201, createApprovedAsset(projectId, await readBody(req), ctx));
    }
    const approvedAssetApproveMatch = url.pathname.match(/^\/api\/v1\/stylematch\/approved-assets\/([^/]+)\/approve$/);
    if (req.method === "POST" && approvedAssetApproveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "approved_asset_approve");
      return send(req, res, 200, approveAsset(decodeURIComponent(approvedAssetApproveMatch[1]), await readBody(req), ctx));
    }
    const floorplanParseMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/structured-spaces:parse$/);
    if (req.method === "POST" && floorplanParseMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "floorplan_parse");
      const projectId = decodeURIComponent(floorplanParseMatch[1]);
      return send(req, res, 201, await parseFloorplan(projectId, await readBody(req), ctx));
    }
    if (req.method === "GET" && structuredSpacesMatch) {
      const projectId = decodeURIComponent(structuredSpacesMatch[1]);
      return send(req, res, 200, { schema_version: SPATIAL_SCHEMA_VERSION, snapshots: listStructuredSpaces(projectId, ctx) });
    }
    if (req.method === "POST" && structuredSpacesMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "structured_space_create");
      const projectId = decodeURIComponent(structuredSpacesMatch[1]);
      return send(req, res, 201, createStructuredSpace(projectId, await readBody(req), ctx));
    }
    const structuredSpaceApproveMatch = url.pathname.match(/^\/api\/v1\/stylematch\/structured-spaces\/([^/]+)\/approve$/);
    if (req.method === "POST" && structuredSpaceApproveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "structured_space_approve");
      return send(req, res, 200, approveStructuredSpace(decodeURIComponent(structuredSpaceApproveMatch[1]), await readBody(req), ctx));
    }
    const structuredSpaceCorrectionMatch = url.pathname.match(/^\/api\/v1\/stylematch\/structured-spaces\/([^/]+)\/corrections$/);
    if (req.method === "POST" && structuredSpaceCorrectionMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "structured_space_correct");
      return send(req, res, 201, correctStructuredSpace(decodeURIComponent(structuredSpaceCorrectionMatch[1]), await readBody(req), ctx));
    }
    const autoLayoutMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/layouts$/);
    const autoLayoutGenerateMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/layouts:generate$/);
    if (req.method === "POST" && autoLayoutGenerateMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "auto_layout_generate");
      const projectId = decodeURIComponent(autoLayoutGenerateMatch[1]); assertStyleMatchCaseAuthorization(projectId, ctx);
      const payload = await readBody(req);
      const space = db.prepare("SELECT * FROM structured_space_snapshots WHERE snapshot_id=? AND tenant_id=? AND organization_id=? AND stylematch_project_id=?")
        .get(payload.structured_space_ref, ctx.tenant_id, ctx.organization_id, projectId);
      if (!space) fail("StructuredSpace snapshot not found for this project.", "STRUCTURED_SPACE_NOT_FOUND", 404);
      const structuredSpace = normalizeStructuredSpace(parseJson(space.payload));
      return send(req, res, 200, { schema_version: LAYOUT_SCHEMA_VERSION, rule_version: LAYOUT_RULE_VERSION, candidates: generateAutoLayoutCandidates(structuredSpace, payload.placements || [], validateLayoutGeometry, payload.context || {}), persisted: false });
    }
    if (req.method === "GET" && autoLayoutMatch) {
      const projectId = decodeURIComponent(autoLayoutMatch[1]);
      return send(req, res, 200, { schema_version: LAYOUT_SCHEMA_VERSION, rule_version: LAYOUT_RULE_VERSION, layouts: listAutoLayouts(projectId, ctx) });
    }
    if (req.method === "POST" && autoLayoutMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "auto_layout_validate");
      const projectId = decodeURIComponent(autoLayoutMatch[1]);
      return send(req, res, 201, createAutoLayout(projectId, await readBody(req), ctx));
    }
    const autoLayoutApproveMatch = url.pathname.match(/^\/api\/v1\/stylematch\/layouts\/([^/]+)\/approve$/);
    if (req.method === "POST" && autoLayoutApproveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "auto_layout_approve");
      return send(req, res, 200, approveAutoLayout(decodeURIComponent(autoLayoutApproveMatch[1]), await readBody(req), ctx));
    }
    const sketchupSessionMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/connectors\/sketchup\/session$/);
    if (req.method === "POST" && sketchupSessionMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "external_tool_session");
      return send(req, res, 201, createExternalToolSession(decodeURIComponent(sketchupSessionMatch[1]), { ...(await readBody(req)), tool_type: "sketchup" }, ctx));
    }
    const connectorStatusMatch = url.pathname.match(/^\/api\/v1\/stylematch\/connectors\/([^/]+)\/status$/);
    if (req.method === "GET" && connectorStatusMatch) return send(req, res, 200, getExternalToolSession(decodeURIComponent(connectorStatusMatch[1]), ctx));
    const connectorSceneMatch = url.pathname.match(/^\/api\/v1\/stylematch\/connectors\/([^/]+)\/scenes$/);
    if (req.method === "POST" && connectorSceneMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "external_scene_capture");
      return send(req, res, 201, captureExternalToolScene(decodeURIComponent(connectorSceneMatch[1]), await readBody(req), ctx));
    }
    const connectorLatestSceneMatch = url.pathname.match(/^\/api\/v1\/stylematch\/connectors\/([^/]+)\/scenes\/latest$/);
    if (req.method === "GET" && connectorLatestSceneMatch) return send(req, res, 200, getLatestExternalToolScene(decodeURIComponent(connectorLatestSceneMatch[1]), ctx));
    const connectorRenderMatch = url.pathname.match(/^\/api\/v1\/stylematch\/connectors\/([^/]+)\/render$/);
    if (req.method === "POST" && connectorRenderMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "external_render_round_trip");
      return send(req, res, 202, createExternalRenderRoundTrip(decodeURIComponent(connectorRenderMatch[1]), await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/viewsets/validate") {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "viewset_validate");
      return send(req, res, 200, validateViewSet(await readBody(req)));
    }
    if (req.method === "GET" && url.pathname === "/api/v1/stylematch/viewsets/schema") return send(req, res, 200, { schema_version: VIEWSET_SCHEMA_VERSION, selective_retry: true });
    if (req.method === "GET" && ["/api/v1/materials/search", "/api/v1/products/search"].includes(url.pathname)) {
      const type = url.pathname.includes("products") ? "product" : "material";
      return send(req, res, 200, { schema_version: MATERIAL_CATALOG_VERSION, items: searchCatalog({ query: url.searchParams.get("q") || "", category: url.searchParams.get("category") || undefined, style_tag: url.searchParams.get("style_tag") || undefined }).filter((item) => item.type === type) });
    }
    const budgetMapMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/budget-map$/);
    if (req.method === "POST" && budgetMapMatch) { assertWriteAccess(req); const projectId = decodeURIComponent(budgetMapMatch[1]); assertStyleMatchCaseAuthorization(projectId, ctx); const payload = await readBody(req); return send(req, res, 200, { stylematch_project_id: projectId, ...mapBudget(payload.selections, payload.budget) }); }
    const proposalSnapshotMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/proposal-snapshots$/);
    if (req.method === "GET" && proposalSnapshotMatch) {
      const projectId = decodeURIComponent(proposalSnapshotMatch[1]);
      return send(req, res, 200, { schema_version: PROPOSAL_SNAPSHOT_SCHEMA_VERSION, proposals: listProposalSnapshots(projectId, ctx) });
    }
    if (req.method === "POST" && proposalSnapshotMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "proposal_snapshot_create");
      return send(req, res, 201, createProposalSnapshot(decodeURIComponent(proposalSnapshotMatch[1]), await readBody(req), ctx));
    }
    const proposalSnapshotApproveMatch = url.pathname.match(/^\/api\/v1\/stylematch\/proposal-snapshots\/([^/]+)\/approve$/);
    if (req.method === "POST" && proposalSnapshotApproveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "proposal_snapshot_approve");
      return send(req, res, 200, approveProposalSnapshot(decodeURIComponent(proposalSnapshotApproveMatch[1]), await readBody(req), ctx));
    }
    const handoffV2Match = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/governance-handoffs\/v2$/);
    if (req.method === "GET" && handoffV2Match) {
      const projectId = decodeURIComponent(handoffV2Match[1]);
      return send(req, res, 200, { schema_version: HANDOFF_V2_SCHEMA_VERSION, handoffs: listHandoffsV2(projectId, ctx) });
    }
    if (req.method === "POST" && handoffV2Match) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "governance_handoff_v2_build");
      const projectId = decodeURIComponent(handoffV2Match[1]);
      return send(req, res, 201, buildHandoffV2(projectId, await readBody(req), ctx));
    }
    const handoffV2ReceiveMatch = url.pathname.match(/^\/api\/v1\/isafe\/intake\/handoffs\/v2\/([^/]+)\/receive$/);
    if (req.method === "POST" && handoffV2ReceiveMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "governance_handoff_v2_receive");
      return send(req, res, 200, receiveHandoffV2(decodeURIComponent(handoffV2ReceiveMatch[1]), await readBody(req), ctx));
    }
    const caseProposalMatch = url.pathname.match(/^\/api\/v1\/isafe\/intake\/handoffs\/v2\/([^/]+)\/case-creation-proposals$/);
    if (req.method === "GET" && caseProposalMatch) {
      return send(req, res, 200, { schema_version: CASE_PROPOSAL_SCHEMA_VERSION, proposals: listCaseCreationProposals(decodeURIComponent(caseProposalMatch[1]), ctx) });
    }
    if (req.method === "POST" && caseProposalMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "case_creation_proposal_create");
      return send(req, res, 201, createCaseCreationProposal(decodeURIComponent(caseProposalMatch[1]), await readBody(req), ctx));
    }
    const caseProposalDecisionMatch = url.pathname.match(/^\/api\/v1\/isafe\/case-creation-proposals\/([^/]+)\/decision$/);
    if (req.method === "POST" && caseProposalDecisionMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "case_creation_proposal_decide");
      return send(req, res, 200, decideCaseCreationProposal(decodeURIComponent(caseProposalDecisionMatch[1]), await readBody(req), ctx));
    }
    const caseProposalExecuteMatch = url.pathname.match(/^\/api\/v1\/isafe\/case-creation-proposals\/([^/]+)\/execute$/);
    if (req.method === "POST" && caseProposalExecuteMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "case_creation_execute");
      return send(req, res, 201, executeCaseCreationProposal(decodeURIComponent(caseProposalExecuteMatch[1]), await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/knowledge-queries") {
      assertWriteAccess(req);
      return send(req, res, 201, recordKnowledgeQuery(await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/risk-assessments") {
      assertWriteAccess(req);
      return send(req, res, 201, createRiskAssessment(await readBody(req), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/stylematch/gate-events") {
      assertWriteAccess(req);
      return send(req, res, 201, createGateEvent(await readBody(req), ctx));
    }
    const styleMatchPgpMatch = url.pathname.match(/^\/api\/v1\/stylematch\/projects\/([^/]+)\/pgp$/);
    if (req.method === "POST" && styleMatchPgpMatch) {
      assertWriteAccess(req);
      return send(req, res, 201, buildStyleMatchPgpPackage(decodeURIComponent(styleMatchPgpMatch[1]), ctx));
    }
    if (req.method === "POST" && url.pathname === "/api/v1/ai/image-tasks") { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member"], "ai_image_task"); const payload = await readBody(req); assertStyleMatchCaseAuthorization(payload.case_code, ctx); const result = await createImageTask(payload, ctx); return send(req, res, result.created ? 202 : 200, result); }
    const checkoutMatch = url.pathname.match(/^\/api\/v1\/ai\/image-tasks\/([^/]+)\/checkout-session$/);
    if (req.method === "POST" && checkoutMatch) { assertWriteAccess(req); const id = decodeURIComponent(checkoutMatch[1]); assertAiTaskAuthorization(id, ctx); return send(req, res, 200, await createDownloadCheckout(id)); }
    const entitlementMatch = url.pathname.match(/^\/api\/v1\/ai\/image-tasks\/([^/]+)\/download-entitlement$/);
    if (req.method === "GET" && entitlementMatch) {
      const id = decodeURIComponent(entitlementMatch[1]);
      assertAiTaskAuthorization(id, ctx);
      const sessionId = url.searchParams.get("session_id");
      if (sessionId) {
        const session = await retrieveStripeSession(sessionId);
        const sessionTaskId = session?.metadata?.ai_task_id || session?.client_reference_id;
        if (sessionTaskId !== id) fail("Checkout session does not belong to this AI task.", "PAYMENT_SESSION_TASK_MISMATCH", 403);
        fulfillCheckoutSession(session);
      }
      return send(req, res, 200, { entitlement: getDownloadEntitlement(id) });
    }
    const imageTaskMatch = url.pathname.match(/^\/api\/v1\/ai\/image-tasks\/([^/]+)$/);
    if (req.method === "GET" && imageTaskMatch) { const id = decodeURIComponent(imageTaskMatch[1]); assertAiTaskAuthorization(id, ctx); return send(req, res, 200, { task: serializeImageTask(await refreshImageTask(id)) }); }
    const downloadFileMatch = url.pathname.match(/^\/api\/v1\/ai\/image-tasks\/([^/]+)\/download$/);
    if (req.method === "GET" && downloadFileMatch) {
      const aiTaskId = decodeURIComponent(downloadFileMatch[1]);
      assertAiTaskAuthorization(aiTaskId, ctx);
      const entitlement = getDownloadEntitlement(aiTaskId);
      if (!entitlement.download_unlocked) fail("Payment is required before downloading this file.", "DOWNLOAD_PAYMENT_REQUIRED", 402);
      const task = await refreshImageTask(aiTaskId);
      if (task.status !== "completed") fail("Image is not ready.", "AI_IMAGE_NOT_READY", 409);
      const query = new URLSearchParams({ filename: task.output_filename, subfolder: task.output_subfolder || "", type: task.output_type || "output" });
      const imageResponse = await fetch(`${COMFYUI_URL}/view?${query}`);
      if (!imageResponse.ok) fail("Generated image could not be read from ComfyUI.", "COMFYUI_IMAGE_READ_FAILED", 502);
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      res.writeHead(200, {
        "Content-Type": imageResponse.headers.get("content-type") || "image/png",
        "Content-Length": bytes.length,
        "Content-Disposition": `attachment; filename="${aiTaskId}.png"`,
        "Cache-Control": "private, no-store",
        "Access-Control-Allow-Origin": corsHeaders(req)["Access-Control-Allow-Origin"],
        "X-AI-Task-Id": task.ai_task_id,
        "X-Trace-Id": task.trace_id,
      });
      return res.end(bytes);
    }
    const imageFileMatch = url.pathname.match(/^\/api\/v1\/ai\/image-tasks\/([^/]+)\/image$/);
    if (req.method === "GET" && imageFileMatch) {
      const task = await refreshImageTask(decodeURIComponent(imageFileMatch[1]));
      if (task.status !== "completed") fail("Image is not ready.", "AI_IMAGE_NOT_READY", 409);
      const query = new URLSearchParams({ filename: task.output_filename, subfolder: task.output_subfolder || "", type: task.output_type || "output" });
      const imageResponse = await fetch(`${COMFYUI_URL}/view?${query}`);
      if (!imageResponse.ok) fail("Generated image could not be read from ComfyUI.", "COMFYUI_IMAGE_READ_FAILED", 502);
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      res.writeHead(200, { "Content-Type": imageResponse.headers.get("content-type") || "image/png", "Content-Length": bytes.length, "Cache-Control": "no-store", "Access-Control-Allow-Origin": corsHeaders(req)["Access-Control-Allow-Origin"], "X-AI-Task-Id": task.ai_task_id, "X-Trace-Id": task.trace_id });
      return res.end(bytes);
    }
    if (req.method === "GET" && ["/api/v1/isafe/cases", "/api/cases"].includes(url.pathname)) {
      const refs = authorizedCaseRefs(ctx);
      const cases = db.prepare("SELECT * FROM cases WHERE tenant_id=? AND organization_id=? ORDER BY id DESC")
        .all(ctx.tenant_id, ctx.organization_id)
        .filter((row) => (refs.has("*") && ctx.server_role === "headquarter") || refs.has(row.isafe_case_id) || refs.has(row.source_case_code))
        .map(serializeCase);
      return send(req, res, 200, { schema_version: SCHEMA_VERSION, authorization: { server_role: ctx.server_role, case_role: ctx.case_role }, cases });
    }
    const parityResponse = await legacyParity.handle(req, url, ctx, assertWriteAccess);
    if (parityResponse) return send(req, res, parityResponse.status, parityResponse.body);
    if (req.method === "POST" && ["/api/v1/handovers", "/api/handoffs/isafe", "/api/v1/isafe/case-create"].includes(url.pathname)) { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "case_create"); const payload = await readBody(req); const requestedCase = payload.project?.case_code || payload.data?.case_code || payload.case_code; const refs = authorizedCaseRefs(ctx); if (!requestedCase || (!refs.has(requestedCase) && !(refs.has("*") && ctx.server_role === "headquarter"))) fail("Case authorization does not include the handover case.", "CASE_ACCESS_FORBIDDEN", 403); const result = createHandover(payload, ctx); return send(req, res, result.created ? 201 : 200, result); }
    if (req.method === "POST" && url.pathname === "/api/v1/isafe/direct-intakes") { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "general_member"], "direct_intake"); const result = createDirectIntake(await readBody(req), ctx); return send(req, res, result.created ? 201 : 200, result); }
    if (req.method === "GET" && url.pathname === "/api/v1/outbox-events") return send(req, res, 200, { events: db.prepare("SELECT * FROM outbox_events WHERE tenant_id=? AND organization_id=? ORDER BY id DESC LIMIT 100").all(ctx.tenant_id, ctx.organization_id).map((event) => ({ ...event, data: parseJson(event.data) })) });
    const r9SnapshotMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/r9$/);
    if (req.method === "GET" && r9SnapshotMatch) {
      const id = decodeURIComponent(r9SnapshotMatch[1]);
      return send(req, res, 200, listR9GovernanceObjects(id, ctx));
    }
    const r9RiskMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/risk-states$/);
    if (req.method === "POST" && r9RiskMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_risk_state_record");
      return send(req, res, 201, createGovernanceRiskState(decodeURIComponent(r9RiskMatch[1]), await readBody(req), ctx));
    }
    const r9TriggerMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/trigger-evaluations$/);
    if (req.method === "POST" && r9TriggerMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_trigger_evaluate");
      return send(req, res, 201, createTriggerEvaluation(decodeURIComponent(r9TriggerMatch[1]), await readBody(req), ctx));
    }
    const r9ExternalMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/external-evaluations$/);
    if (req.method === "POST" && r9ExternalMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_external_evaluation_record");
      return send(req, res, 201, createExternalGovernanceEvaluation(decodeURIComponent(r9ExternalMatch[1]), await readBody(req), ctx));
    }
    const r9AuditMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/audit-outputs$/);
    if (req.method === "POST" && r9AuditMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_audit_output_create");
      return send(req, res, 201, createGovernanceAuditOutput(decodeURIComponent(r9AuditMatch[1]), await readBody(req), ctx));
    }
    const r9DecisionMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/decisions$/);
    if (req.method === "POST" && r9DecisionMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_governance_decision_record");
      return send(req, res, 201, createGovernanceDecision(decodeURIComponent(r9DecisionMatch[1]), await readBody(req), ctx));
    }
    const r9NotificationActionMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/notifications\/([^/]+)\/(acknowledge|escalate)$/);
    if (req.method === "POST" && r9NotificationActionMatch) {
      assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "r9_notification_manage");
      return send(req, res, 200, updateGovernanceNotification(decodeURIComponent(r9NotificationActionMatch[1]), decodeURIComponent(r9NotificationActionMatch[2]), r9NotificationActionMatch[3], ctx));
    }
    const caseMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)$/);
    if (req.method === "GET" && caseMatch) { const id = decodeURIComponent(caseMatch[1]); assertCaseScope(id, ctx); assertCaseAuthorization(id, ctx); return send(req, res, 200, { case: getCase(id) }); }
    const pgpMatch = url.pathname.match(/^\/(?:api\/v1\/isafe\/cases|api\/cases)\/([^/]+)\/pgp$/);
    if (req.method === "GET" && pgpMatch) { const id = decodeURIComponent(pgpMatch[1]); assertCaseScope(id, ctx); assertCaseAuthorization(id, ctx); return send(req, res, 200, buildPassport(getCase(id))); }
    const evidenceMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/evidence$/);
    if (req.method === "POST" && evidenceMatch) { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer", "certified_member", "general_member"], "evidence_register"); const id = decodeURIComponent(evidenceMatch[1]); assertCaseScope(id, ctx); assertCaseAuthorization(id, ctx); return send(req, res, 201, { case: registerEvidence(id, await readBody(req), ctx) }); }
    const governanceStartMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/governance\/start$/);
    if (req.method === "POST" && governanceStartMatch) { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "governance_start"); const id = decodeURIComponent(governanceStartMatch[1]); assertCaseScope(id, ctx); return send(req, res, 200, { case: startGovernance(id, await readBody(req), ctx) }); }
    const gateMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/gates\/evaluate$/);
    if (req.method === "POST" && gateMatch) { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter", "dealer"], "gate_evaluate"); const id = decodeURIComponent(gateMatch[1]); assertCaseScope(id, ctx); return send(req, res, 200, { case: evaluateGate(id, await readBody(req), ctx) }); }
    const paymentEligibilityMatch = url.pathname.match(/^\/api\/v1\/isafe\/cases\/([^/]+)\/payment-eligibility\/evaluate$/);
    if (req.method === "POST" && paymentEligibilityMatch) { assertWriteAccess(req); assertMemberTier(ctx, ["headquarter"], "payment_eligibility_evaluate"); const id = decodeURIComponent(paymentEligibilityMatch[1]); assertCaseScope(id, ctx); return send(req, res, 200, { case: evaluatePaymentEligibility(id, await readBody(req), ctx) }); }
    return send(req, res, 404, { code: "ROUTE_NOT_FOUND", message: "Route not found.", trace_id: ctx.trace_id, retryable: false, details: { path: url.pathname } });
  } catch (error) {
    return send(req, res, error.status || 500, { code: error.code || "INTERNAL_ERROR", message: error.message || "Unexpected error.", trace_id: ctx.trace_id, retryable: (error.status || 500) >= 500, details: error.details || {} });
  }
});

cleanupExpiredStyleTestLeads();
server.listen(PORT, HOST, () => console.log(`iSAFE R9 / Patent V7 aligned, R5.2-authoritative local API listening on http://${HOST}:${PORT}/api/v1/health`));
