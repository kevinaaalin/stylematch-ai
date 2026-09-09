# TIGI R9.2.1 Field Evidence and Smart Site Supervision Addendum

Candidate Supplemental Specification | 2026-08-21

Parent authority: TIGI Engineering Master `20260820_R9_2_Consolidated`  
State authority: R5.2 State Machine, unchanged  
Patent authority: Patent V7 remains locked  
Status: Candidate Addendum / Pending repository audit and approval

Chinese aliases: 智慧監工助理 SaaS、外部證據提供者、證據需求查詢、證據對應引擎、本地端工程管理 2.0、工程現場影像、施工日誌、缺失改善、人工審查。

## 1. Decision and scope

This addendum records five newly received logical documents covering Construction Site AI Assistant SaaS, External Evidence Provider integration, Evidence Requirement mapping, three-system integration, and a Patent V7.1 strategy memo. It does not replace the four R9.2 technical masters. The canonical reading order remains Engineering Master, SBIR Master, Business Plan Master, and White Paper Master. This addendum is read only after those four sources and must be shown as a candidate supplemental source.

## 2. Product boundaries

### 2.1 Local Project Management 2.0

Local Project Management 2.0 is the Project Execution Management system. It owns WBS, schedule, BOQ, people, vendors, responsibilities, progress, cost and operational project records. It may provide project context but does not produce formal iSAFE governance decisions.

### 2.2 Construction Site AI Assistant SaaS

Construction Site AI Assistant is an independently purchasable Field Data Acquisition and AI automation service. It supports mobile or batch capture, original-file preservation, automatic naming and filing, AI classification, captions, construction logs, candidate defect/event recognition, project-context enrichment and Evidence Mapping. It may run without iSAFE 2.0. Its output is candidate information or an Evidence Package; it is not automatically accepted Governance Evidence and cannot pass a Gate or change formal governance state.

### 2.3 iSAFE 2.0

iSAFE 2.0 remains the third-party Project Governance authority. It owns Evidence requirements, Rule evaluation, Risk, Trigger, Gate, Governance Decision Object, Audit, PGP and the R5.2 State Machine boundary. iSAFE must remain fully usable without subscribing to Construction Site AI Assistant. Authorized users can manually upload Evidence and assign its governance step, type and description.

## 3. Five-dimensional field classification

Candidate field media is classified across Project, Space, Trade, Stage and Event Type. AI classification preserves confidence and model/provenance information. Low-confidence or policy-selected results require Human Review. Human Review is conditional and risk-based; it is not silently inferred from AI completion.

## 4. Evidence Mapping Engine

The Evidence Mapping Engine receives a MediaAsset, preserves the original object and checksum, generates candidate classification and caption, reads Project Context, queries current iSAFE Evidence Requirements, proposes Step and Requirement mappings, and creates a reviewable Evidence Package.

Minimum output includes tenant, project, site, media identity, source system, uploader, capture/upload timestamps, five-dimensional classification, caption, confidence, target Step ID, Requirement ID and version, mapping reason, review status and checksum. An AI mapping is a recommendation. Acceptance requires the authority and workflow defined by iSAFE. Rejected or corrected mappings retain their original value and review trace.

## 5. External Evidence Provider contract

An External Evidence Provider may be a smart-site SaaS, project management system, ERP, IoT platform, inspection system or another authorized provider. iSAFE is provider-neutral and cannot depend on one named vendor.

### 5.1 Evidence Requirement query

The query surface returns Project ID, Governance Profile ID, D1-D5 or C1-C5 Step ID, Requirement ID, Evidence Type, required flag, requirement status and version. Authorization and tenant/project scope are mandatory.

### 5.2 Evidence Submission

An Evidence Package includes tenant/project/site scope, Step ID, Requirement ID, Event ID, Media ID, uploader, timestamps, classifications, original filename, object reference, SHA-256, AI classification, caption, confidence, mapping reason and Human Review status.

Submission is idempotent. Reuse of a key with different content is rejected. Receipt confirms transport and validation only; it does not mean Evidence acceptance, Gate approval, payment eligibility or state transition.

### 5.3 Integrity and provenance

Original media remains immutable. Derived files and corrected metadata require new revisions. Source system, provider identity, source event, model/tool trace, reviewer, timestamps and checksums support end-to-end reconstruction.

## 6. Three-system integration

The integration is loosely coupled through Project ID, Event Model, Evidence Package and Connector APIs:

Local Project Management 2.0 -> project execution context and operational events  
Construction Site AI Assistant -> field capture, automation and candidate Evidence mapping  
iSAFE 2.0 -> requirement, governance evaluation, authorized decision and immutable audit

No system may directly write another system's authoritative state. Connector outages do not disable standalone operation unless an explicitly configured workflow requires that connector.

## 7. Governance invariants

- AI output is not a Governance Decision Object.
- Candidate Evidence is not accepted Evidence.
- Evidence submission receipt is not Gate approval.
- Workflow completion is not an R5.2 transition.
- Gate PASS is not Payment Eligibility, Payment Approval or Payment Execution.
- Every cross-system action is tenant/project scoped, authorized, idempotent and auditable.
- iSAFE remains operational with manual Evidence Capture when external providers are unavailable or not subscribed.

## 8. Patent V7.1 memo handling

The Patent V7.1 Agent-Native Governance memo is preserved as legal-strategy evidence, not promoted into locked Patent V7. Its candidate concepts include Computing Source Entity, Governance Input Data/Object, Source Provenance, Governance Boundary and conditional Human Review. Any patent or claim wording requires patent-agent review. Knowledge results must label this source as pending legal review.

## 9. Minimum implementation contracts

- EvidenceRequirement query schema and endpoint.
- EvidencePackage submission schema and endpoint.
- Provider registration, service identity and authorization policy.
- Immutable MediaAsset and EvidencePackage revision model.
- Idempotency store, checksum verification and intake receipt.
- Human Review state and correction trace.
- Tenant isolation and provider-neutral connector tests.
- Negative tests proving no direct Gate, payment or R5.2 state mutation.
- Offline/manual upload fallback and connector outage tests.

## 10. Acceptance and maturity

This addendum is saved and indexed as a candidate supplemental specification. It becomes an approved R9.2.1 baseline only after repository audit, schema/API/SQL alignment, contract tests, security review, ADR approval, release manifest update and explicit release decision. Production Ready and Final Official remain NO GO.

