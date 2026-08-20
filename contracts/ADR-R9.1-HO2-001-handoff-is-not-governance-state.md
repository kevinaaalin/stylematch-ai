# ADR-R9.1-HO2-001: Handoff V2 is not governance state

Status: Accepted for Candidate Implementation

Date: 2026-08-17

## Decision

Governance Handoff Object V2 is an immutable StyleMatch design-artifact manifest prepared for iSAFE intake. It is not an iSAFE case, Gate decision, governance approval or R5.2 state transition.

The builder accepts approved StructuredSpace and Auto Layout artifacts from the same tenant, organization and StyleMatch project. It verifies current database checksums and approval states before creating the manifest. Referenced artifacts, evidence, assumptions and unresolved risks are included in the manifest checksum.

Repeated requests with the same idempotency key return the existing manifest. Any later design revision requires a new Handoff V2 object.

iSAFE must separately receive and admit the manifest. Only authorized R5.2 Gate evaluation may change formal case state.
