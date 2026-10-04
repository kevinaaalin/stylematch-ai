# Frozen proposal export acceptance

Status: Local export acceptance passed. Candidate implementation, not full W-06 or StyleMix acceptance.

## Implemented

- The selected immutable proposal document feeds DOCX, PPTX and PDF through one shared page model.
- Version ID and DRAFT status appear in each format. Downloads do not generate images or debit points.
- DOCX and PPTX contain editable text. PDF uses rendered page images and is not a selectable-text PDF.
- Image retrieval errors stop delivery. Images are normalized to PNG and fitted without changing aspect ratio.
- Missing or foreign version IDs are rejected. Legacy snapshots without a frozen document must be regenerated.
- Export libraries are loaded on demand. All exports execute in the browser; no AWOS service is required.

## Verification

- Chrome isolated fixture: DOCX, PPTX and PDF downloads succeeded; blocked-image request rejected without a download.
- Latest fixture: 10 pages in Word/PDF, 10 slides in PowerPoint; version and content markers verified in OOXML.
- LibreOffice rendered Word and PowerPoint to PDF. All pages were rendered to PNG and inspected via contact sheets: Chinese glyphs and image aspect ratio present, no observed clipping or overlap.
- Shared page-model tests cover long text, immutable input and missing image sources.
- 19 workflow scripts and 10 core scripts pass after updating legacy fixtures to the stricter image-lineage contract.
- Outputs and visual QA reside in `analysis_output/proposal-office-qa` (test data only).

## Limits

- This verifies the export segment, not image-generation quality or all proposal content requirements.
- Full image A/B semantic DNA extraction and conditioning calibration remain unfinished.
- Formal backend proposal approval, complete material-source/version mapping and a live generation-to-export acceptance run remain outstanding.
- Client-side local plan checks and localStorage are not production authorization or a durable production database.
- Dependency audit still reports other vulnerabilities. No blanket or forced dependency upgrade was performed. The newly selected PPTX version is not reported by the latest audit; compatible jsPDF update removed its critical report. This is not a security certification.
- No GitHub publication performed in this batch.

## Live candidate integration follow-up

- Chrome successfully executed catalog-based StyleMix generation through the local ComfyUI API, persisted v1, and charged five points once.
- The same isolated QA project registered the generated asset, exercised the approval control, confirmed a reference set, generated a frozen draft (30 points), and downloaded all three formats.
- The image-read failure was caused by direct image tags lacking required request-context headers. The client now fetches task images with context; the server also explicitly checks task ownership for image reads.
- StyleMix and ReferenceCanvas preserve an authenticated original-image URL and task ID, while storing a JPEG display derivative (maximum dimension 1280, quality 0.86) to reduce localStorage duplication. Other image workflows do not opt into this resizing. This is not lossless archival; original files remain with the local provider.
- Live evidence: `analysis_output/stylemix-live-qa/acceptance.json`, screenshot, generated-image task metadata and DOCX/PPTX/PDF outputs. QA projects are explicitly named `stylemix-qa-*`; no existing user's project was modified.
- The live test does not establish arbitrary-image DNA extraction, calibrated A/B image conditioning, full professional proposal completeness, or final backend proposal approval.
- Live image-access regression passed: authorized bytes returned; missing context and foreign tenant rejected. Task lookup now includes both tenant and organization. This remains the existing local-development identity model, not proof of production authentication.

## Image-source follow-up

- Added an offline CLIP closed-vocabulary analyzer for 15 visual dimensions. This is candidate classification, not unrestricted semantic image understanding or calibrated confidence.
- The local API runs the existing installed model without downloads, caps input size and execution time, and rejects concurrent analysis. Source SHA256, model identity/revision, original candidates, edits and confirmation are retained in the saved revision.
- Chrome exercised two real JPEG uploads, analysis of both sources, rejection before human confirmation, confirmation, ComfyUI generation, asset registration/approval, draft snapshot and DOCX/PPTX/PDF downloads.
- Global and per-dimension ratios affect the text prompt only. Numeric image-conditioning calibration is still outstanding.
- Visual inspection found that the initial prompt omitted the selected room purpose. The prompt now includes the room/object, with a living-room-specific instruction excluding beds. Generation remains subject to human quality review.
- Full W-06 eight-group completeness, sourced materials/pricing and formal backend proposal approval are NOT established by this candidate-path test. Do not report the two complete workflows as fully accepted.
