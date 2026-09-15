# Local Image Revision Handoff QA

Date: 2026-09-14
Status: Candidate Implementation; not Production Ready.

## Scope

- ProjectRevisionPicker reuses existing reference_revisions without changing approval status.
- ReferenceCanvas and AIGenerate exchange project and revision IDs through router links.
- Missing, incompatible and cross-project source IDs do not produce a handoff URL.
- Invalid incoming sources show an error and do not select another revision.
- No iSAFE authority, billing or generation provider changes in this batch.
- Recent image results launcher is available in all three image tools; newest-first, up to 20 results, with project-scoped revision identities.

## Verification

- Targeted ESLint: passed.
- TypeScript: passed.
- Vite production build: passed; existing ProposalReport 612 kB chunk warning remains.
- validate-workflow-revisions.mjs: passed.
- validate-revision-handoff-browser.mjs: passed with local Edge headless, isolated Pro-plan fixture.
- Browser checks: round trip between tools, missing revision rejected, no page errors, 390px viewport overflow check.
- Recent launcher check: two projects with the same revision ID; selection opens the requested second project within the same tool.
- Branch browser check: creates a candidate with parent and branch IDs, preserves original revisions, and does not debit points.
- Browser tests do not generate images, charge points or modify real user storage.

## Remaining Scope

2026-09-14 additional transaction slice: ReferenceCanvas/FloorPlanVisualizer use a single storage write for image and debit. Unit tests cover retries, conflicts, failed tasks, fallback rejection, insufficient points and invalid image loading. UI handoff/branch regression still passes. These are not real-provider generation or all-writer concurrency E2E tests.

Full provider-generation E2E and production authorization are not validated by these tests. Branch metadata and local ReferenceCanvas branch creation are covered; lineage across all tools remains incomplete. The recent launcher currently lists compatible image revisions, not all asset types.
