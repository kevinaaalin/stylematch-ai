const ISAFE_API_ORIGIN = import.meta.env.VITE_ISAFE_API_ORIGIN || "http://127.0.0.1:4180";
const R5_CONTEXT = {
  tenantId: import.meta.env.VITE_TIGI_TENANT_ID || "tenant_local_tigi",
  organizationId: import.meta.env.VITE_TIGI_ORGANIZATION_ID || "org_local_headquarter",
  token: import.meta.env.VITE_ISAFE_LOCAL_TOKEN || "local-dev-headquarter",
};

async function request(path, options = {}) {
  const response = await fetch(`${ISAFE_API_ORIGIN}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${R5_CONTEXT.token}`,
      "X-Tenant-Id": R5_CONTEXT.tenantId,
      "X-Organization-Id": R5_CONTEXT.organizationId,
      "X-Purpose": "isafe_governance_handover",
      "X-Consent-Ref": "consent_local_trial",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || `iSAFE API request failed (${response.status})`);
  }
  return payload;
}

export function createIsafeHandoff(project, auditLogs = []) {
  const stylematchProjectId = project.stylematch_project_id || project.project_id;
  return request("/api/v1/handovers", {
    method: "POST",
    headers: {
      "X-Trace-Id": project.trace_id || `tr_${crypto.randomUUID()}`,
      "Idempotency-Key": `stylematch-isafe-${project.case_code}`,
    },
    body: JSON.stringify({
      event_type: "ProjectHandoverApproved",
      correlation_id: project.correlation_id || project.trace_id,
      project: {
        ...project,
        stylematch_project_id: stylematchProjectId,
        project_id: undefined,
      },
      audit_logs: auditLogs,
    }),
  });
}

export function createDirectIsafeIntake(data) {
  const requestId = crypto.randomUUID();
  return request("/api/v1/isafe/direct-intakes", {
    method: "POST",
    headers: {
      "X-Trace-Id": `tr_${requestId}`,
      "Idempotency-Key": `isafe-direct-${requestId}`,
      "X-Purpose": "isafe_direct_intake",
    },
    body: JSON.stringify({
      ...data,
      intake_channel: "isafe_direct",
      correlation_id: `corr_${requestId}`,
    }),
  });
}

export function listIsafeCases() {
  return request("/api/v1/isafe/cases");
}

export function getIsafeHealth() {
  return request("/api/v1/health");
}

export { ISAFE_API_ORIGIN };
