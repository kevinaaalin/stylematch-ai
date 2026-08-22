const FIELD_EVIDENCE_SCHEMA_VERSION = "iSAFE.FieldEvidence/1.0";
const REVIEW_DECISIONS = new Set(["accepted", "rejected", "correction_required"]);
const FORBIDDEN_EFFECTS = ["governance_state", "gate_decision", "gate_status", "payment_execution", "payment_approval", "state_transition"];

export function createFieldEvidenceService({ db, now, uid, sha256, fail, persistMedia }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS external_evidence_providers (
      provider_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL,
      name TEXT NOT NULL, provider_type TEXT NOT NULL, status TEXT NOT NULL,
      created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS evidence_requirements_r921 (
      requirement_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL,
      project_id TEXT NOT NULL, step_id TEXT NOT NULL, evidence_type TEXT NOT NULL,
      required_flag INTEGER NOT NULL, status TEXT NOT NULL, requirement_version TEXT NOT NULL,
      description TEXT, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS external_evidence_packages (
      package_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL,
      project_id TEXT NOT NULL, isafe_case_id TEXT, provider_id TEXT NOT NULL,
      requirement_id TEXT NOT NULL, step_id TEXT NOT NULL, evidence_type TEXT NOT NULL,
      media_id TEXT NOT NULL, object_ref TEXT NOT NULL, content_sha256 TEXT NOT NULL,
      package_sha256 TEXT NOT NULL, idempotency_key TEXT NOT NULL,
      status TEXT NOT NULL, review_decision TEXT, review_reason TEXT, reviewed_by TEXT, reviewed_at TEXT,
      payload TEXT NOT NULL, trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL,
      UNIQUE(tenant_id, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS external_evidence_receipts (
      receipt_id TEXT PRIMARY KEY, package_id TEXT NOT NULL UNIQUE, tenant_id TEXT NOT NULL,
      validation_status TEXT NOT NULL, package_sha256 TEXT NOT NULL, authority_boundary TEXT NOT NULL,
      trace_id TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS field_media_assets (
      media_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL, project_id TEXT NOT NULL,
      original_filename TEXT NOT NULL, mime_type TEXT NOT NULL, bytes INTEGER NOT NULL, object_ref TEXT NOT NULL, content_sha256 TEXT NOT NULL,
      project_label TEXT NOT NULL, space_label TEXT NOT NULL, trade_label TEXT NOT NULL, stage_label TEXT NOT NULL, event_type TEXT NOT NULL,
      caption TEXT, confidence REAL NOT NULL, classification_status TEXT NOT NULL, requires_human_review INTEGER NOT NULL,
      source TEXT NOT NULL, captured_at TEXT, uploaded_at TEXT NOT NULL, trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS field_media_revisions (
      revision_id TEXT PRIMARY KEY, media_id TEXT NOT NULL, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL,
      revision INTEGER NOT NULL, project_label TEXT NOT NULL, space_label TEXT NOT NULL, trade_label TEXT NOT NULL,
      stage_label TEXT NOT NULL, event_type TEXT NOT NULL, caption TEXT, confidence REAL NOT NULL,
      classification_status TEXT NOT NULL, correction_reason TEXT, corrected_by TEXT,
      trace_id TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(media_id, revision)
    );    CREATE TABLE IF NOT EXISTS ncr_candidates_r921 (
      ncr_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL, project_id TEXT NOT NULL,
      media_id TEXT NOT NULL, media_revision INTEGER NOT NULL, defect_type TEXT NOT NULL, severity TEXT NOT NULL,
      description TEXT NOT NULL, responsible_party TEXT, due_date TEXT, status TEXT NOT NULL, confidence REAL NOT NULL,
      detection_source TEXT NOT NULL, checksum TEXT NOT NULL, reviewed_by TEXT, reviewed_at TEXT, review_reason TEXT,
      trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS capa_records_r921 (
      capa_id TEXT PRIMARY KEY, ncr_id TEXT NOT NULL, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL, project_id TEXT NOT NULL,
      corrective_action TEXT NOT NULL, preventive_action TEXT, responsible_party TEXT NOT NULL, due_date TEXT NOT NULL,
      verification_media_refs TEXT NOT NULL, status TEXT NOT NULL, checksum TEXT NOT NULL,
      trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );    CREATE TABLE IF NOT EXISTS capa_transition_history_r921 (
      transition_id TEXT PRIMARY KEY, capa_id TEXT NOT NULL, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL,
      from_status TEXT, to_status TEXT NOT NULL, reason TEXT NOT NULL, evidence_refs TEXT NOT NULL,
      actor_id TEXT NOT NULL, trace_id TEXT NOT NULL, created_at TEXT NOT NULL
    );    CREATE TABLE IF NOT EXISTS field_media_provenance_r921 (
      media_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL, site_id TEXT NOT NULL,
      source_system TEXT NOT NULL, source_event_id TEXT, uploader_id TEXT NOT NULL, model_name TEXT, model_version TEXT,
      tool_trace TEXT NOT NULL, provenance_checksum TEXT NOT NULL, created_at TEXT NOT NULL
    );    CREATE TABLE IF NOT EXISTS construction_logs_r921 (
      log_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, organization_id TEXT NOT NULL, project_id TEXT NOT NULL,
      log_date TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, media_refs TEXT NOT NULL, package_refs TEXT NOT NULL,
      status TEXT NOT NULL, checksum TEXT NOT NULL, trace_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL
    );  `);

  const serializeProvider = (row) => row ? { ...row, schema_version: FIELD_EVIDENCE_SCHEMA_VERSION } : null;
  const serializeRequirement = (row) => row ? { ...row, required_flag: Boolean(row.required_flag), schema_version: FIELD_EVIDENCE_SCHEMA_VERSION } : null;
  const serializePackage = (row) => row ? {
    ...row,
    payload: JSON.parse(row.payload || "{}"),
    authority_boundary: { evidence_input_only: true, state_transition_applied: false, gate_decision_applied: false, payment_execution_applied: false },
    schema_version: FIELD_EVIDENCE_SCHEMA_VERSION,
  } : null;

  function listProviders(ctx) {
    return db.prepare("SELECT * FROM external_evidence_providers WHERE tenant_id=? AND organization_id=? ORDER BY created_at DESC")
      .all(ctx.tenant_id, ctx.organization_id).map(serializeProvider);
  }

  function registerProvider(payload, ctx) {
    if (!payload.name?.trim()) fail("name is required.", "PROVIDER_NAME_REQUIRED");
    const providerId = String(payload.provider_id || uid("provider"));
    const at = now();
    db.prepare(`INSERT INTO external_evidence_providers
      (provider_id,tenant_id,organization_id,name,provider_type,status,created_by,created_at,updated_at)
      VALUES (?,?,?,?,?,'active',?,?,?)
      ON CONFLICT(provider_id) DO UPDATE SET name=excluded.name,provider_type=excluded.provider_type,status='active',updated_at=excluded.updated_at`)
      .run(providerId, ctx.tenant_id, ctx.organization_id, payload.name.trim(), payload.provider_type || "external_evidence_provider", ctx.user_id, at, at);
    return serializeProvider(db.prepare("SELECT * FROM external_evidence_providers WHERE provider_id=? AND tenant_id=?").get(providerId, ctx.tenant_id));
  }

  function listRequirements(projectId, stepId, ctx) {
    const params = [ctx.tenant_id, ctx.organization_id, projectId];
    let sql = "SELECT * FROM evidence_requirements_r921 WHERE tenant_id=? AND organization_id=? AND project_id=?";
    if (stepId) { sql += " AND step_id=?"; params.push(stepId); }
    return db.prepare(`${sql} ORDER BY step_id,evidence_type`).all(...params).map(serializeRequirement);
  }

  function upsertRequirement(projectId, payload, ctx) {
    if (!payload.step_id?.trim() || !payload.evidence_type?.trim()) fail("step_id and evidence_type are required.", "REQUIREMENT_FIELDS_REQUIRED");
    const requirementId = String(payload.requirement_id || uid("requirement"));
    const at = now();
    db.prepare(`INSERT INTO evidence_requirements_r921
      (requirement_id,tenant_id,organization_id,project_id,step_id,evidence_type,required_flag,status,requirement_version,description,created_by,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,'missing',?,?,?,?,?)
      ON CONFLICT(requirement_id) DO UPDATE SET step_id=excluded.step_id,evidence_type=excluded.evidence_type,required_flag=excluded.required_flag,requirement_version=excluded.requirement_version,description=excluded.description,updated_at=excluded.updated_at`)
      .run(requirementId, ctx.tenant_id, ctx.organization_id, projectId, payload.step_id.trim(), payload.evidence_type.trim(), payload.required_flag === false ? 0 : 1, payload.requirement_version || "R9.2.1-1", payload.description || "", ctx.user_id, at, at);
    return serializeRequirement(db.prepare("SELECT * FROM evidence_requirements_r921 WHERE requirement_id=? AND tenant_id=?").get(requirementId, ctx.tenant_id));
  }

  function assertNoGovernanceMutation(payload) {
    for (const key of FORBIDDEN_EFFECTS) {
      if (payload[key] !== undefined || payload.governance_effects?.[key] !== undefined) {
        fail("External Evidence intake cannot request governance, Gate or payment effects.", "EXTERNAL_EVIDENCE_AUTHORITY_VIOLATION", 403, { forbidden_field: key });
      }
    }
  }

  function submitPackage(projectId, payload, ctx, mode = "external") {
    assertNoGovernanceMutation(payload);
    for (const field of ["requirement_id", "step_id", "evidence_type", "media_id", "object_ref"]) {
      if (!String(payload[field] || "").trim()) fail(`${field} is required.`, "EVIDENCE_PACKAGE_FIELD_REQUIRED", 400, { field });
    }
    const providerId = mode === "manual" ? "manual_upload" : String(payload.provider_id || "");
    if (!providerId) fail("provider_id is required.", "PROVIDER_ID_REQUIRED");
    if (mode === "manual" && !db.prepare("SELECT provider_id FROM external_evidence_providers WHERE provider_id=? AND tenant_id=?").get(providerId, ctx.tenant_id)) {
      registerProvider({ provider_id: providerId, name: "iSAFE Manual Evidence Capture", provider_type: "manual_upload" }, ctx);
    }
    const provider = db.prepare("SELECT * FROM external_evidence_providers WHERE provider_id=? AND tenant_id=? AND organization_id=? AND status='active'")
      .get(providerId, ctx.tenant_id, ctx.organization_id);
    if (!provider) fail("Active External Evidence Provider not found.", "PROVIDER_NOT_FOUND", 404);
    const requirement = db.prepare("SELECT * FROM evidence_requirements_r921 WHERE requirement_id=? AND tenant_id=? AND organization_id=? AND project_id=?")
      .get(payload.requirement_id, ctx.tenant_id, ctx.organization_id, projectId);
    if (!requirement) fail("Evidence Requirement not found for this project.", "EVIDENCE_REQUIREMENT_NOT_FOUND", 404);
    if (requirement.step_id !== payload.step_id || requirement.evidence_type !== payload.evidence_type) fail("Evidence Package does not match the requirement contract.", "EVIDENCE_REQUIREMENT_MISMATCH", 409);
    const contentSha256 = String(payload.content_sha256 || sha256(payload.content || payload.object_ref)).toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(contentSha256)) fail("content_sha256 must be SHA-256 hex.", "EVIDENCE_CHECKSUM_INVALID");
    const existingReplay = db.prepare("SELECT * FROM external_evidence_packages WHERE tenant_id=? AND idempotency_key=?").get(ctx.tenant_id, ctx.idempotency_key);
    const replayPayload = existingReplay ? JSON.parse(existingReplay.payload || "{}") : null;
    const previousPackage = db.prepare("SELECT package_id,payload FROM external_evidence_packages WHERE tenant_id=? AND organization_id=? AND project_id=? AND requirement_id=? AND media_id=? ORDER BY created_at DESC LIMIT 1").get(ctx.tenant_id,ctx.organization_id,projectId,payload.requirement_id,payload.media_id);
    const canonical = { schema_version: FIELD_EVIDENCE_SCHEMA_VERSION, project_id: projectId, site_id: payload.site_id || "site-local-default", isafe_case_id: payload.isafe_case_id || null, provider_id: providerId, source_system: payload.source_system || provider.provider_type, source_event_id: payload.source_event_id || null, event_id: payload.event_id || payload.source_event_id || replayPayload?.event_id || `field_event_${sha256({ tenant_id: ctx.tenant_id, idempotency_key: ctx.idempotency_key, media_id: payload.media_id }).slice(0,24)}`, uploader_id: payload.uploader_id || ctx.user_id, requirement_id: payload.requirement_id, requirement_version: requirement.requirement_version, step_id: payload.step_id, evidence_type: payload.evidence_type, media_id: payload.media_id, media_revision: Number(payload.media_revision || 1), original_filename: payload.original_filename || payload.media_id, object_ref: payload.object_ref, content_sha256: contentSha256, classification: payload.classification || {}, ai_classification: payload.ai_classification || payload.classification || {}, caption: payload.caption || "", confidence: payload.confidence ?? null, mapping_reason: payload.mapping_reason || "Matched by project, step and evidence type; requires human review.", package_revision: replayPayload?.package_revision || (previousPackage ? Number(JSON.parse(previousPackage.payload || "{}").package_revision || 1) + 1 : 1), supersedes_package_id: existingReplay ? (replayPayload?.supersedes_package_id || null) : (previousPackage?.package_id || null), model_provenance: payload.model_provenance || {}, tool_trace: payload.tool_trace || { trace_id: ctx.trace_id }, captured_at: payload.captured_at || null, uploaded_at: payload.uploaded_at || payload.captured_at || replayPayload?.uploaded_at || now(), human_review: payload.human_review || { status: "pending" }, review_status: "pending_review" };
    const packageSha256 = sha256(canonical);
    const replay = existingReplay;
    if (replay) {
      if (replay.package_sha256 !== packageSha256) fail("Idempotency key was reused with different Evidence content.", "IDEMPOTENCY_CONFLICT", 409);
      return { created: false, idempotent_replay: true, package: serializePackage(replay), receipt: db.prepare("SELECT * FROM external_evidence_receipts WHERE package_id=?").get(replay.package_id) };
    }
    const packageId = uid("evidence_package"); const receiptId = uid("evidence_receipt"); const at = now();
    const authority = JSON.stringify({ evidence_input_only: true, state_transition_applied: false, gate_decision_applied: false, payment_execution_applied: false });
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare(`INSERT INTO external_evidence_packages
        (package_id,tenant_id,organization_id,project_id,isafe_case_id,provider_id,requirement_id,step_id,evidence_type,media_id,object_ref,content_sha256,package_sha256,idempotency_key,status,payload,trace_id,created_by,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending_review',?,?,?,?)`)
        .run(packageId, ctx.tenant_id, ctx.organization_id, projectId, payload.isafe_case_id || null, providerId, payload.requirement_id, payload.step_id, payload.evidence_type, payload.media_id, payload.object_ref, contentSha256, packageSha256, ctx.idempotency_key, JSON.stringify(canonical), ctx.trace_id, ctx.user_id, at);
      db.prepare("INSERT INTO external_evidence_receipts (receipt_id,package_id,tenant_id,validation_status,package_sha256,authority_boundary,trace_id,created_at) VALUES (?,?,?,'validated_transport',?,?,?,?)")
        .run(receiptId, packageId, ctx.tenant_id, packageSha256, authority, ctx.trace_id, at);
      db.prepare("UPDATE evidence_requirements_r921 SET status='received',updated_at=? WHERE requirement_id=?").run(at, payload.requirement_id);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    return { created: true, package: serializePackage(db.prepare("SELECT * FROM external_evidence_packages WHERE package_id=?").get(packageId)), receipt: { receipt_id: receiptId, validation_status: "validated_transport", package_sha256: packageSha256, authority_boundary: JSON.parse(authority) } };
  }

  function listPackages(projectId, ctx) {
    return db.prepare("SELECT * FROM external_evidence_packages WHERE tenant_id=? AND organization_id=? AND project_id=? ORDER BY created_at DESC")
      .all(ctx.tenant_id, ctx.organization_id, projectId).map(serializePackage);
  }

  function reviewPackage(packageId, payload, ctx) {
    if (!REVIEW_DECISIONS.has(payload.decision)) fail("decision must be accepted, rejected, or correction_required.", "REVIEW_DECISION_INVALID");
    const row = db.prepare("SELECT * FROM external_evidence_packages WHERE package_id=? AND tenant_id=? AND organization_id=?").get(packageId, ctx.tenant_id, ctx.organization_id);
    if (!row) fail("Evidence Package not found.", "EVIDENCE_PACKAGE_NOT_FOUND", 404);
    const at = now();
    db.prepare("UPDATE external_evidence_packages SET status=?,review_decision=?,review_reason=?,reviewed_by=?,reviewed_at=? WHERE package_id=?")
      .run(payload.decision, payload.decision, payload.reason || "", ctx.user_id, at, packageId);
    db.prepare("UPDATE evidence_requirements_r921 SET status=?,updated_at=? WHERE requirement_id=?")
      .run(payload.decision === "accepted" ? "accepted" : payload.decision, at, row.requirement_id);
    return serializePackage(db.prepare("SELECT * FROM external_evidence_packages WHERE package_id=?").get(packageId));
  }

  const dimensions = {
    space: [["客廳|living", "客廳"], ["廚房|kitchen", "廚房"], ["浴室|bath", "浴室"], ["臥室|bed", "臥室"]],
    trade: [["木作|wood", "木作"], ["水電|electric|plumb", "水電"], ["防水|waterproof", "防水"], ["泥作|tile|masonry", "泥作"]],
    stage: [["施工前|before", "施工前"], ["施工中|progress", "施工中"], ["完成|after", "完工"], ["驗收|accept", "驗收"]],
    event_type: [["缺失|defect", "缺失"], ["驗收|accept", "查驗"], ["進度|progress", "進度紀錄"], ["完成|after", "完工紀錄"]],
  };

  function inferDimension(text, rules, fallback) {
    const match = rules.find(([pattern]) => new RegExp(pattern, "i").test(text));
    return match ? match[1] : fallback;
  }

  function serializeMedia(row) {
    return row ? { ...row, requires_human_review: Boolean(row.requires_human_review), schema_version: FIELD_EVIDENCE_SCHEMA_VERSION } : null;
  }

  function classifyAsset(projectId, asset) {
    const hint = asset.classification || {};
    const text = `${asset.original_filename || asset.filename || ""} ${asset.caption || ""}`;
    const result = {
      project: hint.project || projectId,
      space: hint.space || inferDimension(text, dimensions.space, "待分類空間"),
      trade: hint.trade || inferDimension(text, dimensions.trade, "待分類工種"),
      stage: hint.stage || inferDimension(text, dimensions.stage, "待分類階段"),
      event_type: hint.event_type || inferDimension(text, dimensions.event_type, "現場紀錄"),
    };
    const known = Object.values(result).filter((value) => !String(value).startsWith("待分類")).length;
    return { ...result, confidence: Math.min(0.95, 0.35 + known * 0.1), classification_status: "candidate", requires_human_review: true };
  }

  function batchCapture(projectId, payload, ctx) {
    assertNoGovernanceMutation(payload);
    const assets = Array.isArray(payload.assets) ? payload.assets : [];
    if (!assets.length || assets.length > 30) fail("assets must contain 1 to 30 files.", "FIELD_MEDIA_BATCH_INVALID");
    const created = [];
    for (const asset of assets) {
      const mediaId = String(asset.media_id || uid("field_media"));
      const filename = String(asset.original_filename || asset.filename || `${mediaId}.bin`);
      let stored = { object_ref: asset.object_ref, content_sha256: asset.content_sha256, bytes: Number(asset.bytes || 0), mime_type: asset.mime_type || "application/octet-stream" };
      if (asset.data_url) {
        if (!persistMedia) fail("Local media persistence is unavailable.", "FIELD_MEDIA_STORAGE_UNAVAILABLE", 503);
        stored = persistMedia(mediaId, asset.data_url, filename, asset.mime_type);
      }
      if (!stored.object_ref) fail("Each asset requires data_url or object_ref.", "FIELD_MEDIA_CONTENT_REQUIRED");
      stored.content_sha256 ||= sha256(stored.object_ref);
      const classification = classifyAsset(projectId, asset);
      const at = now();
      db.prepare(`INSERT INTO field_media_assets
        (media_id,tenant_id,organization_id,project_id,original_filename,mime_type,bytes,object_ref,content_sha256,project_label,space_label,trade_label,stage_label,event_type,caption,confidence,classification_status,requires_human_review,source,captured_at,uploaded_at,trace_id,created_by,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,?,?)`)
        .run(mediaId,ctx.tenant_id,ctx.organization_id,projectId,filename,stored.mime_type,stored.bytes,stored.object_ref,stored.content_sha256,classification.project,classification.space,classification.trade,classification.stage,classification.event_type,asset.caption || filename,classification.confidence,classification.classification_status,asset.source || "local_batch_upload",asset.captured_at || null,at,ctx.trace_id,ctx.user_id,at);
      const provenance = { site_id: asset.site_id || payload.site_id || "site-local-default", source_system: asset.source_system || payload.source_system || "smart_supervision_local", source_event_id: asset.source_event_id || null, uploader_id: asset.uploader_id || ctx.user_id, model_name: asset.model_provenance?.name || "local-rule-classifier", model_version: asset.model_provenance?.version || "R9.2.1-1", tool_trace: asset.tool_trace || { trace_id: ctx.trace_id, classifier: "deterministic_filename_and_hint" } };
      db.prepare("INSERT INTO field_media_provenance_r921 (media_id,tenant_id,organization_id,site_id,source_system,source_event_id,uploader_id,model_name,model_version,tool_trace,provenance_checksum,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(mediaId,ctx.tenant_id,ctx.organization_id,provenance.site_id,provenance.source_system,provenance.source_event_id,provenance.uploader_id,provenance.model_name,provenance.model_version,JSON.stringify(provenance.tool_trace),sha256(provenance),at);      db.prepare("INSERT INTO field_media_revisions (revision_id,media_id,tenant_id,organization_id,revision,project_label,space_label,trade_label,stage_label,event_type,caption,confidence,classification_status,correction_reason,corrected_by,trace_id,created_at) VALUES (?,?,?,?,1,?,?,?,?,?,?,?,'candidate','initial_classification',?,?,?)")
        .run(uid("field_media_revision"),mediaId,ctx.tenant_id,ctx.organization_id,classification.project,classification.space,classification.trade,classification.stage,classification.event_type,asset.caption || filename,classification.confidence,ctx.user_id,ctx.trace_id,at);
      created.push(getMedia(mediaId, projectId, ctx));
    }
    return created;
  }

  function getMedia(mediaId, projectId, ctx) {
    const original = db.prepare("SELECT * FROM field_media_assets WHERE media_id=? AND project_id=? AND tenant_id=? AND organization_id=?").get(mediaId,projectId,ctx.tenant_id,ctx.organization_id);
    if (!original) return null;
    const revision = db.prepare("SELECT * FROM field_media_revisions WHERE media_id=? AND tenant_id=? ORDER BY revision DESC LIMIT 1").get(mediaId,ctx.tenant_id);
    const provenance = db.prepare("SELECT * FROM field_media_provenance_r921 WHERE media_id=? AND tenant_id=? AND organization_id=?").get(mediaId,ctx.tenant_id,ctx.organization_id);
    return serializeMedia({ ...original, ...(revision || {}), ...(provenance || {}), tool_trace: provenance ? JSON.parse(provenance.tool_trace) : {}, media_id: original.media_id, object_ref: original.object_ref, content_sha256: original.content_sha256, original_filename: original.original_filename, original_immutable: true, current_revision: revision?.revision || 1 });
  }

  function listMedia(projectId, ctx) {
    return db.prepare("SELECT media_id FROM field_media_assets WHERE tenant_id=? AND organization_id=? AND project_id=? ORDER BY created_at DESC")
      .all(ctx.tenant_id,ctx.organization_id,projectId).map((row)=>getMedia(row.media_id,projectId,ctx));
  }

  function correctMedia(mediaId, payload, ctx) {
    assertNoGovernanceMutation(payload);
    if (!String(payload.reason || "").trim()) fail("reason is required for a media correction.", "FIELD_MEDIA_CORRECTION_REASON_REQUIRED");
    const original = db.prepare("SELECT * FROM field_media_assets WHERE media_id=? AND tenant_id=? AND organization_id=?").get(mediaId,ctx.tenant_id,ctx.organization_id);
    if (!original) fail("Field media not found.", "FIELD_MEDIA_NOT_FOUND", 404);
    const current = getMedia(mediaId,original.project_id,ctx); const revision = Number(current.current_revision) + 1; const at=now();
    const next = { project_label: payload.classification?.project || current.project_label, space_label: payload.classification?.space || current.space_label, trade_label: payload.classification?.trade || current.trade_label, stage_label: payload.classification?.stage || current.stage_label, event_type: payload.classification?.event_type || current.event_type, caption: payload.caption ?? current.caption };
    db.prepare("INSERT INTO field_media_revisions (revision_id,media_id,tenant_id,organization_id,revision,project_label,space_label,trade_label,stage_label,event_type,caption,confidence,classification_status,correction_reason,corrected_by,trace_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(uid("field_media_revision"),mediaId,ctx.tenant_id,ctx.organization_id,revision,next.project_label,next.space_label,next.trade_label,next.stage_label,next.event_type,next.caption,1,"human_corrected",payload.reason.trim(),ctx.user_id,ctx.trace_id,at);
    return getMedia(mediaId,original.project_id,ctx);
  }

  function listMediaRevisions(mediaId, ctx) {
    return db.prepare("SELECT * FROM field_media_revisions WHERE media_id=? AND tenant_id=? AND organization_id=? ORDER BY revision DESC").all(mediaId,ctx.tenant_id,ctx.organization_id);
  }

  function mapMedia(projectId, payload, ctx) {
    assertNoGovernanceMutation(payload);
    const mediaIds = Array.isArray(payload.media_ids) ? payload.media_ids : [];
    if (!mediaIds.length) fail("media_ids is required.", "FIELD_MEDIA_SELECTION_REQUIRED");
    if (!db.prepare("SELECT provider_id FROM external_evidence_providers WHERE provider_id='provider-local-smart-site' AND tenant_id=?").get(ctx.tenant_id)) {
      registerProvider({ provider_id: "provider-local-smart-site", name: "本機智慧監工 Provider", provider_type: "smart_site_saas" }, ctx);
    }
    return mediaIds.map((mediaId, index) => {
      const media = getMedia(mediaId,projectId,ctx);
      if (!media) fail("Field media not found.", "FIELD_MEDIA_NOT_FOUND", 404, { media_id: mediaId });
      return submitPackage(projectId, { provider_id: "provider-local-smart-site", requirement_id: payload.requirement_id, step_id: payload.step_id, evidence_type: payload.evidence_type, media_id: media.media_id, object_ref: media.object_ref, content_sha256: media.content_sha256, classification: { project: media.project_label, space: media.space_label, trade: media.trade_label, stage: media.stage_label, event_type: media.event_type }, caption: media.caption, confidence: media.confidence, site_id: media.site_id, source_system: media.source_system, source_event_id: media.source_event_id, uploader_id: media.uploader_id, original_filename: media.original_filename, media_revision: media.current_revision, model_provenance: { name: media.model_name, version: media.model_version }, tool_trace: media.tool_trace, mapping_reason: `Matched ${media.stage_label}/${media.event_type} to ${payload.step_id}/${payload.evidence_type}; human acceptance required.`, human_review: { status: "pending", source: "smart_supervision_candidate" } }, { ...ctx, idempotency_key: `${ctx.idempotency_key}:${index}:${media.media_id}` });
    });
  }

  function generateConstructionLog(projectId, payload, ctx) {
    assertNoGovernanceMutation(payload);
    const media = listMedia(projectId, ctx).filter((item) => !payload.media_ids?.length || payload.media_ids.includes(item.media_id));
    if (!media.length) fail("No field media selected for the construction log.", "CONSTRUCTION_LOG_MEDIA_REQUIRED");
    const counts = (key) => Object.entries(media.reduce((acc,item) => ({ ...acc, [item[key]]: (acc[item[key]] || 0) + 1 }), {})).map(([name,count]) => `${name} ${count}`).join("、");
    const logDate = payload.log_date || now().slice(0,10);
    const summary = payload.summary || `共 ${media.length} 筆候選現場紀錄。空間：${counts("space_label")}；工種：${counts("trade_label")}；階段：${counts("stage_label")}；事件：${counts("event_type")}。內容須經人工覆核。`;
    const packageRefs = db.prepare(`SELECT package_id FROM external_evidence_packages WHERE tenant_id=? AND project_id=? AND media_id IN (${media.map(()=>"?").join(",")})`).all(ctx.tenant_id,projectId,...media.map((item)=>item.media_id)).map((row)=>row.package_id);
    const canonical = { project_id: projectId, log_date: logDate, title: payload.title || `${logDate} 施工日誌`, summary, media_refs: media.map((item)=>item.media_id), package_refs: packageRefs, status: "candidate" };
    const logId = uid("construction_log"); const at = now();
    db.prepare("INSERT INTO construction_logs_r921 (log_id,tenant_id,organization_id,project_id,log_date,title,summary,media_refs,package_refs,status,checksum,trace_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,'candidate',?,?,?,?)")
      .run(logId,ctx.tenant_id,ctx.organization_id,projectId,logDate,canonical.title,summary,JSON.stringify(canonical.media_refs),JSON.stringify(packageRefs),sha256(canonical),ctx.trace_id,ctx.user_id,at);
    return { ...canonical, log_id: logId, checksum: sha256(canonical), requires_human_review: true, authority_boundary: { evidence_input_only: true, state_transition_applied: false } };
  }

  function listConstructionLogs(projectId, ctx) {
    return db.prepare("SELECT * FROM construction_logs_r921 WHERE tenant_id=? AND organization_id=? AND project_id=? ORDER BY created_at DESC").all(ctx.tenant_id,ctx.organization_id,projectId)
      .map((row)=>({ ...row, media_refs: JSON.parse(row.media_refs), package_refs: JSON.parse(row.package_refs), requires_human_review: true }));
  }
  function listNcr(projectId, ctx) {
    return db.prepare("SELECT * FROM ncr_candidates_r921 WHERE tenant_id=? AND organization_id=? AND project_id=? ORDER BY created_at DESC").all(ctx.tenant_id,ctx.organization_id,projectId)
      .map((row)=>({ ...row, requires_human_review: row.status === "candidate", authority_boundary: { gate_decision_applied: false, state_transition_applied: false } }));
  }

  function detectCandidateDefects(projectId, payload, ctx) {
    assertNoGovernanceMutation(payload);
    const ids=Array.isArray(payload.media_ids)?payload.media_ids:[]; if(!ids.length) fail("media_ids is required.","NCR_MEDIA_REQUIRED");
    const created=[];
    for(const mediaId of ids){ const media=getMedia(mediaId,projectId,ctx); if(!media) fail("Field media not found.","FIELD_MEDIA_NOT_FOUND",404);
      const text=`${media.event_type} ${media.caption}`; const explicit=/缺失|defect|破損|滲水|裂縫|不符/i.test(text); const defectType=payload.defect_type || (text.match(/滲水|防水/i)?"防水異常":text.match(/裂縫/i)?"裂縫":"現場品質缺失候選");
      const severity=payload.severity || (explicit?"medium":"low"); const description=payload.description || `${media.space_label}／${media.trade_label}：${media.caption}`; const at=now(); const ncrId=uid("NCR");
      const canonical={ncr_id:ncrId,project_id:projectId,media_id:mediaId,media_revision:media.current_revision,defect_type:defectType,severity,description,status:"candidate"};
      db.prepare("INSERT INTO ncr_candidates_r921 (ncr_id,tenant_id,organization_id,project_id,media_id,media_revision,defect_type,severity,description,responsible_party,due_date,status,confidence,detection_source,checksum,trace_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'candidate',?,'rule_candidate',?,?,?,?)")
       .run(ncrId,ctx.tenant_id,ctx.organization_id,projectId,mediaId,media.current_revision,defectType,severity,description,payload.responsible_party||"待指派",payload.due_date||null,explicit?0.78:0.45,sha256(canonical),ctx.trace_id,ctx.user_id,at);
      created.push(listNcr(projectId,ctx).find((item)=>item.ncr_id===ncrId)); }
    return created;
  }

  function reviewNcr(ncrId,payload,ctx){
    if(!["confirmed","rejected"].includes(payload.decision)) fail("decision must be confirmed or rejected.","NCR_REVIEW_INVALID");
    const row=db.prepare("SELECT * FROM ncr_candidates_r921 WHERE ncr_id=? AND tenant_id=? AND organization_id=?").get(ncrId,ctx.tenant_id,ctx.organization_id); if(!row) fail("NCR candidate not found.","NCR_NOT_FOUND",404);
    const at=now(); db.prepare("UPDATE ncr_candidates_r921 SET status=?,responsible_party=?,due_date=?,reviewed_by=?,reviewed_at=?,review_reason=? WHERE ncr_id=?")
      .run(payload.decision,payload.responsible_party||row.responsible_party,payload.due_date||row.due_date,ctx.user_id,at,payload.reason||"",ncrId);
    return listNcr(row.project_id,ctx).find((item)=>item.ncr_id===ncrId);
  }

  function listCapa(projectId,ctx){ return db.prepare("SELECT * FROM capa_records_r921 WHERE tenant_id=? AND organization_id=? AND project_id=? ORDER BY created_at DESC").all(ctx.tenant_id,ctx.organization_id,projectId).map((row)=>({...row,verification_media_refs:JSON.parse(row.verification_media_refs),closure_requires_authorized_verification:true,authority_boundary:{gate_decision_applied:false,state_transition_applied:false}})); }

  function createCapa(projectId,payload,ctx){
    assertNoGovernanceMutation(payload); const ncr=db.prepare("SELECT * FROM ncr_candidates_r921 WHERE ncr_id=? AND project_id=? AND tenant_id=? AND organization_id=?").get(payload.ncr_id,projectId,ctx.tenant_id,ctx.organization_id);
    if(!ncr||ncr.status!=="confirmed") fail("CAPA requires a human-confirmed NCR.","CAPA_CONFIRMED_NCR_REQUIRED",409); for(const key of ["corrective_action","responsible_party","due_date"]) if(!String(payload[key]||"").trim()) fail(`${key} is required.`,"CAPA_FIELD_REQUIRED");
    const capaId=uid("CAPA"),at=now(),canonical={capa_id:capaId,ncr_id:ncr.ncr_id,project_id:projectId,corrective_action:payload.corrective_action,preventive_action:payload.preventive_action||"",responsible_party:payload.responsible_party,due_date:payload.due_date,status:"draft"};
    db.prepare("INSERT INTO capa_records_r921 (capa_id,ncr_id,tenant_id,organization_id,project_id,corrective_action,preventive_action,responsible_party,due_date,verification_media_refs,status,checksum,trace_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'[]','draft',?,?,?,?,?)")
      .run(capaId,ncr.ncr_id,ctx.tenant_id,ctx.organization_id,projectId,payload.corrective_action,payload.preventive_action||"",payload.responsible_party,payload.due_date,sha256(canonical),ctx.trace_id,ctx.user_id,at,at);
    return listCapa(projectId,ctx).find((item)=>item.capa_id===capaId);
  }

  function updateCapa(capaId,payload,ctx){
    assertNoGovernanceMutation(payload); if(!["in_progress","ready_for_verification"].includes(payload.status)) fail("Local CAPA may only move to in_progress or ready_for_verification; closure requires authorized acceptance workflow.","CAPA_STATUS_INVALID",409);
    const row=db.prepare("SELECT * FROM capa_records_r921 WHERE capa_id=? AND tenant_id=? AND organization_id=?").get(capaId,ctx.tenant_id,ctx.organization_id); if(!row) fail("CAPA not found.","CAPA_NOT_FOUND",404);
    const refs=Array.isArray(payload.verification_media_refs)?payload.verification_media_refs:JSON.parse(row.verification_media_refs); if(payload.status==="ready_for_verification"&&!refs.length) fail("Verification media is required.","CAPA_VERIFICATION_MEDIA_REQUIRED");
const at=now(); db.exec("BEGIN IMMEDIATE"); try { db.prepare("UPDATE capa_records_r921 SET status=?,verification_media_refs=?,updated_at=? WHERE capa_id=?").run(payload.status,JSON.stringify(refs),at,capaId); db.prepare("INSERT INTO capa_transition_history_r921 (transition_id,capa_id,tenant_id,organization_id,from_status,to_status,reason,evidence_refs,actor_id,trace_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(uid("capa_transition"),capaId,ctx.tenant_id,ctx.organization_id,row.status,payload.status,payload.reason||"CAPA workflow update",JSON.stringify(refs),ctx.user_id,ctx.trace_id,at); db.exec("COMMIT"); } catch(error){db.exec("ROLLBACK");throw error;} return listCapa(row.project_id,ctx).find((item)=>item.capa_id===capaId);
  }
  function closeCapa(capaId,payload,ctx){
    assertNoGovernanceMutation(payload); const row=db.prepare("SELECT * FROM capa_records_r921 WHERE capa_id=? AND tenant_id=? AND organization_id=?").get(capaId,ctx.tenant_id,ctx.organization_id); if(!row) fail("CAPA not found.","CAPA_NOT_FOUND",404);
    if(row.status!=="ready_for_verification") fail("CAPA must be ready_for_verification before authorized closure.","CAPA_NOT_READY",409);
    const refs=JSON.parse(row.verification_media_refs); if(!refs.length) fail("Verification media is required.","CAPA_VERIFICATION_MEDIA_REQUIRED",409);
    const accepted=db.prepare(`SELECT DISTINCT media_id FROM external_evidence_packages WHERE tenant_id=? AND organization_id=? AND project_id=? AND status='accepted' AND media_id IN (${refs.map(()=>"?").join(",")})`).all(ctx.tenant_id,ctx.organization_id,row.project_id,...refs).map((item)=>item.media_id);
    const missing=refs.filter((id)=>!accepted.includes(id)); if(missing.length) fail("Every verification media item must have an accepted Evidence Package.","CAPA_ACCEPTED_EVIDENCE_REQUIRED",409,{missing_media_ids:missing});
    if(!String(payload.reason||"").trim()) fail("Authorized closure reason is required.","CAPA_CLOSURE_REASON_REQUIRED"); const at=now();
    db.exec("BEGIN IMMEDIATE"); try { db.prepare("UPDATE capa_records_r921 SET status='closed',updated_at=? WHERE capa_id=?").run(at,capaId); db.prepare("INSERT INTO capa_transition_history_r921 (transition_id,capa_id,tenant_id,organization_id,from_status,to_status,reason,evidence_refs,actor_id,trace_id,created_at) VALUES (?,?,?,?,?,'closed',?,?,?,?,?)").run(uid("capa_transition"),capaId,ctx.tenant_id,ctx.organization_id,row.status,payload.reason.trim(),JSON.stringify(refs),ctx.user_id,ctx.trace_id,at); db.exec("COMMIT"); } catch(error){db.exec("ROLLBACK");throw error;}
    return listCapa(row.project_id,ctx).find((item)=>item.capa_id===capaId);
  }
  function listCapaHistory(capaId,ctx){ return db.prepare("SELECT * FROM capa_transition_history_r921 WHERE capa_id=? AND tenant_id=? AND organization_id=? ORDER BY created_at DESC").all(capaId,ctx.tenant_id,ctx.organization_id).map((row)=>({...row,evidence_refs:JSON.parse(row.evidence_refs)})); }
  return { schemaVersion: FIELD_EVIDENCE_SCHEMA_VERSION, listProviders, registerProvider, listRequirements, upsertRequirement, submitPackage, listPackages, reviewPackage, batchCapture, listMedia, correctMedia, listMediaRevisions, mapMedia, generateConstructionLog, listConstructionLogs, detectCandidateDefects, listNcr, reviewNcr, createCapa, listCapa, updateCapa, closeCapa, listCapaHistory };
}












