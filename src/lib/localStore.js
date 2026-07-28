import {
  buildIsafeGovernanceSteps,
  buildIsafeWorkspaceUrl,
  ISAFE_CONTRACT_VERSION,
  normalizeIsafeStage,
} from "@/lib/isafeContract";

const STORAGE_KEY = "stylematch_local_mvp_v1";
const STORAGE_SCHEMA_VERSION = 2;

export const CASE_STAGES = [
  { value: "matched_confirmed", label: "TWCID 媒合已確認", tone: "bg-emerald-100 text-emerald-800" },
  { value: "intake_created", label: "需求建檔", tone: "bg-sky-100 text-sky-800" },
  { value: "ai_review", label: "AI 初評", tone: "bg-violet-100 text-violet-800" },
  { value: "matching", label: "TWCID 媒合中", tone: "bg-amber-100 text-amber-800" },
  { value: "matched", label: "已媒合會員", tone: "bg-emerald-100 text-emerald-800" },
  { value: "isafe_ready", label: "待轉 iSAFE", tone: "bg-orange-100 text-orange-800" },
  { value: "isafe_created", label: "iSAFE 已立案", tone: "bg-teal-100 text-teal-800" },
  { value: "closed", label: "已結案", tone: "bg-stone-200 text-stone-700" },
];

const emptyDatabase = {
  storage_schema_version: STORAGE_SCHEMA_VERSION,
  styleTests: [],
  projects: [],
  isafeCases: [],
  notifications: [],
  auditLogs: [],
  jobs: [],
};

const legacyStageMap = {
  "需求建檔": "intake_created",
  "AI 初評": "ai_review",
  "TWCID 媒合中": "matching",
  "已媒合會員": "matched",
  "待轉 iSAFE": "isafe_ready",
  "iSAFE 已立案": "isafe_created",
  "已結案": "closed",
};

function getPhotoSummary(spacePhotos = {}) {
  return Object.fromEntries(
    Object.entries(spacePhotos).map(([space, photos]) => [
      space,
      Array.isArray(photos) ? photos.length : 0,
    ])
  );
}

