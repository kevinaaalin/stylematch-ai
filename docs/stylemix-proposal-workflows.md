# StyleMix and Proposal Workflows

Status: Candidate Implementation. Not end-to-end accepted.

## Independent execution

Run from the StyleMatchAI directory:

```sh
node scripts/run-design-workflow.mjs stylemix input.json fusion.json
node scripts/run-design-workflow.mjs proposal project.json proposal.json
node scripts/validate-stylemix-workflow.mjs
```

Output uses exclusive creation; existing versions are never overwritten.
Neither workflow changes iSAFE state or creates another database.

StyleMix input example (manually confirmed visual observations, not automated extraction):

```json
{
  "a": {"id":"source-a","source_ref":"asset:a","dimensions":{"color":{"value":"ivory","confidence":0.9}}},
  "b": {"id":"source-b","source_ref":"asset:b","dimensions":{"color":{"value":"black","confidence":0.8}}},
  "globalWeight":0.7,
  "dimensionWeights":{"color":0.8},
  "target":"furniture"
}
```

Proposal input requires `version_id` and `project` with `id` or `project_id`.
Optional `parent_version_id` selects a uniquely resolved same-project parent
from the supplied project history. Missing, ambiguous, foreign-project and
empty parent references are rejected; omitting it uses the newest listed version.
Existing history cannot be detached by supplying null. Branching from an older
version preserves the history and increments the revision number.
The output retains the input snapshot and the existing proposal builder's
content. It does not approve or publish the proposal. This is local snapshot
validation, not server-side authorization or proof of persisted history integrity.

## Remaining acceptance gates

- Image-to-Universal-Visual-DNA extraction and source ownership validation.
- Persistent tenant-scoped revisions and verified parent lineage.
- ComfyUI target workflows with pinned models and node manifests.
- Conditioning calibration: textual shares are not measured image weights.
- Actual generated images, quality review and failure/retry handling.
- Commercial-tools StyleMix page and complete proposal workflow UI.
- Complete report export and Chrome end-to-end acceptance.

The current CLI is a draft pipeline, not a complete image generation workflow.
Existing 30-style classification is not Universal Visual DNA extraction.

## 2026-10-04 per-space reference completion

ReferenceCanvas now automatically fills missing candidate images before proposal
generation. An explicit completion button is also available before confirming a
reference set. Each registered non-floor-plan room targets four distinct generated
images; zero-photo rooms produce labeled hypothetical concepts. Original uploads
do not count as generated results. Room registration is required: room count is
not inferred from an ambiguous free-text floor plan.

Completion uses the existing ComfyUI API and local image transaction, five local
plan points per successfully saved image. Up-front balance check, sequential
generation, project-scoped browser lock, stable request keys and per-task save
keys protect retries. A failed batch retains saved images. Candidates are not
automatically approved; all rooms must have four selected generated references
and matching human-approved assets before proposal generation proceeds.

Files: src/lib/proposalImageCompletion.js,
scripts/validate-proposal-image-completion.mjs,
local-api/test-proposal-completion-live.mjs.

Verification: 31 local validation scripts and Vite build passed; ESLint and
TypeScript passed during this batch. The isolated real ComfyUI test produced four
distinct SHA256 outputs for a room with zero input photos; retry submitted zero
new tasks. Evidence: analysis_output/proposal-completion-live/fill-1791110601535.json
and matching -0.png through -3.png. All four were visually inspected as furnished
living-room candidates. An earlier run produced an incorrect bedroom candidate;
explicit English room/furniture wording and a bedroom negative prompt corrected
the repeated test. Earlier evidence is retained, not counted as passing quality.

Limits: live test persists a fixture to disk with an isolated temporary API DB,
not to the user's Chrome project. Browser save/approval/export end-to-end remains
unverified for this addition. Tests cover multi-room partial failure/resume and
invalid result filtering; real multi-room/partial-photo visual acceptance remains.
Distinct hashes do not prove meaningful design diversity, shared geometry or
360-degree quality. No production acceptance or automatic human approval claimed.
