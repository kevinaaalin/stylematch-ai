# ADR-R9.1-AL01-001: Deterministic layout validation

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

AL-01 uses deterministic geometry rules as the authority for room containment, furniture collision and door clearance. Generative models or LLM reasoning may propose or rank placements, but cannot suppress a hard violation.

The initial geometry contract uses axis-aligned millimetre rectangles. A room may define `bounds {x,y,width,depth}`. A door/opening may define `clearance {x,y,width,depth}`. Placements use the same coordinate system.

Furniture rotation is evaluated through a deterministic centre-based bounding box. Candidate score is `100 - 30 * hard violations - 5 * warnings`, clamped to zero. Score may rank candidates but never overrides a hard violation.

Layouts derived from a StructuredSpace snapshot that is not approved are always `conceptual=true`. A layout with any hard violation is `invalid` and cannot be approved. Missing bounds, clearance or circulation data produces explicit warnings rather than invented geometry.

AL-01 artifacts do not advance an iSAFE Gate or change R5.2 state.

Approval requires the latest layout revision, zero hard violations and an approved source StructuredSpace. Approval is a StyleMatch design-artifact decision only.
