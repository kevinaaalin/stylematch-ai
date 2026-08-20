# ADR-R9.1-SS01-001: StructuredSpace authority and parser boundary

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

`StyleMatch.StructuredSpace/1.0` is the canonical spatial object for StyleMatchAI candidate design workflows. Parser adapters may create candidate snapshots only. They cannot approve a snapshot, advance an iSAFE Gate, change an R5.2 case stage, or create a formal governance decision.

The offline fallback parser has a confidence cap of `0.35` and always sets `requires_confirmation=true`. A future Vision provider may return a higher score, but human approval remains mandatory before downstream approved artifacts or Governance Handoff V2 can reference the snapshot.

Every correction creates a new immutable snapshot. Snapshot identity, revision, parent reference, parser metadata, correction references and checksum remain traceable.

## Consequences

- AL-01 consumes an approved StructuredSpace reference or labels output conceptual.
- VE, MVC, MPI and EDT tools must retain the originating snapshot reference.
- Provider output is advisory evidence, not formal iSAFE authority.
- Patent V7 and the R5.2 state contract remain unchanged.
