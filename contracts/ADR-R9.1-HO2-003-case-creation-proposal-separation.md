# ADR-R9.1-HO2-003: Case creation proposal is not case creation

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

After iSAFE issues a valid Handoff V2 intake receipt, an authorized user may create one idempotent Case Creation Proposal. The proposal gathers the received artifact references, project summary, assumptions and unresolved risks for human review.

Only headquarter authority may decide `approved_for_case_creation` or `rejected`. This decision does not create an iSAFE case, evaluate a Gate or change R5.2 state. Actual case creation remains a separate explicit execution command with its own authorization and audit record.

A review decision requires the current proposal version and records reviewer, rationale, trace and timestamp.
