import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const port = 4286;
const origin = `http://127.0.0.1:${port}`;
const temp = mkdtempSync(join(tmpdir(), "isafe-field-evidence-"));
const child = spawn(process.execPath, ["server.mjs"], { cwd: new URL(".", import.meta.url), env: { ...process.env, ISAFE_API_PORT: String(port), ISAFE_DB_PATH: join(temp, "test.db") }, stdio: "ignore" });
const headers = { "Content-Type": "application/json", Authorization: "Bearer local-dev-headquarter", "X-Tenant-Id": "tenant_local_tigi", "X-Organization-Id": "org_local_headquarter", "X-User-Id": "qa-field", "X-Member-Tier": "headquarter", "X-Case-Role": "reviewer", "X-Server-Role": "headquarter", "X-Case-Authorization": "*", "X-Purpose": "field_evidence_test", "X-Consent-Ref": "consent_test", "X-Trace-Id": "trace-field-evidence" };
async function waitForServer() { for (let i=0;i<40;i+=1) { try { if ((await fetch(`${origin}/api/v1/health`)).ok) return; } catch {} await new Promise((r)=>setTimeout(r,100)); } throw new Error("server unavailable"); }
async function call(method, path, body, key) { const response=await fetch(`${origin}${path}`,{method,headers:{...headers,...(key?{"Idempotency-Key":key}:{})},body:body===undefined?undefined:JSON.stringify(body)}); return {response,data:await response.json()}; }

test("R9.2.1 Field Evidence supports provider-neutral intake without governance side effects", async () => {
  await waitForServer();
  const intake=await call("POST","/api/v1/isafe/direct-intakes",{title:"Field evidence case",applicant_name:"QA",contact:"qa@example.test"},"field-intake");
  assert.equal(intake.response.status,201);
  const started=await call("POST",`/api/v1/isafe/cases/${intake.data.case.isafe_case_id}/governance/start`,{expected_version:intake.data.case.version,actor:"QA",actor_role:"headquarter"},"field-start");
  assert.equal(started.response.status,200);
  const caseId=started.data.case.isafe_case_id; const caseVersion=started.data.case.version; const projectId="project-field-001";

  const provider=await call("POST","/api/v1/isafe/external-evidence-providers",{provider_id:"provider-smart-site",name:"Smart Site QA",provider_type:"smart_site_saas"},"provider-create");
  assert.equal(provider.response.status,201);
  const requirement=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-requirements`,{requirement_id:"REQ-D1-PHOTO",step_id:"D1_design_preparation",evidence_type:"site_photo",required_flag:true,requirement_version:"R9.2.1-1"},"requirement-create");
  assert.equal(requirement.response.status,201);

  const payload={provider_id:"provider-smart-site",requirement_id:"REQ-D1-PHOTO",step_id:"D1_design_preparation",evidence_type:"site_photo",media_id:"media-001",object_ref:"local://field/media-001.jpg",content:"verified-photo-content",isafe_case_id:caseId,classification:{project:projectId,space:"客廳",trade:"木作",stage:"施工中",event_type:"查驗"},caption:"木作施工查驗",confidence:0.91};
  const submitted=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages`,payload,"package-submit");
  assert.equal(submitted.response.status,201,JSON.stringify(submitted.data));
  assert.equal(submitted.data.package.status,"pending_review");
  assert.equal(submitted.data.receipt.authority_boundary.state_transition_applied,false);
  const replay=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages`,payload,"package-submit");
  assert.equal(replay.response.status,200); assert.equal(replay.data.idempotent_replay,true);
  const conflict=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages`,{...payload,caption:"different"},"package-submit");
  assert.equal(conflict.response.status,409); assert.equal(conflict.data.code,"IDEMPOTENCY_CONFLICT");
  const forbidden=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages`,{...payload,media_id:"media-002",governance_state:"CLOSED"},"package-forbidden");
  assert.equal(forbidden.response.status,403); assert.equal(forbidden.data.code,"EXTERNAL_EVIDENCE_AUTHORITY_VIOLATION");
  const reviewed=await call("POST",`/api/v1/isafe/evidence-packages/${submitted.data.package.package_id}/review`,{decision:"accepted",reason:"Human verified source and mapping"},"package-review");
  assert.equal(reviewed.response.status,200); assert.equal(reviewed.data.package.status,"accepted"); assert.equal(reviewed.data.package.authority_boundary.gate_decision_applied,false);

  const unavailable=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages`,{...payload,provider_id:"provider-offline",media_id:"offline-external",object_ref:"local://offline/external.jpg"},"provider-offline"); assert.equal(unavailable.response.status,404); assert.equal(unavailable.data.code,"PROVIDER_NOT_FOUND");  const manual=await call("POST",`/api/v1/isafe/projects/${projectId}/evidence-packages/manual`,{...payload,provider_id:undefined,media_id:"manual-001",object_ref:"local://manual/manual-001.jpg",content:"manual-photo"},"manual-package");
  assert.equal(manual.response.status,201); assert.equal(manual.data.package.provider_id,"manual_upload");
  const current=await call("GET",`/api/v1/isafe/cases/${caseId}`);
  assert.equal(current.response.status,200); assert.equal(current.data.case.version,caseVersion); assert.equal(current.data.case.current_stage,"D1_design_preparation");
});

test.after(async()=>{child.kill();await new Promise((r)=>child.once("exit",r));rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:100});});