export function compactProjectData(data) {
  const {
    space_photos: spacePhotos = {},
    reference_photos: referencePhotos = [],
    ...projectFields
  } = data;

  return {
    ...projectFields,
    photo_summary: getPhotoSummary(spacePhotos),
    total_photo_count: Object.values(spacePhotos).reduce(
      (total, photos) => total + (Array.isArray(photos) ? photos.length : 0),
      0
    ),
    reference_photo_count: Array.isArray(referencePhotos) ? referencePhotos.length : 0,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function makeTraceId() {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function stageExists(stage) {
  return CASE_STAGES.some((item) => item.value === stage);
}

function normalizeStage(stage) {
  if (stageExists(stage)) return stage;
  return legacyStageMap[stage] || "intake_created";
}

function getYear(date = new Date()) {
  return date.getFullYear();
}

function nextSequence(items, field, prefix, year = getYear()) {
  const matcher = new RegExp(`^${prefix}-${year}-(\\d{4})$`);
  const max = items.reduce((highest, item) => {
    const match = String(item[field] || "").match(matcher);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return String(max + 1).padStart(4, "0");
}

function nextCaseCode(database) {
  const year = getYear();
  return `SM-${year}-${nextSequence(database.projects || [], "case_code", "SM", year)}`;
}

function nextTwcidMatchId(database) {
  const year = getYear();
  return `TWCID-${year}-${nextSequence(database.projects || [], "twcid_match_id", "TWCID", year)}`;
}

function nextIsafeCaseId(database) {
  const year = getYear();
  return `IS-${year}-${nextSequence(database.projects || [], "isafe_case_id", "IS", year)}`;
}

function makeTimelineEvent({ title, status, actor = "StyleMatch AI", detail = "", at = nowIso(), traceId }) {
  return {
    id: randomId("tl"),
    at,
    title,
    status,
    actor,
    detail,
    trace_id: traceId || makeTraceId(),
  };
}

function makeAuditLog({
  action,
  targetType,
  targetId,
  userId = "local-admin",
  detail = "",
  traceId,
  at = nowIso(),
}) {
  return {
    id: randomId("aud"),
    user_id: userId,
    action,
    target_type: targetType,
    target_id: targetId,
    ip: "localStorage",
    detail,
    trace_id: traceId || makeTraceId(),
    created_at: at,
  };
}

function makeJob({ project, type, status = "queued", detail = "", traceId, at = nowIso() }) {
  return {
    id: randomId("job"),
    project_id: project.project_id,
    case_code: project.case_code,
    type,
    status,
    detail,
    trace_id: traceId || makeTraceId(),
    created_at: at,
    updated_at: at,
  };
}

function serviceMatchStatus(serviceOption) {
  if (serviceOption === "ai_proposal") return "AI 提案流程";
  if (serviceOption === "platform_matching" || serviceOption === "twcid_platform") return "等待 TWCID 媒合";
  return "尚未選擇服務";
}

function initialStageForService(serviceOption) {
  if (["platform_matching", "twcid_platform", "isafe_governance"].includes(serviceOption)) return "matching";
  return "ai_review";
}

function normalizeProject(project, index) {
  const createdAt = project.created_at || nowIso();
  const id = project.id || randomId("project");
  const projectId = project.project_id || id;
  const caseCode = project.case_code || `SM-${getYear(new Date(createdAt))}-${String(index + 1).padStart(4, "0")}`;
  const traceId = project.trace_id || makeTraceId();
  const stageStatus = normalizeStage(project.stage_status || project.current_stage);
  const timeline = Array.isArray(project.timeline) && project.timeline.length
    ? project.timeline
    : [
        makeTimelineEvent({
          title: "案件建立",
          status: "intake_created",
          actor: "localStorage MVP",
          detail: "由既有資料自動補齊案件時間軸。",
          at: createdAt,
          traceId,
        }),
      ];

  return {
    ...compactProjectData(project),
    id,
    project_id: projectId,
    stylematch_project_id: project.stylematch_project_id || projectId,
    canonical_project_id: project.canonical_project_id || null,
    journey_id: project.journey_id || null,
    handover_id: project.handover_id || null,
    tenant_id: project.tenant_id || "tenant_local_tigi",
    organization_id: project.organization_id || "org_local_headquarter",
    correlation_id: project.correlation_id || traceId,
    case_code: caseCode,
    twcid_match_id: project.twcid_match_id || null,
    isafe_case_id: project.isafe_case_id || null,
    stage_status: stageStatus,
    current_stage: project.isafe_case_id
      ? normalizeIsafeStage(project.isafe_current_stage || project.current_stage)
      : null,
    isafe_current_stage: project.isafe_case_id
      ? normalizeIsafeStage(project.isafe_current_stage || project.current_stage)
      : null,
    gate_status: project.gate_status || "not_started",
    pgp_url: project.pgp_url || "",
    match_status: project.match_status || serviceMatchStatus(project.service_option),
    trace_id: traceId,
    timeline,
    audit_log_ids: Array.isArray(project.audit_log_ids) ? project.audit_log_ids : [],
    created_at: createdAt,
    updated_at: project.updated_at || createdAt,
  };
}

function makeIsafeCaseFromProject(project, { traceId, at = nowIso() } = {}) {
  const createdAt = at;
  return {
    id: `isafe_${project.isafe_case_id}`,
    isafe_case_id: project.isafe_case_id,
    isafe_project_id: project.isafe_case_id,
    source_project_id: project.project_id,
    stylematch_project_id: project.stylematch_project_id || project.project_id,
    project_id: project.canonical_project_id || null,
    journey_id: project.journey_id || null,
    handover_id: project.handover_id || null,
    source_case_code: project.case_code,
    source: "StyleMatchAI",
    title: `${project.case_code} iSAFE 監管專案`,
    status: "active",
    current_stage: "D1_design_preparation",
    gate_status: "D1_pending",
    risk_score: null,
    risk_assessment: {
      value: null,
      status: "pilot_unverified",
      formal: false,
      human_confirmation: false,
      note: "StyleMatch 離線快照不提供正式風險判定。",
    },
    contract_version: ISAFE_CONTRACT_VERSION,
    pgp_url: project.pgp_url || `local://isafe/${project.isafe_case_id}/pgp`,
    workspace_url: buildIsafeWorkspaceUrl(project.isafe_case_id),
    owner: "local-admin",
    governance_steps: buildIsafeGovernanceSteps("D1_design_preparation"),
    evidence_summary: {
      timeline_events: Array.isArray(project.timeline) ? project.timeline.length : 0,
      source_audit_logs: Array.isArray(project.audit_log_ids) ? project.audit_log_ids.length : 0,
      project_photos: project.total_photo_count || 0,
      reference_photos: project.reference_photo_count || 0,
    },
    timeline: [
      makeTimelineEvent({
        title: "iSAFE 監管專案成立",
        status: "D1_design_preparation",
        actor: "StyleMatch AI",
        detail: `由 ${project.case_code} 自動成立 iSAFE 監管專案 ${project.isafe_case_id}。`,
        at: createdAt,
        traceId,
      }),
    ],
    trace_id: traceId || project.trace_id || makeTraceId(),
    created_at: createdAt,
    updated_at: createdAt,
  };
}

function normalizeIsafeCase(isafeCase, index) {
  const createdAt = isafeCase.created_at || nowIso();
  const currentStage = normalizeIsafeStage(isafeCase.current_stage);
  return {
    id: isafeCase.id || `isafe_${isafeCase.isafe_case_id || index + 1}`,
    isafe_case_id: isafeCase.isafe_case_id,
    isafe_project_id: isafeCase.isafe_project_id || isafeCase.isafe_case_id,
    source_project_id: isafeCase.source_project_id || null,
    stylematch_project_id: isafeCase.stylematch_project_id || isafeCase.source_project_id || null,
    project_id: isafeCase.project_id || null,
    journey_id: isafeCase.journey_id || null,
    handover_id: isafeCase.handover_id || null,
    tenant_id: isafeCase.tenant_id || "tenant_local_tigi",
    organization_id: isafeCase.organization_id || "org_local_headquarter",
    correlation_id: isafeCase.correlation_id || isafeCase.trace_id || null,
    source_case_code: isafeCase.source_case_code || null,
    source: isafeCase.source || "StyleMatchAI",
    title: isafeCase.title || `${isafeCase.source_case_code || "StyleMatch"} iSAFE 監管專案`,
    status: isafeCase.status || "active",
    current_stage: currentStage,
    gate_status: isafeCase.gate_status || "D1_pending",
    risk_score: Number.isFinite(isafeCase.risk_score) ? isafeCase.risk_score : null,
    risk_assessment: isafeCase.risk_assessment || {
      value: Number.isFinite(isafeCase.risk_score) ? isafeCase.risk_score : null,
      status: "pilot_unverified",
      formal: false,
      human_confirmation: false,
    },
    contract_version: isafeCase.contract_version || isafeCase.schema_version || ISAFE_CONTRACT_VERSION,
    pgp_url: isafeCase.pgp_url || (isafeCase.isafe_case_id ? `local://isafe/${isafeCase.isafe_case_id}/pgp` : ""),
    workspace_url: buildIsafeWorkspaceUrl(isafeCase.isafe_case_id),
    owner: isafeCase.owner || "local-admin",
    governance_steps: buildIsafeGovernanceSteps(currentStage),
    evidence_summary: isafeCase.evidence_summary || {},
    timeline: Array.isArray(isafeCase.timeline) ? isafeCase.timeline : [],
    trace_id: isafeCase.trace_id || makeTraceId(),
    created_at: createdAt,
    updated_at: isafeCase.updated_at || createdAt,
  };
}

function compactDatabase(database) {
  const merged = {
    ...emptyDatabase,
    ...database,
  };
  const projects = (merged.projects || []).map(normalizeProject);
  const storedIsafeCases = Array.isArray(merged.isafeCases) ? merged.isafeCases : [];
  const migratedIsafeCases = projects
    .filter((project) => project.isafe_case_id)
    .filter((project) => !storedIsafeCases.some(
      (isafeCase) =>
        isafeCase.isafe_case_id === project.isafe_case_id ||
        isafeCase.source_project_id === project.project_id
    ))
    .map((project) => makeIsafeCaseFromProject(project, {
      traceId: project.trace_id,
      at: project.updated_at || project.created_at,
    }));

  return {
    ...merged,
    storage_schema_version: STORAGE_SCHEMA_VERSION,
    projects,
    isafeCases: [...storedIsafeCases, ...migratedIsafeCases].map(normalizeIsafeCase),
    auditLogs: Array.isArray(merged.auditLogs) ? merged.auditLogs : [],
    jobs: Array.isArray(merged.jobs) ? merged.jobs : [],
  };
}

function readDatabase() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyDatabase };
    const parsed = JSON.parse(raw);
    const compacted = compactDatabase(parsed);
    if (parsed.storage_schema_version !== STORAGE_SCHEMA_VERSION) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compacted));
    }
    return compacted;
  } catch {
    return { ...emptyDatabase };
  }
}

