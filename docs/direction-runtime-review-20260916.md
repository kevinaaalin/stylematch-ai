# Direction completion follow-up — 2026-09-16

## Implemented and tested

- Fixed the missing `existsSync` import in the derived-direction handoff, found during backend review.
- Real HTTP tests with a disposable SQLite database reject missing review, missing extraction, changed source set, foreign project and foreign tenant. Default zero-photo requests fail closed before provider submission.
- Added an explicitly confirmed zero-photo concept contract, full-mask generation with denoise 1, four-direction extraction, all-inferred provenance and zero known-pixel count. It is experimental and disabled by default.
- Added a read-only capability endpoint `/api/v1/ai/direction-completion/schema`, including the startup source hash and hashed database-path fingerprint, to distinguish edited files from the running deployment. Paths and credentials are not returned.
- Added bounded Windows diagnostics for the runtime directory and allowlisted database settings, plus SQLite integrity/backup tooling.
- Zero through four input projection tests, old four-direction projection tests, Chrome mocked partial/concept flows, 20 local regression scripts, type checking and targeted lint passed. Real-provider testing is separate from these checks.

## Actual provider result: not accepted

One real ComfyUI SDXL run completed in an isolated API/database on port 4298. It produced a 1024×512 image and four extracted views. Visual inspection showed an ordinary perspective image, not a geometrically valid ERP: extracted views bend the window and furniture, and the panorama lacks correct full-sphere coverage. A 2:1 aspect ratio is insufficient.

Evidence: `../analysis_output/direction-real-wzgksL/`, task `aitask_74d104e4-4802-465f-b8b2-b90d4a95b438`. The test resumed the same task after correcting its expected HTTP acceptance status from 201 to 202; no duplicate generation was submitted.

Do not enable `COMFYUI_CONCEPT_PANORAMA_VERIFIED` in deployment for the tested provider. The isolated quality runner enables it only to evaluate a candidate. The website defaults to an explanatory disabled zero-photo action. A suitable panorama generation workflow and real seam/pole/room consistency acceptance are still required. Partial-photo completion also still needs real quality acceptance; projection correctness does not establish inferred scene correctness.

## Runtime deployment: blocked, not complete

Read-only inspection confirmed process 4800 on port 4180 was running this repository's `local-api/server.mjs`, with database `C:\E\codex\stylematch ai\local-api\data\isafe.db`. SQLite quick check returned ok; 23 completed tasks and one queued record were preserved. ComfyUI's actual queue was empty before the isolated quality run.

A consistent backup was created at `C:\E\codex\260828AI\runtime-backups\pre-direction-deploy-1789488063452.db`. The requested shared API restart was rejected by execution policy. No alternative restart mechanism was attempted. The production API has therefore NOT been marked as upgraded. Git publication is not runtime deployment, and does not close this blocker.

## Remaining MVP items in this scope

1. Authorized shared API restart followed by source/storage fingerprint verification and live endpoint checks.
2. Valid panorama-capable zero-photo provider/workflow and actual four-direction/ERP visual acceptance.
3. Real partial-photo completion quality acceptance and complete final stitching review.
4. Wider AWOS MVP items remain outside this bounded room-direction change; this document does not assert all business adapters, governance controls, proposal delivery or cloud integrations are complete.
