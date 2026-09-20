# Proposal version release acceptance

Release: 20260920-proposal-version-02. Scope: local candidate implementation and static frontend publication, not production acceptance.

Changes: reject duplicate/invalid version creation; resolve historical snapshots only within the owning project; reject ambiguous/missing versions; persist selected version in report URL; list version-specific links on ProjectDetail without fabricating historical data or approval. Existing payment visibility on the detail page is preserved; it is not server-side production authorization.

Before publishing this batch, verified: 25 local scripts, full ESLint, TypeScript, Vite build, 15 API test files (27 tests), iSAFE syntax and four validators. Chrome passed 16 StyleMatch routes plus 16 iSAFE views and seven interaction scripts. Proposal interaction includes detail-to-history navigation, reload preserving v1, historical content, 18 images, PDF download, no debit and image failure recovery. Mobile screenshot inspected. Existing 625.29 kB ProposalReport warning remains.

Runtime source/database/review identity matched; 4173, 4174 and 4180 health returned HTTP 200. Provider-dependent browser tests use mocks; no new real GPU quality acceptance in this batch. No real case payment or governance mutation.

User-specified project 7c14c2aa-9f34-4343-af0d-42146986c3cd was unavailable in the inspected Chrome storage. Its actual content is not accepted or repaired by isolated fixtures. No substitute case or approval was created.

iSAFE has no functional changes in this batch. Its unrelated local corpus changes are excluded. SMTP, public payment/authentication, cloud API/GPU and partial/zero-photo semantic quality remain outside this static frontend release.
