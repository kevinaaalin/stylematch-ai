# Room direction completion — 2026-09-15

## Requirement and implemented boundary

Each room accepts at most four uploaded photos. Upload count is independent from the four required output directions. The existing one-original/one-reference image workflow remains available.

The panorama page now accepts 1–4 known directions, with explicit shared room/camera-center confirmation. Relative front/right/back/left map to 0/90/180/270 degrees; no geographic north is inferred. Source selection uses the selected project's room photos.

Known photos are projected into a common 2:1 ERP draft with unknown areas masked. The existing ComfyUI masked workflow fills those areas. Postprocessing restores unmasked original pixels and samples four 768×576 references from that same ERP, at a shared 100-degree horizontal field of view. Duplicate output hashes are rejected. Input hashes, direction provenance and inference flags accompany results.

The user loads and reviews these references before the existing four-direction panorama stitching step. For submissions declaring a derived direction task, the backend checks tenant, organization, project, completed extraction, review attestation and exact source correspondence. This is not a Governance Decision or independent approval. Existing manually supplied four-photo workflows remain supported.

## Verification performed

- `node local-api/test-direction-completion.mjs`: 1/2/3/4 source cases; four distinct ordered outputs; known pixel restoration; incomplete legacy, duplicate and empty inputs rejected. Generated pixels are test fixtures.
- `node local-api/test-panorama-projection.mjs`: legacy projection/workflow contract.
- `node scripts/validate-direction-completion-browser.mjs`: Chrome mocked-provider completion, reference loading, review gate and final task provenance.
- `node scripts/validate-space-photos-browser.mjs`: Chrome per-room upload limits and one-to-one photo/result regression.
- `node scripts/validate-local-suite.mjs`: 20 local validation scripts.
- Structured-space, viewset-consistency and visual-editing tests: six tests.
- Type check using `tsc -p jsconfig.json`, targeted lint, production Vite build.

## Not accepted as complete

- Zero-photo concept generation is not implemented by this partial-photo contract; it explicitly requires at least one known direction. Arbitrary photos from different camera centers need a separate reconstruction/registration stage.
- No real ComfyUI completion quality run was performed for this change. Common coordinates and pixel preservation do not prove correct inferred doors, furniture, geometry, pole coverage or seam quality.
- The review checkbox is a user attestation, not automated semantic consistency verification; results explicitly retain `semantic_consistency_verified: false`.
- New backend endpoints require the shared local API to load the revised server. A Git push or a healthy old process alone is not proof of endpoint deployment.
- Each completion task and subsequent stitching task uses the existing 15-point panorama charging path. There is no newly introduced double charge within one task, but the two distinct tasks each cost 15 points.
