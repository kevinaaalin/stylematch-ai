# StyleMatchAI Local SQLite Layer

This local layer keeps the current browser-first StyleMatchAI MVP intact while
adding durable SQLite tables for governance-oriented records.

Database:

```text
local-api/data/isafe.db
```

## Tables

- `stylematch_projects`
- `stylematch_style_tests`
- `stylematch_knowledge_queries`
- `stylematch_risk_assessments`
- `stylematch_gate_events`
- `stylematch_pgp_packages`

## Endpoints

Use the same local API headers as the iSAFE API.

```http
GET  /api/v1/stylematch/schema
GET  /api/v1/stylematch/projects
POST /api/v1/stylematch/local-store/sync
POST /api/v1/stylematch/knowledge-queries
POST /api/v1/stylematch/risk-assessments
POST /api/v1/stylematch/gate-events
POST /api/v1/stylematch/projects/{project_id_or_case_code}/pgp
```

## LocalStore Sync Payload

`POST /api/v1/stylematch/local-store/sync` accepts the existing
`localStore.exportData()` shape:

```json
{
  "format": "stylematch-local-mvp-export",
  "exported_at": "2026-08-13T00:00:00.000Z",
  "origin": "http://127.0.0.1:4173",
  "database": {
    "projects": [],
    "styleTests": []
  }
}
```

This creates or updates project/style-test mirror rows only. The browser app can
continue using `localStorage` until the frontend is ready to post exports.

## Governance Placeholder Flow

```text
StyleMatch localStorage
-> /stylematch/local-store/sync
-> /stylematch/knowledge-queries
-> /stylematch/risk-assessments
-> /stylematch/gate-events
-> /stylematch/projects/{case_code}/pgp
```

This is intentionally a local durable bridge, not the final production backend.
