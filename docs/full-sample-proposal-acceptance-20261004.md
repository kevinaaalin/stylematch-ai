# Full sample proposal rerun 2026-10-04

## Result

Local generation and draft PDF export passed. This is not formal design approval or full production acceptance.

- Original sample: 42 ping townhouse, 4 bedrooms, living and dining rooms, 3 bathrooms, TWD 2-5 million.
- Final version: SM-SAMPLE-0001-QA-20261004-R4.
- Nine rooms, four unique generated candidates each: 36 included images. Two original preference reference photos are separate and do not count toward the 36.
- Actual provider: local Portable ComfyUI, port 8188, accessed through an isolated test instance of the website API on 4282. Production database and user projects were not changed.
- 41 images generated in total. Five failed visual review (illustration/object collage: qa-r2, qa-r4, qa-r21, qa-r26, qa-r36); originals and rejection records retained. Five replacements are included in the final 36.
- Generated PNGs checked against task output SHA256. No duplicate candidate hashes. Completed rerun generated zero additional images.
- Chrome rendered all 38 document images. Existing website `exportFrozenProposal` produced 47 PDF pages.
- PDF size: 9,898,189 bytes, reduced from 306,697,269 bytes by JPEG page encoding and PDF compression. PDF remains rasterized, not searchable text.
- Poppler rendered all 47 pages. All page contact sheets inspected; text pages 6 and 9 also inspected at full rendered size. No blank image pages or clipped content found.
- 31 local validation scripts, scoped ESLint, TypeScript and Vite build passed. Existing approximately 620.58 kB ProposalReport chunk and stale browser-data warnings remain.

## Repairs discovered during this run

1. Numbered bedroom and bathroom keys now resolve to the correct room labels and English generation subjects.
2. Rejected-image replacement uses the vacant slot and a new idempotency fingerprint, preserving earlier outputs instead of reusing rejected cached results.
3. Photographic single-room prompting excludes collage, object boards and illustration.
4. Removed positional style-material matching that incorrectly suggested pottery for cabinetry. Style materials remain in the concept section; construction-category suggestions use the category-specific material list.
5. Candidate images are labelled as candidates in exported pages, not implied approved assets.
6. Compressed PDF export to a usable file size without losing pages or source images.

## Boundaries and pending acceptance

- Living and dining input photos are the original sample stock photos, not verified site photos. Their original remote URLs remain in project.json; local source copies were used because the API's direct external fetch failed.
- The other seven rooms have no photos; geometry, dimensions, household assignments and actual layout are hypothetical. No kitchen was added to the stated 4-bedroom/2-hall/3-bathroom scope.
- Four images per room are alternative concepts, not registered four-direction views or a verified 360 panorama.
- Images have furniture/fixtures and pass basic room-content review. Lighting, detailed geometry, accessibility, elder safety, construction feasibility and consistency across views are not professionally accepted.
- The frozen reference set is a QA-only draft selection. No owner adoption, approved-asset registration, governance state change, payment or production point deduction was performed.
- This tests live generation, the website proposal modules and Chrome export through a local QA review page. It is not a complete paid-member UI, approval or email-delivery E2E test.
- No Git commit, GitHub push, AWOS change or iSAFE code change was made.

## Files

- `StyleMatch-42ping-Full-Proposal-20261004-R4.pdf`: final sample draft.
- `frozen-proposal.json`: final version-bound document data.
- `project.json`: sample scope, revisions, sources and QA rejection records.
- `review.html`: local draft preview and website PDF exporter.
- `pdf-qa/`: all 47 rendered pages and visual inspection sheets.
- `chrome-export-result.jpg`: successful Chrome export state.
- `frozen-proposal-R2-before-visual-review.json` and `frozen-proposal-R3-before-material-fix.json`: prior QA draft evidence.