function writeDatabase(database) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compactDatabase(database)));
    window.dispatchEvent(new CustomEvent("stylematch:data-changed"));
  } catch {
    throw new Error("本機案件資料儲存失敗，請先清出瀏覽器儲存空間後再試。");
  }
}

function recordProjectEvent(database, project, event, audit) {
  const timelineEvent = makeTimelineEvent({ ...event, traceId: audit.trace_id });
  const auditLog = makeAuditLog({
    ...audit,
    targetType: "project",
    targetId: project.project_id,
    traceId: audit.trace_id,
  });

  project.timeline = [timelineEvent, ...(project.timeline || [])];
  project.audit_log_ids = [auditLog.id, ...(project.audit_log_ids || [])];
  project.updated_at = timelineEvent.at;
  database.auditLogs.unshift(auditLog);
}

export const localStore = {
  createStyleTest(data) {
    const database = readDatabase();
    const traceId = makeTraceId();
    const record = {
      ...data,
      id: crypto.randomUUID(),
      created_at: nowIso(),
      trace_id: traceId,
    };
    const auditLog = makeAuditLog({
      action: "style_test.create",
      targetType: "style_test",
      targetId: record.id,
      userId: record.user_email || "anonymous",
      detail: `風格測驗完成：${record.primary_style || "未分類"}`,
      traceId,
      at: record.created_at,
    });

    database.styleTests.unshift(record);
    database.auditLogs.unshift(auditLog);
    writeDatabase(database);
    return record;
  },

  createProject(data) {
    const database = readDatabase();
    const createdAt = nowIso();
    const traceId = makeTraceId();
    const stageStatus = initialStageForService(data.service_option);
    const record = {
      ...compactProjectData(data),
      id: crypto.randomUUID(),
      project_id: crypto.randomUUID(),
      stylematch_project_id: null,
      canonical_project_id: null,
      journey_id: null,
      handover_id: null,
      tenant_id: "tenant_local_tigi",
      organization_id: "org_local_headquarter",
      case_code: nextCaseCode(database),
      twcid_match_id: null,
      isafe_case_id: null,
      stage_status: stageStatus,
      current_stage: stageStatus,
      gate_status: "not_started",
      pgp_url: "",
      match_status: serviceMatchStatus(data.service_option),
      trace_id: traceId,
      timeline: [
        makeTimelineEvent({
          title: "案件建立",
          status: "intake_created",
          actor: "客戶需求表單",
          detail: "需求單已建立 project_id 與 case_code。",
          at: createdAt,
          traceId,
        }),
        makeTimelineEvent({
          title: stageStatus === "matching" ? "進入 TWCID 媒合" : "進入 AI 初評",
          status: stageStatus,
          actor: "StyleMatch AI",
          detail: stageStatus === "matching"
            ? "服務選項需要 TWCID 會員媒合，已排入媒合流程。"
            : "服務選項需要 AI 提案，已排入初評流程。",
          at: createdAt,
          traceId,
        }),
      ],
      audit_log_ids: [],
      created_at: createdAt,
      updated_at: createdAt,
    };

    record.stylematch_project_id = record.project_id;
    record.correlation_id = traceId;

    const auditLog = makeAuditLog({
      action: "project.create",
      targetType: "project",
      targetId: record.project_id,
      userId: data.user_email || "anonymous",
      detail: `建立案件 ${record.case_code}`,
      traceId,
      at: createdAt,
    });
    record.audit_log_ids = [auditLog.id];

    database.projects.unshift(record);
    database.auditLogs.unshift(auditLog);
    database.jobs.unshift(makeJob({
      project: record,
      type: stageStatus === "matching" ? "twcid_match_request" : "ai_review",
      status: "queued",
      detail: "localStorage MVP 預留 jobs 欄位，待後端 API 接手。",
      traceId,
      at: createdAt,
    }));
    writeDatabase(database);
    return record;
  },

  addNotification(data) {
    const database = readDatabase();
    const traceId = makeTraceId();
    const record = {
      ...data,
      id: crypto.randomUUID(),
      delivery_status: data.delivery_status || "localStorage sent",
      trace_id: traceId,
      created_at: nowIso(),
    };
    const auditLog = makeAuditLog({
      action: "notification.send",
      targetType: "notification",
      targetId: record.id,
      userId: data.to || "anonymous",
      detail: `通知寄送：${data.subject || "未命名通知"}`,
      traceId,
      at: record.created_at,
    });

    database.notifications.unshift(record);
    database.auditLogs.unshift(auditLog);
    writeDatabase(database);
    return record;
  },

  getAll() {
    return readDatabase();
  },

  updateProjectStage(projectId, nextStage) {
    const database = readDatabase();
    const project = database.projects.find((item) => item.id === projectId || item.project_id === projectId);
    if (!project) return null;

    const stage = normalizeStage(nextStage);
    const traceId = makeTraceId();
    project.stage_status = stage;
    project.match_status = CASE_STAGES.find((item) => item.value === stage)?.label || stage;
    if (stage === "closed") {
      project.current_stage = project.isafe_case_id ? "CLOSED" : null;
      project.isafe_current_stage = project.current_stage;
      project.gate_status = "closed";
    }

    recordProjectEvent(
      database,
      project,
      {
        title: "案件階段更新",
        status: stage,
        actor: "案件控台",
        detail: `stage_status 更新為 ${project.match_status}。`,
      },
      {
        action: "project.stage_update",
        userId: "local-admin",
        detail: `${project.case_code} stage_status=${stage}`,
        traceId,
      }
    );

    writeDatabase(database);
    return project;
  },

  createTwcidMatch(projectId) {
    const database = readDatabase();
    const project = database.projects.find((item) => item.id === projectId || item.project_id === projectId);
    if (!project) return null;

    const traceId = makeTraceId();
    project.twcid_match_id = project.twcid_match_id || nextTwcidMatchId(database);
    project.stage_status = "matched";
    project.match_status = "已媒合 TWCID 會員";

    recordProjectEvent(
      database,
      project,
      {
        title: "TWCID 媒合建立",
        status: "matched",
        actor: "案件控台",
        detail: `twcid_match_id=${project.twcid_match_id}`,
      },
      {
        action: "match_request.create",
        userId: "local-admin",
        detail: `${project.case_code} 建立 ${project.twcid_match_id}`,
        traceId,
      }
    );

    database.jobs.unshift(makeJob({
      project,
      type: "twcid_match_request",
      status: "completed",
      detail: `TWCID match id: ${project.twcid_match_id}`,
      traceId,
    }));
    writeDatabase(database);
    return project;
  },

  confirmTwcidMatch(projectId) {
    const database = readDatabase();
    const project = database.projects.find((item) => item.id === projectId || item.project_id === projectId);
    if (!project?.twcid_match_id) return null;

    const traceId = makeTraceId();
    project.stage_status = "matched_confirmed";
    project.match_status = "matched_confirmed";
    recordProjectEvent(
      database,
      project,
      {
        title: "TWCID 媒合確認成功",
        status: "matched_confirmed",
        actor: "local-admin",
        detail: `twcid_match_id=${project.twcid_match_id} 已由人工確認，可申請 iSAFE 交接。`,
      },
      {
        action: "match.confirmed",
        userId: "local-admin",
        detail: `${project.case_code} match_status=matched_confirmed`,
        traceId,
      }
    );
    writeDatabase(database);
    return project;
  },

  createIsafeCase(projectId, remoteCase = null) {
    const database = readDatabase();
    const project = database.projects.find((item) => item.id === projectId || item.project_id === projectId);
    if (!project) return null;

    const traceId = makeTraceId();
    project.isafe_case_id = remoteCase?.isafe_case_id || project.isafe_case_id || nextIsafeCaseId(database);
    project.stage_status = "isafe_created";
    project.current_stage = normalizeIsafeStage(remoteCase?.current_stage);
    project.isafe_current_stage = project.current_stage;
    project.gate_status = "D1_pending";
    project.pgp_url = remoteCase?.pgp_url || project.pgp_url || `local://isafe/${project.isafe_case_id}/pgp`;
    project.stylematch_project_id = remoteCase?.stylematch_project_id || project.stylematch_project_id || project.project_id;
    project.canonical_project_id = remoteCase?.project_id || project.canonical_project_id || null;
    project.journey_id = remoteCase?.journey_id || project.journey_id || null;
    project.handover_id = remoteCase?.handover_id || project.handover_id || null;
    project.correlation_id = remoteCase?.correlation_id || project.correlation_id || traceId;
    project.match_status = "iSAFE 已立案";
    const isafeCase = remoteCase
      ? normalizeIsafeCase({
          ...makeIsafeCaseFromProject(project, { traceId }),
          ...remoteCase,
          source_project_id: project.project_id,
          source_case_code: project.case_code,
        }, 0)
      : makeIsafeCaseFromProject(project, { traceId });
    const existingIsafeIndex = database.isafeCases.findIndex(
      (item) =>
        item.isafe_case_id === project.isafe_case_id ||
        item.source_project_id === project.project_id
    );

    recordProjectEvent(
      database,
      project,
      {
        title: "轉入 iSAFE",
        status: "isafe_created",
        actor: "案件控台",
        detail: `isafe_case_id=${project.isafe_case_id}，current_stage=${project.current_stage}。`,
      },
      {
        action: "isafe.case_create",
        userId: "local-admin",
        detail: `${project.case_code} 建立 ${project.isafe_case_id}`,
        traceId,
      }
    );

    database.jobs.unshift(makeJob({
      project,
      type: "isafe_case_create",
      status: "completed",
      detail: `iSAFE case id: ${project.isafe_case_id}`,
      traceId,
    }));
    if (existingIsafeIndex >= 0) {
      database.isafeCases[existingIsafeIndex] = {
        ...database.isafeCases[existingIsafeIndex],
        ...isafeCase,
        timeline: [
          ...(isafeCase.timeline || []),
          ...(database.isafeCases[existingIsafeIndex].timeline || []),
        ],
        updated_at: nowIso(),
      };
    } else {
      database.isafeCases.unshift(isafeCase);
    }
    writeDatabase(database);
    return { project, isafeCase };
  },

  removeStyleTest(id) {
    const database = readDatabase();
    const removed = database.styleTests.find((test) => test.id === id);
    database.styleTests = database.styleTests.filter((test) => test.id !== id);
    if (removed?.user_email) {
      database.notifications = database.notifications.filter(
        (notification) => notification.to !== removed.user_email
      );
    }
    database.auditLogs.unshift(makeAuditLog({
      action: "style_test.delete",
      targetType: "style_test",
      targetId: id,
      userId: removed?.user_email || "local-admin",
      detail: "刪除本機風格測驗紀錄。",
    }));
    writeDatabase(database);
  },

  clear() {
    writeDatabase({ ...emptyDatabase });
  },
};
