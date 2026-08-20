# ADR-R9.1-HO2-002: iSAFE intake receipt boundary

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

iSAFE may acknowledge receipt of a valid Governance Handoff Object V2 without creating an iSAFE case or changing governance state. Receipt proves that the immutable manifest checksum was admitted to the intake boundary only.

The receiver verifies tenant, organization, handoff identity, current manifest checksum and status. A handoff has one idempotent receipt. The receipt has its own checksum and records receiver, trace and timestamp.

Every receipt declares `case_created=false`, `gate_decision=false` and `r5_2_state_transition=false`. Formal case creation and R5.2 Gate evaluation remain separate authorized operations.
