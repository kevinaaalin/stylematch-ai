# Cultural preference candidate implementation

Policy: cultural-preference-20260926-v1.

The shared evaluator accepts verified, consented input only. Bazi is capped at
0.15, zodiac at 0.10. Missing or invalid inputs contribute zero; unused share
returns to the baseline. Confidence is an eligibility check, not an invented
confidence-to-weight formula. Source references are required. No birth-date
inference or unknown-zodiac default style remains.

Over 0.15 total, uncertain birth time, school conflict or changed top-two
ranking produces WAITING_APPROVAL. Candidate and baseline are retained;
blocked candidate weights are not applied. No client approval flag bypasses
this gate. Existing analysis snapshots are not silently migrated.

Implemented: evaluator, style engine integration, schema, proposal context
guard, focused tests. This is NOT end-to-end acceptance or deployment.

Remaining: authenticated server-side verification records, scope-bound human
approval, input/review UI, explicit re-analysis migration, all proposal entry
points, shared independent S-04 integration and browser E2E. Client-provided
verified fields are not trusted server evidence. Current evaluator is a local
candidate; do not publish it as a completed approval system.
