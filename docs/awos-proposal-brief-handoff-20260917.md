# StyleMatch website proposal brief handoff

Date: 2026-09-17. Scope: local, user-mediated brief transfer, not a complete image-bearing Word/PPT export integration.

The selected ProposalReport version can export `stylematch-awos-proposal-brief.json`. It carries only the allowlisted brief fields, original website project/version references and a SHA256 of the normalized payload. Existing frozen snapshots remain unchanged. Current data is labelled `current-unfrozen`. The exporter omits contact email, birth-date fields, image URLs/bytes, cached analysis and other project fields. Free-text requirements may still contain user-entered personal data; this is not automatic content redaction.

The shared serializer/validator is `src/lib/awosProposalBrief.js`. The source reference and checksum are user-supplied integrity information, not authenticated source identity, signatures or approvals. No URL fetching, cross-origin runtime call or cloud upload occurs.

AWOS imports the file into its existing `TIGI-AWOS` scope and an explicitly entered existing Workflow. It creates a DRAFT task via the existing session-protected task endpoint, with L2 / human_gate. The source project ID does not become the destination project ID. Existing independent Registry / plan / execution controls still apply. Backend validation rejects corrupted input before task creation and rechecks source-to-task brief equality before Provider execution. W-06 records `website_source` in the Candidate content, which remains available in the source payload of its existing delivery bundle.

This is brief-based concept regeneration, not a byte-for-byte rendering of the original website proposal. It does not import pictures or reproduce a historical report's exact text. Full website Word/PPT image integration, authorized attachment rendering and panorama quality remain separate work.

Validation uses isolated identities/databases and covers field exclusion, checksum tampering, changed source versions, task brief substitution, duplicate provenance, destination binding, unauthenticated/cross-origin rejection and no automatic approval/Grant. The existing Registry-to-execution test now includes a real exported website envelope. Local website validation passed 23/23; build, TypeScript and targeted lint passed. Chrome exported and validated a real 718-byte sample file. AWOS was redeployed with a database backup/rehearsal, but its browser session had expired: production import-preview/submission UI acceptance remains pending login, not passed. Deployment evidence is recorded in the AWOS companion document.
