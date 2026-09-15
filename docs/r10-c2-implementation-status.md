# R10-C2 Local Implementation Status

Updated: 2026-09-15
Overall: IN PROGRESS / Candidate Implementation. Not all functionality is complete.

Latest inventory: [local/external requirements](local-external-requirements-20260915.md). On 2026-09-15 the unified 17-script local suite, three Edge browser scripts and TypeScript passed after restarting all four services. The earlier AIGenerate upfront-debit gap below was subsequently fixed: completion persistence now gates local debit. All-writer concurrency remains pending.

Source: workspace R10-C2 four-master DIFFERENCE_REPORT.md. The older IS-016 backlog is historical, not a current completion inventory.

## 2026-09-15 Additional Verification

- Fixed long-paragraph truncation in the corpus builder; code-point-safe chunks preserve the entire section body. Rebuilt both websites' existing R9.2/candidate corpus: 5 documents, 441 chunks. This is not an R10-C2 corpus migration.
- Workspace rejects missing project IDs with disabled tool buttons (not disabled-looking anchors); same-route project query changes reload the selected context, and URL IDs are encoded.
- 18 local validation scripts, 3 Edge browser scripts (including invalid Workspace and same-route recovery), targeted ESLint, TypeScript and Vite build passed. ProposalReport remains 613.20 kB.
- iSAFE operational responsibilities, Field Evidence UI and case-first workbench contract scripts passed; these are not full browser E2E.
- Changes remain uncommitted. StyleMix, full asset editors, all-writer concurrency and R10-C2 corpus integration remain open, not external-resource blockers.

## Verified Slices

- Saved project floor-plan selection and project-switch cleanup.
- Shared image revision picker in ReferenceCanvas and AIGenerate.
- Project-scoped cross-tool URLs and invalid-source rejection.
- Recent image revisions launcher in three tools (20 results).
- ReferenceCanvas parent/derived/branch metadata; additive storage fields, no overwrite of old revisions.
- Explicit local branch creation; candidate status; no points consumed.
- Seven existing regression scripts passed, targeted ESLint, TypeScript and Vite build passed.
- Edge isolated-fixture test passed: handoff round trip, second project with same revision ID, invalid source, mobile width, branch persistence and original-version preservation.

## Local Work Still Required

1. ReferenceCanvas and FloorPlanVisualizer now commit image revision and local debit in one storage write with task-based idempotency and a Web Lock. Structural transaction and image-load failure tests pass. Real provider E2E, all-writer multi-tab concurrency, semantic Checker and production transactions remain unverified; AIGenerate's backend billing is separate.
2. Standalone tool drafts now reuse project records without full intake, matching jobs or iSAFE creation. Isolated browser test passed for ReferenceCanvas draft creation. Three tools share the entry component.
3. Nine canonical asset types now have an explicit compatibility guard; archived/unknown types are rejected and explicit types override legacy image-role inference. Current image tools accept image/sketch, floor-plan tool accepts floor_plan. Non-image asset importer/editor coverage beyond the existing budget/proposal editors is not implied.
4. Parent lineage is now recorded for ReferenceCanvas edits, AIGenerate selected-version generation, and FloorPlanVisualizer derived images when a same-project source revision exists. Raw uploads remain roots with source URLs; historical lineage is not fabricated. New proposal generations save V1/V2 project snapshots with parent IDs. Minimum Proposal Context checks and browser missing-context/no-debit flow pass.
5. Commercial budget editor now exists in Workspace: quantity-times-price, room/category/material fields, immutable saved scenarios and parent versions. Three arithmetic fixtures and browser V1/V2 persistence pass. It is separate from consumer estimation and does not affect iSAFE payments. Catalog pricing integration and complete proposal-context rules remain pending.
6. Sketch, StyleMix, comparison and wider workspace requirements require an implementation audit; do not infer completion from existing routes.
7. Local ComfyUI text-to-image E2E passed on 2026-09-14 (task aitask_ff7a28df-b9e4-476d-b6a7-0a3cec210fad, seed 20260810, technical QA passed, human review required). Frontend now supports nested local_image.status health. Cached task project ownership is checked before restoration and saving. This does not certify panorama, img2img, paid retry/concurrency or full visual QA.

## External Acceptance

Additional 2026-09-14 local evidence: img2img E2E task aitask_7b0687cf-9f88-48eb-87d1-f5fd068eacad completed with technical QA passed, using the existing living-room-before fixture. Four-direction panorama projection and dedicated ComfyUI workflow-contract tests passed. Real four-direction seam/polar/architecture visual acceptance is not complete.

Latest checks: AIGenerate now defers debit until completed result persistence; mock-provider browser test passes failed/no-debit and completed/debit with source lineage. Existing homepage panorama renders and responds to dragging at desktop/mobile widths; screenshots are in workspace analysis_output/panorama-browser-20260914. These screenshots do not certify four-photo reconstruction quality. A same-room front/right/back/left source folder has been requested for final visual acceptance.

SMTP delivery, real payment callbacks, production identity/authorization, database/queue deployment, TWCID live matching and CAD/BIM connectors require their own environments and acceptance. Local tests do not establish Production Ready status.
