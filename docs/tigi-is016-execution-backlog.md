# TIGI IS-016 Execution Backlog

Source corpus: `../tigi_engineering_corpus_v1_0/docs/implementation-spec/014_BOOK-2_-_IS-016.md`

Status: executable planning baseline  
Updated: 2026-06-29

## 1. Confirmed IS-016 Scope

IS-016 defines StyleMatch AI as the TIGI AI front office. The identifiable module responsibilities are:

- AI design consultation
- Style analysis and preference learning
- Space understanding
- Requirement collection
- Budget recommendation
- Material recommendation
- Layout recommendation
- AI image generation
- Designer and vendor matching
- Proposal generation
- Knowledge retrieval and AI conversation
- Governance integration into TWCID and iSAFE workflow

The lifecycle is:

```text
Visitor
-> Style Quiz
-> Requirement Collection
-> Space Analysis
-> Style Prediction
-> Image Generation
-> Proposal
-> Designer Matching
-> Project Created
-> iSAFE Governance
```

## 2. Current App Coverage

Current routes in `src/pages.config.js`:

- `Home`
- `StyleTest`
- `Requirements`
- `AIGenerate`
- `AIProposal`
- `MyProjects`
- `PricingPlans`
- `Cases`

Current local runtime:

- `localStore` stores style tests, projects, notifications, audit logs, and jobs.
- Project records already include `project_id`, `case_code`, `twcid_match_id`, `isafe_case_id`, `stage_status`, `timeline`, audit logs, jobs, and trace IDs.
- Build passes with Vite.

## 3. Gap Map

| IS-016 capability | Current state | Execution status |
|---|---|---|
| Style Quiz AI | `StyleTest` exists with 30 reference images and scoring | MVP present |
| Requirement Collection | `Requirements` exists with multi-step intake | MVP present |
| Space Understanding AI | Photo upload exists; no room/object/layout analysis model | Next slice |
| Style Analysis | Quiz scoring exists; no confidence/reason model | Next slice |
| AI Image Generation | `AIGenerate` mock image flow exists | MVP mock present |
| Budget AI | Budget form and estimation UI exist | Needs structured engine |
| Material AI | Not implemented as a separate module | Backlog |
| Designer Match AI | TWCID match status exists; no scoring model | Backlog |
| Vendor Match AI | Not implemented as a separate module | Backlog |
| Proposal AI | `AIProposal` route exists | Needs data-bound proposal output |
| Conversation AI | Not implemented | Backlog |
| Knowledge Graph / RAG | Not implemented | Backlog |
| Governance Integration | `Cases` has TWCID/iSAFE IDs, stages, jobs, audit logs | MVP present |

## 4. Phase 1 Implementation Tasks

1. Normalize IS-016 data fields in a shared schema file.
   - Add canonical fields for project type, space type, floor area, room count, building age, location, budget, completion target, lifestyle, family members, materials, colors, storage, and special requirements.

2. Add a deterministic `StyleAnalysisEngine`.
   - Input: style quiz scores and selected references.
   - Output: primary style, secondary style, style distribution, confidence, and reason.

3. Add a deterministic `BudgetEngine`.
   - Input: floor area, project type, material grade, equipment grade, region.
   - Output: estimated budget, budget range, budget risk, and recommendations.

4. Make `AIProposal` data-bound.
   - Pull latest project from `localStore`.
   - Render project summary, requirements, style analysis, budget, material direction, timeline, and matching status.

5. Extend `Cases` workflow gates.
   - Add explicit gate labels for AI review, proposal ready, TWCID match, iSAFE ready, and closed.
   - Keep timeline and audit log generation for every state change.

## 5. Phase 2 Implementation Tasks

1. Add Space Understanding MVP.
   - Store photo metadata by room.
   - Add manual room type, lighting, storage, window, door, and constraint tags.
   - Generate a simple analysis summary without external AI dependency.

2. Add Material Recommendation MVP.
   - Use project type, style, budget, and space type.
   - Output floor, wall, ceiling, cabinet, lighting, bathroom, kitchen, hardware, furniture, and curtain recommendations.

3. Add Designer Matching MVP.
   - Create local candidate designers.
   - Score by style similarity, budget, location, availability, certification, iSAFE rating, and TWCID level.

4. Add Vendor Matching MVP.
   - Create local vendor categories: contractor, supplier, furniture, smart home, appliance.
   - Score by area, budget, specialty, rating, and capacity.

## 6. Phase 3 Implementation Tasks

1. Add Conversation AI placeholder experience.
   - Use local scripted questions tied to missing requirement fields.
   - Store conversation transcript against project trace ID.

2. Add Knowledge/RAG placeholder.
   - Use curated local documents from `docs/`.
   - Return source-linked recommendations without network dependency.

3. Add exportable PGP/proposal package.
   - Generate project governance package data from project, proposal, audit logs, and timeline.
   - Export as printable HTML first; PDF later if needed.

## 7. Immediate Next Slice

Recommended first code slice:

```text
shared schema
-> StyleAnalysisEngine
-> BudgetEngine
-> data-bound AIProposal
-> build verification
```

This slice is small enough to verify safely and directly improves the current user-visible product flow.
