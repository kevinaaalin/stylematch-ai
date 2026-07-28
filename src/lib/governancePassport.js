import {
  ISAFE_CONTRACT_VERSION,
  ISAFE_GOVERNANCE_STEPS,
  normalizeIsafeStage,
} from "@/lib/isafeContract";

const GOVERNANCE_NODES = ISAFE_GOVERNANCE_STEPS.map((step) => ({
  ...step,
  label: step.name,
}));

const SBIR_REFERENCES = [
  "SBIR V2 optimized submission draft, 2026-07-01, chapter 5 two-phase ten governance nodes",
  "SBIR V2 optimized submission draft, 2026-07-01, chapter 8 Evidence Engine",
  "SBIR V2 optimized submission draft, 2026-07-01, chapter 9 PGP Engine",
  "SBIR V2 optimized submission draft, 2026-07-01, chapter 10 RiskScore Engine",
  "SBIR TIGI integrated engineering appendix, 2026-07-01, StyleMatch AI / TWCID / iSAFE handoff model",
];

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256Hex(value) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function stageRank(project) {
  const currentKey = normalizeIsafeStage(
    project.isafe_current_stage || project.current_stage,
    "D1_design_preparation"
  );
  const index = GOVERNANCE_NODES.findIndex((node) => node.key === currentKey);
  return index < 0 ? 0 : index;
}

function buildNodeStatus(project, timeline) {
  const rank = stageRank(project);
  return GOVERNANCE_NODES.map((node, index) => {
    const relatedEvents = timeline.filter((event) => {
      const haystack = [event.status, event.title, event.detail].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(node.code.toLowerCase()) || haystack.includes(node.key.toLowerCase());
    });

    return {
      ...node,
      status: index < rank ? "completed" : index === rank ? "active" : "not_started",
      evidence_count: relatedEvents.length,
      trace_ids: relatedEvents.map((event) => event.trace_id).filter(Boolean),
    };
  });
}

function buildRiskSummary(project, timeline, auditLogs) {
  const deductions = [];
  let score = 100;

  if (!project.isafe_case_id) {
    deductions.push({ dimension: "isafe_handoff", points: 12, reason: "isafe_case_id has not been assigned." });
  }
  if (!project.twcid_match_id) {
    deductions.push({ dimension: "supplier_traceability", points: 8, reason: "twcid_match_id has not been assigned." });
  }
  if (!timeline.length) {
    deductions.push({ dimension: "timeline", points: 15, reason: "No timeline events are available." });
  }
  if (!auditLogs.length) {
    deductions.push({ dimension: "audit", points: 15, reason: "No audit logs are linked to this case." });
  }
  if (project.gate_status === "not_started") {
    deductions.push({ dimension: "gate", points: 8, reason: "Gate status remains not_started." });
  }

  deductions.forEach((item) => {
    score -= item.points;
  });

  return {
    model: "StyleMatch pre-handoff pilot indicator; iSAFE human review remains authoritative",
    score: Math.max(0, score),
    level: score >= 85 ? "green" : score >= 70 ? "yellow" : "red",
    status: "pilot_unverified",
    formal: false,
    human_confirmation: false,
    deductions,
  };
}

function buildEvidenceSummary(project, timeline, auditLogs, jobs) {
  return {
    source: "StyleMatchAI local cache with iSAFE R5 API linkage",
    documents: [
      project.case_code && { type: "case_master", ref: project.case_code },
      project.twcid_match_id && { type: "twcid_match", ref: project.twcid_match_id },
      project.isafe_case_id && { type: "isafe_case", ref: project.isafe_case_id },
      project.pgp_url && { type: "pgp_pointer", ref: project.pgp_url },
    ].filter(Boolean),
    media_counts: {
      project_photos: project.total_photo_count || 0,
      reference_photos: project.reference_photo_count || 0,
      spaces: project.photo_summary || {},
    },
    timeline_events: timeline.length,
    audit_logs: auditLogs.length,
    jobs: jobs.length,
    trace_ids: Array.from(new Set([
      project.trace_id,
      ...timeline.map((event) => event.trace_id),
      ...auditLogs.map((log) => log.trace_id),
      ...jobs.map((job) => job.trace_id),
    ].filter(Boolean))),
  };
}

