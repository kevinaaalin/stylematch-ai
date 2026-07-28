export const ISAFE_CONTRACT_VERSION = "20260722_R5_2";

export const ISAFE_GOVERNANCE_STEPS = [
  { sequence: "S1", code: "D1", key: "D1_design_preparation", name: "前置作業", phase: "設計階段" },
  { sequence: "S2", code: "D2", key: "D2_floor_plan_design", name: "平面設計規劃", phase: "設計階段" },
  { sequence: "S3", code: "D3", key: "D3_basic_design_finalization", name: "基本設計規劃定案", phase: "設計階段" },
  { sequence: "S4", code: "D4", key: "D4_elevation_design_finalization", name: "立面設計定案", phase: "設計階段" },
  { sequence: "S5", code: "D5", key: "D5_construction_detail_agreements", name: "施工大樣及其他約定事項", phase: "設計階段" },
  { sequence: "S6", code: "C1", key: "C1_construction_preparation", name: "前置作業", phase: "工程階段" },
  { sequence: "S7", code: "C2", key: "C2_phase_one_construction", name: "第一階段工程施工", phase: "工程階段" },
  { sequence: "S8", code: "C3", key: "C3_phase_two_construction", name: "第二階段工程施工", phase: "工程階段" },
  { sequence: "S9", code: "C4", key: "C4_phase_three_construction", name: "第三階段工程施工", phase: "工程階段" },
  { sequence: "S10", code: "C5", key: "C5_warranty_aftercare", name: "保固修繕及售後服務", phase: "工程階段" },
];

export const LEGACY_ISAFE_STAGE_MAP = {
  D1_intake: "D1_design_preparation",
  D2_requirement_review: "D2_floor_plan_design",
  D3_design_match: "D3_basic_design_finalization",
  D3_twcID_matching: "D3_basic_design_finalization",
  D4_proposal_review: "D4_elevation_design_finalization",
  D4_proposal_alignment: "D4_elevation_design_finalization",
  D5_contract_ready: "D5_construction_detail_agreements",
  D5_isafe_handoff_ready: "D5_construction_detail_agreements",
  C1_contract_start: "C1_construction_preparation",
  C2_site_execution: "C2_phase_one_construction",
  C3_change_control: "C3_phase_two_construction",
  C4_acceptance: "C4_phase_three_construction",
  C5_warranty_closed: "C5_warranty_aftercare",
};

const CANONICAL_STAGES = new Set([
  "INTAKE_pending",
  ...ISAFE_GOVERNANCE_STEPS.map((step) => step.key),
  "CLOSED",
]);

export function normalizeIsafeStage(stage, fallback = "D1_design_preparation") {
  if (CANONICAL_STAGES.has(stage)) return stage;
  return LEGACY_ISAFE_STAGE_MAP[stage] || fallback;
}

export function buildIsafeGovernanceSteps(currentStage = "D1_design_preparation") {
  const normalizedStage = normalizeIsafeStage(currentStage);
  const activeIndex = ISAFE_GOVERNANCE_STEPS.findIndex((step) => step.key === normalizedStage);

  return ISAFE_GOVERNANCE_STEPS.map((step, index) => ({
    ...step,
    label: step.name,
    status: normalizedStage === "CLOSED"
      ? "completed"
      : activeIndex < 0
        ? "not_started"
        : index < activeIndex
          ? "completed"
          : index === activeIndex
            ? "active"
            : "not_started",
  }));
}

export function isPendingGovernance(item) {
  const values = [item?.status, item?.gate_status, item?.current_stage]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return values.includes("pending") || values.includes("review_required") || values.includes("conditional");
}

export function getIsafeIdentity() {
  const memberTier = import.meta.env.VITE_ISAFE_MEMBER_TIER || "dealer";
  const certifiedMemberType = import.meta.env.VITE_ISAFE_CERTIFIED_MEMBER_TYPE || "";
  const roleByTier = {
    headquarter: "headquarter",
    dealer: "dealer",
    association: "association",
    general_member: "general_member",
    certified_member: certifiedMemberType === "vendor" ? "certified_vendor" : "certified_designer",
  };

  return {
    userId: import.meta.env.VITE_ISAFE_USER_ID || "stylematch-local-user",
    memberTier,
    certifiedMemberType,
    caseRole: import.meta.env.VITE_ISAFE_CASE_ROLE || "case_coordinator",
    workspaceRole: import.meta.env.VITE_ISAFE_WORKSPACE_ROLE || roleByTier[memberTier] || "general_member",
  };
}

export const ISAFE_WORKSPACE_ORIGIN =
  import.meta.env.VITE_ISAFE_WORKSPACE_ORIGIN || "http://127.0.0.1:4174/";

export function buildIsafeWorkspaceUrl(isafeCase, role = getIsafeIdentity().workspaceRole) {
  const caseId = typeof isafeCase === "string"
    ? isafeCase
    : isafeCase?.isafe_case_id || isafeCase?.isafe_project_id || "";
  const url = new URL(ISAFE_WORKSPACE_ORIGIN);
  url.searchParams.set("view", "projects");
  url.searchParams.set("role", role);
  if (caseId) url.searchParams.set("case", caseId);
  return url.toString();
}

export function summarizeLegacyWorkspace(workspace, currentStage) {
  const checklist = workspace?.checklist || [];
  const currentStageItems = checklist.filter((item) => item.stage === currentStage);
  const partyPending = (party) => checklist.filter(
    (item) => (item.confirmations?.[party]?.status || "pending") === "pending"
  ).length;

  return {
    contractVersion: workspace?.contract_version || ISAFE_CONTRACT_VERSION,
    total: workspace?.checklist_summary?.total ?? checklist.length,
    completed: workspace?.checklist_summary?.completed ?? checklist.filter((item) => item.status === "completed").length,
    currentStageTotal: workspace?.checklist_summary?.current_stage_total ?? currentStageItems.length,
    currentStageCompleted: workspace?.checklist_summary?.current_stage_completed
      ?? currentStageItems.filter((item) => item.status === "completed").length,
    certifiedMemberPending: partyPending("certified_member"),
    ownerPending: partyPending("owner"),
    stageLocked: currentStageItems.length > 0 && currentStageItems.every((item) => item.stage_locked),
  };
}
