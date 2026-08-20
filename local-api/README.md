# iSAFE R5.2 Local API with R8 StyleMatch AI / iSAFE 2.0 Alignment

## R9 / Patent V7 governance endpoints

The active runtime specification baseline is `20260820_R9_2_Consolidated` and remains Candidate Implementation. The formal state-machine authority remains `20260722_R5_2`; Patent V7 remains locked. The endpoints below create traceable governance records and never directly change `current_stage`, `gate_status`, or the case version.

- `GET /api/v1/isafe/cases/:isafe_case_id/governance/r9`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/risk-states`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/trigger-evaluations`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/external-evaluations`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/decisions`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/audit-outputs`
- `GET /api/v1/isafe/governance/trigger-rules`
- `POST /api/v1/isafe/governance/trigger-rules`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/notifications/:notification_id/acknowledge`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/notifications/:notification_id/escalate`

R9 write endpoints require the existing request context, local authorization token, `headquarter` membership, case authorization, trace ID, consent reference, and idempotency key. Formal state advancement remains available only through the authorized R5.2 Gate evaluation endpoint.

An active trigger rule can supply the evaluation outcome, rule version, and pending action. Every non-`ALLOW` result queues an in-app governance notification with a 24-hour review due time. Acknowledgement and escalation are audited and emitted through the outbox without changing the case stage.

治理／技術母本只採用活動版 `20260820_R9_2_Consolidated`；R8、R9、R9.1 僅供封存查閱並排除於活動 RAG。R9.2 尚非 Final Official，十階段 Gate 仍依 `20260722_R5_2` canonical state contract 執行。

本地治理後端，使用 Node.js 內建 SQLite，資料儲存在 `data/isafe.db`。

文件母本採 `20260723_R6_Independent_RC`；可執行狀態機維持 `20260722_R5_2`。

- `GET /api/health`
- `GET /api/cases`
- `GET /api/v1/isafe/state-machine`
- `POST /api/handoffs/isafe`
- `GET /api/cases/:isafe_case_id`
- `POST /api/cases/:isafe_case_id/gates/transition`
- `POST /api/cases/:isafe_case_id/evidence`
- `POST /api/v1/isafe/cases/:isafe_case_id/governance/start`
- `POST /api/v1/isafe/cases/:isafe_case_id/gates/evaluate`
- `POST /api/v1/isafe/cases/:isafe_case_id/payment-eligibility/evaluate`
- `GET /api/cases/:isafe_case_id/pgp`
- `GET /api/v1/project/:case_code/status`
- `GET /api/v1/isafe/cases/:isafe_case_id/legacy`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/checklist/:item_id/status`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/evidence-files`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/contract-baseline`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/receipts`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/change-orders`
- `POST /api/v1/isafe/cases/:isafe_case_id/legacy/messages`

`POST /api/handoffs/isafe` 以 `case_code` 保證重送冪等，不會建立重複的 iSAFE 專案。

Legacy Functional Parity 工作區承接舊站逐項檢核、文件、合約、付款時點、收據、追加工程與留言；D1-D5、C1-C5 R5.2 狀態契約仍是唯一的 Gate 推進依據。

受保護路由要求 `X-Tenant-Id`、`X-Organization-Id`、`X-Purpose`、`X-Consent-Ref`、`X-Trace-Id`；寫入另要求 `Idempotency-Key`。

合約基線寫入會在 `contract_baseline_versions` 建立不可變版本；`contract_baselines` 僅保留目前值的便利投影。

## StyleTest 結果寄送與行銷同意

- `POST /api/v1/stylematch/style-test-deliveries`：保存姓名、Email、測驗結果、告知版本與兩類同意，並將四張 ComfyUI 圖片以附件寄送。
- `GET /api/v1/stylematch/style-test-leads?marketing=opted_in`：僅列出尚未到期、仍明確同意行銷的名單，限 `headquarter`。
- `POST /api/v1/stylematch/style-test-leads/:lead_id/withdraw-marketing`：撤回行銷同意。
- `POST /api/v1/stylematch/style-test-leads/:lead_id/delete`：刪除名單、寄送紀錄與本機待寄檔。

若未設定 SMTP，結果會保存到 `data/email-outbox` 並回報 `outbox_only`，不會誤報已寄出。將 `StyleMatchAI/config/smtp-config.example` 複製為同目錄的 `smtp-config.local`，填入郵件主機、寄件帳號與應用程式密碼後，再執行 `StyleMatchAI/start-local.ps1` 或根目錄的 `start-local-stack.ps1`。`smtp-config.local` 已由 Git 忽略，不得提交密碼。

## R9.2 production adapters

`GET /api/v1/platform/capabilities` 會回報每項介接的實際模式，不會把尚未設定的外部服務誤報為成功。

- TWCID：離線可執行計分媒合、候選快照 checksum、人工確認與交接收據。外部會員主檔仍需正式 TWCID API 契約與 `TWCID_API_URL`。
- 郵件：有 `SMTP_HOST` 與 `SMTP_FROM` 時真實寄送；否則只進本機待寄匣。
- 付款：有 `STRIPE_SECRET_KEY` 時建立 Stripe Checkout；否則 API 回傳 `requires_configuration`，網站另行標示本機驗收模式。
- 身分：設定 `OIDC_ISSUER` 與 `OIDC_AUDIENCE` 後，驗證 discovery/JWKS、RS256、issuer、audience 與 token 時效；RBAC/ABAC 決策寫入 `authorization_audits`。
- 佇列：`durable_jobs` 提供 lease、retry、completed、dead-letter。本機單節點可用，多節點正式環境仍建議受管佇列。
- 資料庫：本機直接使用 SQLite；PostgreSQL 16 schema 基線位於 `migrations/postgresql/001_production_adapters.sql`，正式部署仍需 PostgreSQL 服務與連線 adapter。
- Connector：Revit、IFC、AutoCAD、Rhino、Blender 共用 `StyleMatch.ExternalExchange/1.0`。本機可建立交換包；除 IFC 外仍需在各原生軟體內完成匯入／匯出驗收。

正式環境變數列於 `.env.production.example`。備份／還原 checksum 驗證工具為 `scripts/backup-restore.mjs`。
