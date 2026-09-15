# Space photo reference mapping

User clarification 2026-09-15: detailed requirements already classify uploads by room (living, dining, study, kitchen, etc.). Each room may upload at most four photos. Each source photo needs its own corresponding generated reference, not a pooled room-level image. This clarification supersedes interpreting the historical nine-photo wording as a fixed whole-project upload requirement.

Implementation:
- Upload selection/drop checks total before reading files and again before state update; concurrent handlers are locked. Room switching/deletion is disabled during upload. Full rooms disable browse; deletion restores capacity. Original images are not logged to console.
- Project creation checks the same four-photo rule. Existing historical projects are not truncated during read. Floor plans remain separate configuration inputs, not room perspective-photo counts.
- AIGenerate lists each room source with its generated revisions. Selecting one source submits only that image through existing ComfyUI image-task/img2img route; it does not silently pick an unrelated reference/library image for the paired request. Fix study_room mapping.
- Existing operation/revision fields retain source_image_url plus source_photo_room/source_photo_number. Saving rejects a source not present in that project's room. Results stay candidate; generation does not approve them.
- Execution is one selected photo per explicit generation action, using existing billing. This is not an automatic paid batch submission feature.

Validation:
- Pure contract checks: four accepted/five rejected per room; floor plans separate; source/result mapping; wrong-room denial.
- Chrome isolated browser: four living + four dining photos; fifth denied; deleting allows retry; two different originals result in separate requests with exactly one source each; two candidate results saved with their corresponding source; existing ten-point cost per successful result, no duplicate debit. Provider responses mocked, not real GPU semantic-quality acceptance.
- Full local suite, targeted ESLint, TypeScript, production build.

No API service change/restart, account change, image generation against a paid provider or real user project was performed during QA. Public GitHub Pages publishing does not make localhost ComfyUI accessible from other devices.
