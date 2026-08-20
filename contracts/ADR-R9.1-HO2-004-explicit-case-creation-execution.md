# ADR-R9.1-HO2-004: Explicit case creation execution

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

Actual iSAFE case creation is a separate headquarter-only command after a received Handoff V2 and an `approved_for_case_creation` proposal. The command requires the current proposal version, an idempotency key and the exact confirmation `CREATE_ISAFE_CASE`.

Execution creates one case in `INTAKE_pending` with `gate_status=intake_pending`. It records source manifest, receipt, proposal and artifact references as intake evidence. It does not perform a Gate decision, advance to D1 or change any existing R5.2 case state.

The execution receipt is immutable and idempotent. Starting governance remains the existing separately authorized R5.2 operation.
