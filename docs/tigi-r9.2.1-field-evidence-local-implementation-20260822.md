# TIGI R9.2.1 Field Evidence Local Implementation

Date: 2026-08-22
Status: Candidate Implementation / Local Validation
Parent: TIGI Engineering Master 20260820_R9_2_Consolidated
State authority: R5.2 unchanged
Patent authority: Patent V7 locked

## Scope completed

- Provider-neutral Evidence Requirement query and Evidence Package intake.
- Manual upload fallback when an external provider is absent or unavailable.
- Immutable local MediaAsset storage with SHA-256.
- Media metadata revisions and human correction trace without replacing the original object.
- Five-dimensional candidate classification: Project, Space, Trade, Stage and Event Type.
- Site, source system/event, uploader, capture/upload time, model version and tool trace provenance.
- Evidence Mapping recommendation with reason, requirement version, media revision and package revision/supersession.
- Human review of Evidence Package; receipt remains transport validation only.
- Candidate construction logs.
- Candidate defect recognition, human NCR confirmation/rejection and CAPA draft/progress.
- CAPA verification requires selected media; authorized closure requires accepted Evidence Packages.
- NCR/CAPA and CAPA transition checksums and trace records.
- Local UI under iSAFE Field Evidence view.

## Phase 0 contract matrix

| Contract | Implementation evidence | Validation |
|---|---|---|
| Evidence Requirement query | evidence_requirements_r921; GET project evidence-requirements | test-field-evidence |
| Provider registration | external_evidence_providers | provider-neutral and missing-provider tests |
| Evidence Package idempotency | unique tenant/idempotency key, canonical package hash | replay and conflict tests |
| Immutable MediaAsset | field_media_assets + local field-media objects | checksum and original_immutable assertions |
| Metadata correction trace | field_media_revisions | revision 1/2 history assertions |
| Source provenance | field_media_provenance_r921 | site/source/model/provenance checksum assertions |
| Evidence Mapping | field-media:map | mapping reason and requirement/media revision assertions |
| Human Review | evidence package review endpoint | accepted/rejected/correction states |
| Tenant isolation | tenant and organization predicates on all reads/writes | cross-tenant empty/404 tests |
| Provider outage fallback | unknown provider fails closed; manual endpoint remains available | provider outage/manual fallback test |
| NCR/CAPA | ncr_candidates_r921, capa_records_r921 | candidate, confirm, progress and forbidden-close tests |
| Authorized CAPA closure | accepted verification Evidence required | early-close rejection and accepted-close tests |
| Governance boundary | forbidden mutation fields and authority boundary | negative R5.2/Gate/payment tests |

## Authority boundary

AI and local rules create candidates, summaries and mapping recommendations only. Candidate Evidence is not accepted Evidence. Receipt is not Gate approval. CAPA workflow does not advance R5.2, approve payment, or produce a Governance Decision Object. Authorized human actions remain explicit and auditable.

## Local endpoints

- GET/POST /api/v1/isafe/projects/{project_id}/field-media
- GET/POST /api/v1/isafe/field-media/{media_id}/corrections
- POST /api/v1/isafe/projects/{project_id}/field-media:map
- GET/POST /api/v1/isafe/projects/{project_id}/construction-logs
- GET/POST /api/v1/isafe/projects/{project_id}/ncr-candidates
- POST /api/v1/isafe/ncr-candidates/{ncr_id}/review
- GET/POST /api/v1/isafe/projects/{project_id}/capa
- POST /api/v1/isafe/capa/{capa_id}
- POST /api/v1/isafe/capa/{capa_id}/close
- GET /api/v1/isafe/capa/{capa_id}/history

## Maturity decision

Local implementation and contract validation may be reported as complete for this 2026-08-22 batch. Production deployment, external identity, production database, remote object storage, mobile capture, production monitoring, disaster recovery and legal/release approval remain external or later-stage work. Final Official remains NO GO.