export async function buildGovernancePassport(project, database) {
  const timeline = Array.isArray(project.timeline) ? project.timeline : [];
  const auditLogs = (database.auditLogs || []).filter(
    (log) => log.target_id === project.project_id || project.audit_log_ids?.includes(log.id)
  );
  const jobs = (database.jobs || []).filter((job) => job.project_id === project.project_id);
  const isafeCase = (database.isafeCases || []).find(
    (item) =>
      item.isafe_case_id === project.isafe_case_id ||
      item.source_project_id === project.project_id
  );

  const passport = {
    schema: "TIGI.PGP/20260722_R5_2",
    schema_version: ISAFE_CONTRACT_VERSION,
    generated_at: new Date().toISOString(),
    reviewer_note:
      "StyleMatch pre-handoff preview aligned to the R5.2 state contract. The authoritative PGP, Gate, checklist confirmations, and audit record remain in iSAFE.",
    sbir_references: SBIR_REFERENCES,
    case_master: {
      project_id: project.project_id,
      stylematch_project_id: project.stylematch_project_id || project.project_id,
      canonical_project_id: project.canonical_project_id || null,
      journey_id: project.journey_id || null,
      handover_id: project.handover_id || null,
      tenant_id: project.tenant_id || "tenant_local_tigi",
      organization_id: project.organization_id || "org_local_headquarter",
      case_code: project.case_code,
      twcid_match_id: project.twcid_match_id || null,
      isafe_case_id: project.isafe_case_id || null,
      stage_status: project.stage_status,
      current_stage: project.current_stage,
      isafe_current_stage: project.isafe_current_stage || project.current_stage,
      gate_status: project.gate_status,
      pgp_url: project.pgp_url || null,
      user_email: project.user_email || null,
      service_option: project.service_option || null,
      budget_range: project.budget_range || null,
      square_footage: project.square_footage || null,
      created_at: project.created_at,
      updated_at: project.updated_at,
      trace_id: project.trace_id,
    },
    governance_nodes: buildNodeStatus(project, timeline),
    isafe_monitoring_project: isafeCase
      ? {
          isafe_case_id: isafeCase.isafe_case_id,
          isafe_project_id: isafeCase.isafe_project_id,
          source_project_id: isafeCase.source_project_id,
          source_case_code: isafeCase.source_case_code,
          status: isafeCase.status,
          current_stage: isafeCase.current_stage,
          gate_status: isafeCase.gate_status,
          risk_score: isafeCase.risk_score,
          risk_assessment: isafeCase.risk_assessment,
          contract_version: isafeCase.contract_version || isafeCase.schema_version || ISAFE_CONTRACT_VERSION,
          pgp_url: isafeCase.pgp_url,
          governance_steps: isafeCase.governance_steps,
          evidence_summary: isafeCase.evidence_summary,
          timeline: isafeCase.timeline,
          trace_id: isafeCase.trace_id,
          created_at: isafeCase.created_at,
          updated_at: isafeCase.updated_at,
        }
      : null,
    evidence_summary: buildEvidenceSummary(project, timeline, auditLogs, jobs),
    risk_summary: buildRiskSummary(project, timeline, auditLogs),
    timeline: timeline.map((event) => ({
      at: event.at,
      title: event.title,
      status: event.status,
      actor: event.actor,
      detail: event.detail,
      trace_id: event.trace_id,
    })),
    audit_logs: auditLogs.map((log) => ({
      created_at: log.created_at,
      action: log.action,
      user_id: log.user_id,
      target_type: log.target_type,
      target_id: log.target_id,
      ip: log.ip,
      detail: log.detail,
      trace_id: log.trace_id,
    })),
    jobs: jobs.map((job) => ({
      type: job.type,
      status: job.status,
      detail: job.detail,
      trace_id: job.trace_id,
      created_at: job.created_at,
      updated_at: job.updated_at,
    })),
  };

  passport.integrity = {
    algorithm: "SHA-256",
    canonical_payload_hash: await sha256Hex(stableStringify(passport)),
  };

  return passport;
}

export function governancePassportToMarkdown(passport) {
  const nodeRows = passport.governance_nodes
    .map((node) => `| ${node.code} | ${node.label} | ${node.status} | ${node.evidence_count} |`)
    .join("\n");
  const timelineRows = passport.timeline
    .map((event) => `| ${event.at || "-"} | ${event.status || "-"} | ${event.title || "-"} | ${event.trace_id || "-"} |`)
    .join("\n");
  const auditRows = passport.audit_logs
    .map((log) => `| ${log.created_at || "-"} | ${log.action || "-"} | ${log.user_id || "-"} | ${log.trace_id || "-"} |`)
    .join("\n");

  return `# PGP Governance Passport

## Case Master

- case_code: ${passport.case_master.case_code || "-"}
- project_id: ${passport.case_master.project_id || "-"}
- stylematch_project_id: ${passport.case_master.stylematch_project_id || "-"}
- canonical_project_id: ${passport.case_master.canonical_project_id || "-"}
- journey_id: ${passport.case_master.journey_id || "-"}
- handover_id: ${passport.case_master.handover_id || "-"}
- twcid_match_id: ${passport.case_master.twcid_match_id || "-"}
- isafe_case_id: ${passport.case_master.isafe_case_id || "-"}
- stage_status: ${passport.case_master.stage_status || "-"}
- current_stage: ${passport.case_master.current_stage || "-"}
- gate_status: ${passport.case_master.gate_status || "-"}
- trace_id: ${passport.case_master.trace_id || "-"}

## Reviewer Note

${passport.reviewer_note}

## Governance Nodes

| Node | Label | Status | Evidence |
| --- | --- | --- | --- |
${nodeRows}

## Evidence Summary

- source: ${passport.evidence_summary.source}
- timeline_events: ${passport.evidence_summary.timeline_events}
- audit_logs: ${passport.evidence_summary.audit_logs}
- jobs: ${passport.evidence_summary.jobs}
- project_photos: ${passport.evidence_summary.media_counts.project_photos}
- reference_photos: ${passport.evidence_summary.media_counts.reference_photos}

## iSAFE Monitoring Project

- isafe_project_id: ${passport.isafe_monitoring_project?.isafe_project_id || "-"}
- status: ${passport.isafe_monitoring_project?.status || "-"}
- current_stage: ${passport.isafe_monitoring_project?.current_stage || "-"}
- gate_status: ${passport.isafe_monitoring_project?.gate_status || "-"}
- risk_score: ${passport.isafe_monitoring_project?.risk_score ?? "-"}

## Risk Summary

- model: ${passport.risk_summary.model}
- score: ${passport.risk_summary.score}
- level: ${passport.risk_summary.level}

## Timeline

| Time | Status | Title | Trace |
| --- | --- | --- | --- |
${timelineRows || "| - | - | - | - |"}

## Audit Logs

| Time | Action | User | Trace |
| --- | --- | --- | --- |
${auditRows || "| - | - | - | - |"}

## Integrity

- algorithm: ${passport.integrity.algorithm}
- canonical_payload_hash: ${passport.integrity.canonical_payload_hash}
`;
}

export function downloadTextFile(filename, contents, type = "application/json") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
