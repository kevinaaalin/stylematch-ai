# StyleMatch AI v8.1.0 Alignment Note

## Status

StyleMatch AI v8.1.0 is aligned with the 2026-08-14 TIGI Engineering Master R9 and Patent V7 governance baseline. This is a product and website alignment note, not a promotion of StyleMatch AI to a governance-core release.

## Product boundary

StyleMatch AI owns the user-facing product workflow: Style DNA, requirements, floorplan and vision inputs, image workflows, structured proposal inputs, budget and material information, approved assets, and handoff objects.

It may consume governance context as a read-only reference and submit a governed handoff. It must not operate an iSAFE Gate, create a formal governance decision, issue a formal state transition, or become the official audit source.

## Agent boundary

The paired StyleMatch AI Agent Platform R3.2 may retrieve trusted knowledge, evaluate permitted rules, query risk, trigger, audit, and external-evaluation context, call approved tools, and produce a handoff object. Formal governance effects remain outside the Agent Platform.

## Formal governance boundary

iSAFE 2.0 Governance R9 is the only formal governance decision and write domain. The R5.2 Governance State Machine remains the state authority. Product and Agent integrations must preserve this separation.

## Canonical source package

The verified source package and machine-readable contract are maintained at:

- `../tigi_latest/releases/20260814_R9_Patent_V7/`
- `../contracts/tigi-r9-patent-v7-alignment.json`

Final official deployment remains blocked until the release requirements recorded in the R9 / Patent V7 baseline are satisfied.
