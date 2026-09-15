# Website proposal delivery — 2026-09-15

Scope: extend existing StyleMatch ProposalReport, not a second AWOS runtime.

## Changes

- Preserve stored proposal_media on repeated project reads. Remove old first-2/first-3 photo truncation. Invalid image URL schemes are filtered; storage quota failure remains explicit, without silently dropping valid images.
- Include every reference, floor-plan and room photo over additional sections. Preserve full image proportions in browser and PDF (including html2canvas object-fit workaround).
- Include adopted designs only from the confirmed set bound to proposal_generation, with same-project revision/URL lineage. A subsequently confirmed set does not replace an earlier proposal's set.
- Display estimate basis/assumptions/contingency, next-step checks and proposal version/source identifiers. Missing images are reported, not fabricated.
- Fixed desktop export layout even on mobile; tall content continues without shrinking the whole section. Line/image break measurement uses the capture document. Add page numbers and margins.
- Missing/unreadable images stop export with visible retryable error. Downloads do not generate images, debit points, mutate project snapshots or create governance approvals.

## Validation

- 19 local validation scripts pass, including media read idempotency, more than four photos, explicit clearing, invalid URL filtering, bound sets and foreign-project denial.
- Chrome headless isolated-storage E2E: 18 images (including cover), long Chinese requirements, historical version selection, mobile width, real PDF download, unchanged 100-point balance/empty ledger, unreadable-image error and cleanup.
- QA PDF: 16 A4 pages, all visually inspected after final renderer change. Fixtures repeat a bundled showcase photo, including in floor-plan slots, strictly to test delivery; they are not a real client's proposal.
- Targeted ESLint, TypeScript and Vite build pass. Existing large proposal bundle warning remains.
- No formal user account, AWOS database, iSAFE state, real client project or provider settings changed.

## Release boundary

Publish through this repository's existing main → GitHub Actions → gh-pages workflow. A successful push alone is not deployment verification; verify generated deployment revision and served asset separately.

This release delivers website content and image-based PDF, not editable Word/PPTX. AWOS Word/PPT staging is separate and has not been exposed through a public/local-only endpoint workaround. Website Word/PPT, shared cloud project storage and authenticated server-side delivery still need integration. Existing website data remains browser-local; opening another origin/device does not automatically carry projects. Images previously erased from persisted data cannot be reconstructed by this patch. No claim that all AWOS MVP or production security acceptance is complete.
