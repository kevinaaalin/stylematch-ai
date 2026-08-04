# TIGI Official Edition 20260714 R4 Consolidated

R2 完整母本與 R3 修正補充之單一整合正式版

- 版本：`20260714_R4`
- 版本型態：Consolidated Master Edition
- 整合來源：`20260713_R2` 完整母本 + `20260714_R3` 修正補充
- 適用對象：經營決策、產品規劃、工程實作、SBIR 送件、合作夥伴與企業客戶
- 文件原則：R3 的新決策優先；R2 未被修正的治理基線完整保留

## 1. 執行摘要

TIGI 的正確整合方式是「共同基礎、產品分立、資料互通」。StyleMatch AI、TWCID.net 與 iSAFE 2.0 不合併成單一網站，而是透過 TIGI Platform Core 共用租戶、身分、權限、案件識別、稽核、計費、API 與事件契約。

StyleMatch AI 與 iSAFE 2.0 均可獨立作為企業 SaaS 銷售，也能組合為從需求理解、媒合、成交到工程治理的完整服務。TWCID.net 保留為產業品牌、會員、認證、媒合、邀標、評價與 marketplace 主體。DEOS 則是治理工作流成熟後向估價、採購、發包、派工、成本與財務逐步延伸的 Project OS，不是 Phase 1 一次完成的大型 ERP。

核心產品演進路線為：

`AI Assist → Governance Workflow → Project OS → DEOS`

本 R4 將 R2 的 S1/D1～S10/C5、TIGI-GS-01～30、iSAFE-DGM-01～24、411 個 DGI 與 Gate / Payment Eligibility 基線，和 R3 的平台邊界、AI Agent API、Trace、OAuth Scope、Handover 與 Guardrail 合併為可直接採用的單一決策基線。

## 2. R4 版本決策

| 項目 | R4 統一決策 | 來源 |
|---|---|---|
| TIGI | 治理標準、資料契約、工程文件與平台治理母體 | R3 修正 R2 表述 |
| StyleMatch AI | AI Agent 能力平台與 API / SDK Provider | R3 優先 |
| TWCID.net | 會員、內容、媒合、邀標、招標、評價、認證與 marketplace | R3 優先 |
| iSAFE 2.0 | 第一個 Governance Engine Implementation | R3 優先 |
| DEOS | iSAFE 成熟後延伸之 Project OS，不是 Phase 1 ERP | R3 新增 |
| 治理基線 | S1/D1～S10/C5、GS-01～30、DGM-01～24、411 DGI | R2 保留 |
| Gate | 通過只產生 Payment Eligibility，不會自動付款 | R2、R3 一致 |
| AI 高影響結果 | 必須可追溯並經權責角色人工確認 | R3 強化 |

R4 取代「R2 與 R3 必須成套閱讀」的日常使用方式，但不刪除、不覆蓋 R2 與 R3。遇到爭議時，依序回查 R4 決策、R3 修訂內容與 R2 完整母本。

## 3. 品牌與產品架構

### 3.1 TIGI Platform Core

TIGI Platform Core 是跨產品共用的 SaaS 技術核心，不直接承擔所有前台業務。核心能力包括：

- Tenant、Organization、User、Role、Permission 與 SSO。
- Subscription、Module License、Billing、Usage Metering 與企業方案管理。
- Customer、Lead、Project、Case 與跨站識別關聯。
- Audit Log、Consent、Data Retention、Webhook 與 API Gateway。
- 共用資料契約、事件格式、錯誤碼、版本相容與追蹤識別碼。
- 白標品牌、Custom Domain、Feature Flag 與企業整合設定。

### 3.2 產品責任邊界

| 產品 | 主要責任 | 不負責 |
|---|---|---|
| StyleMatch AI | AI 客服、需求分析、風格分析、文件、圖說、影像、知識檢索與 Agent 能力 | 會員媒合成交、招標、Gate 決策、付款執行 |
| TWCID.net | 會員、內容、案件、設計師／廠商媒合、邀標／招標、認證、評價與平台營運 | AI 模型執行、iSAFE 治理結果判定 |
| iSAFE 2.0 | S1～S10、Gate、Checklist、Evidence、Risk、驗收、保固、PGP 與付款資格 | 前期媒合、AI 自主決策、自動付款 |
| DEOS | 後期估價、採購、發包、派工、成本及財務協同 | Phase 1 一次性完整 ERP |

### 3.3 部署原則

三個網站保留獨立部署、獨立品牌入口與獨立產品節奏。GitHub Repo 可維持分離，另建立 `tigi-shared-contracts`、`tigi-platform-api` 與 `tigi-docs`。所有跨站整合透過正式 API、Webhook 與授權關聯鍵完成，不以共用資料庫或前端 localStorage 作為長期整合方式。

## 4. SaaS 多租戶與授權模型

### 4.1 Tenant First

所有企業資料必須帶有 `tenant_id`，組織層級資料另帶 `organization_id`。每一次讀寫都需在服務端執行租戶邊界檢查，Audit Log 必須保留操作者、來源、目的、時間及 Trace ID。

### 4.2 模組化授權

| 模組旗標 | 功能 |
|---|---|
| `stylematch_ai_enabled` | StyleMatch AI SaaS 與嵌入式 AI 體驗 |
| `isafe_enabled` | iSAFE 2.0 工程治理 |
| `twcid_marketplace_enabled` | TWCID 會員、媒合與 marketplace |
| `api_access_enabled` | 企業 API、Webhook 與 SDK |
| `white_label_enabled` | 白標品牌、Email 與表單設定 |
| `custom_domain_enabled` | 企業自訂網域與品牌入口 |

企業可購買 StyleMatch AI、iSAFE 2.0 或整合套裝。任一產品不得強制依賴另一產品才能運作；iSAFE 可匯入其他 CRM 或 ERP 案件，StyleMatch AI 也可只輸出需求與提案結果。

## 5. 共用資料模型與識別策略

### 5.1 核心實體

`Tenant / Organization / User / Role / Permission / Subscription / ModuleLicense / Customer / Lead / Project / MatchRequest / Case / Workflow / Gate / Checklist / Evidence / Contract / PaymentEligibility / Inspection / Warranty / AI Task / AuditLog / WebhookEvent`

### 5.2 識別碼

| 識別碼 | 用途 | 範例 |
|---|---|---|
| `tenant_id` | 企業租戶隔離 | `TEN_xxxxx` |
| `organization_id` | 租戶內組織 | `ORG_xxxxx` |
| `journey_id` | 消費者跨站旅程 | `JNY_xxxxx` |
| `lead_id` | 前期商機 | `LEAD_2026_0001` |
| `project_id` | StyleMatch AI 專案 | `PRJ_2026_0001` |
| `match_case_id` | TWCID 媒合案件 | `MAT_2026_0001` |
| `case_id` | iSAFE 治理案件 | `CASE_2026_0001` |
| `ai_task_id` | AI 任務追蹤 | `AIT_xxxxx` |
| `trace_id` | API / Event 端到端追蹤 | `TR_xxxxx` |

識別碼只用於關聯，不得暗含個資。跨站交換應使用最小必要資料，個資另以授權、目的限制與保存期限管理。

## 6. 跨平台流程與 Handover Contract

### 6.1 標準旅程

1. TWCID 或企業官網導流至 StyleMatch AI。
2. StyleMatch AI 完成需求、空間、風格與預算條件結構化，建立 `project_id`。
3. 使用者授權後向 TWCID 建立 `match_case_id`，由 TWCID 執行媒合、邀標或招標。
4. 確認合作方與合約條件後，由 TWCID 或企業系統送出 Handover。
5. iSAFE 建立 `case_id` 並保留 `source_project_id`、`match_case_id` 與授權快照。
6. 案件進入 iSAFE S1～S10 治理流程，AI 只提供輔助，不直接改變正式治理結果。

### 6.2 Handover 最小欄位

| 類別 | 必要欄位 |
|---|---|
| 關聯 | `tenant_id`、`journey_id`、`project_id`、`match_case_id`、`trace_id` |
| 當事人 | 客戶、設計師、廠商之授權關聯鍵，不直接暴露非必要個資 |
| 需求 | `requirement_profile`、`style_profile`、`space_profile`、`budget_profile` |
| 成果 | `proposal_summary`、附件參照、來源與版本 |
| 商務 | 合約基線摘要、範圍、預算、工期與付款節點參照 |
| 同意 | `consent_scope`、`consent_at`、保存期限與撤回狀態 |

Handover 必須具備冪等鍵、Schema Version、簽章、時間戳記與重送策略。接收端不得因缺少非必要欄位而無條件取得更多資料。

## 7. API、事件與錯誤契約

### 7.1 第一階段 API

- `POST /api/v1/projects`
- `GET /api/v1/projects/{projectId}`
- `POST /api/v1/projects/{projectId}/ai-tasks`
- `POST /api/v1/match-requests`
- `POST /api/v1/handovers/isafe`
- `POST /api/v1/isafe/cases`
- `GET /api/v1/isafe/cases/{caseId}`
- `POST /api/v1/webhooks/stylematch/project-created`
- `POST /api/v1/webhooks/isafe/case-updated`

### 7.2 核心事件

`LeadCreated / StyleQuizCompleted / RequirementSubmitted / ProjectCreated / ProposalGenerated / MatchRequested / DesignerMatched / VendorMatched / IsafeCaseCreated / WorkflowStarted / GateCompleted / PaymentEligibilityCreated / InspectionCompleted / WarrantyStarted`

### 7.3 契約要求

所有 API 與事件須包含 `schema_version`、`event_id` 或 `request_id`、`tenant_id`、`trace_id`、發生時間與來源系統。Webhook 需具簽章驗證、重試、退避、去重與 Dead Letter 處理。錯誤回應應至少包含 `code`、`message`、`trace_id` 與可否重試，不得回傳內部 Prompt、Token 或敏感堆疊資訊。

## 8. StyleMatch AI Agent Platform 規格

### 8.1 Agent Registry 與 AI Gateway

每項 AI 能力須登錄 Agent ID、用途、輸入輸出 Schema、模型供應商、模型版本、Prompt Version、資料分類、可用 Scope、逾時、成本與人工確認要求。所有呼叫統一經 AI Gateway 執行認證、限流、成本計量、內容安全、Trace 與供應商切換。

### 8.2 AI Task Trace

| 欄位 | 說明 |
|---|---|
| `ai_task_id` | AI 任務唯一識別 |
| `agent_id` | Agent Registry 識別 |
| `model_provider` / `model_version` | 模型來源與版本 |
| `prompt_version` | Prompt 版本，不直接暴露內部 Prompt |
| `input_refs` / `output_refs` | 輸入輸出資料或物件參照 |
| `confidence` | 可選信心值及其解釋方式 |
| `review_status` | 待確認、接受、修正或拒絕 |
| `reviewed_by` / `reviewed_at` | 人工覆核者與時間 |
| `trace_id` | 跨服務追蹤識別 |

### 8.3 AI Guardrail

- AI 不得直接建立媒合成交或選定設計師／廠商。
- AI 不得直接判定 Gate 通過。
- AI 不得直接修改正式 Risk、Evidence、驗收或付款資格結果。
- AI 不得取代建築師、設計師、監造、技師或其他專業簽證。
- 高影響輸出必須顯示來源、版本、限制、信心資訊與人工確認狀態。
- OAuth Scope 必須區分讀取資料、產生建議、提交草稿與正式治理寫入；AI Scope 不授予正式決策權限。

## 9. iSAFE 2.0 治理基線

### 9.1 兩階段十步驟

R4 保留 R2 的 S1/D1～S10/C5 流程架構。每個案件以 StepInstance 記錄步驟狀態、責任角色、Checklist、Evidence、Risk Signal、例外、覆核與 Gate Result。前期需求分析與 TWCID 媒合不納入 iSAFE 十步驟，僅透過 Handover 形成治理案件輸入。

### 9.2 Gate 與付款資格

Gate 通過代表該治理階段滿足設定條件，若合約同時約定付款節點，可產生 Payment Eligibility。Payment Eligibility 不是付款命令，仍須經業主確認、合約條件、發票、保留款、追加減與金流流程處理。

### 9.3 Evidence 與 PGP

Evidence 須具類型、來源、建立者、時間、版本、雜湊、關聯步驟及權限。PGP（Project Governance Profile）彙整需求、設計、合約、工程、證據、Gate、驗收、保固與例外處理，形成可追溯的專案治理履歷。

## 10. TIGI 治理標準與資料資產

### 10.1 保留基線

- `TIGI-GS-01～TIGI-GS-30`，共 30 項治理標準。
- `iSAFE-DGM-01～iSAFE-DGM-24`，共 24 張數位治理手冊。
- 411 個 DGI 原始治理題項，每題建立唯一題碼。
- DGI 題項分類為 `REQUIREMENT`、`RISK_SIGNAL`、`CONTROL`。
- 九類命名空間：`TIGI-GS`、`iSAFE-DGM`、`DGI`、`WI`、`G`、`PM`、`EVD`、`NCR`、`CAPA`。

### 10.2 GS-25～GS-30

| 標準 | 名稱 | R4 用途 |
|---|---|---|
| TIGI-GS-25 | 合約基線治理標準 | 對齊範圍、圖說、估價、工期、付款與變更 |
| TIGI-GS-26 | 工項與施工期別治理標準 | 工項、施工期別與責任角色配置 |
| TIGI-GS-27 | 付款節點與資格治理標準 | Gate、驗收、追加減、保留款與付款資格 |
| TIGI-GS-28 | 數位治理手冊綁定標準 | DGM 與步驟、工項、Evidence、Gate 的關聯 |
| TIGI-GS-29 | AI 輔助治理標準 | 模型、Prompt、輸入輸出與人工確認追溯 |
| TIGI-GS-30 | 消費者旅程與資料回饋標準 | StyleMatch AI、TWCID、iSAFE 的跨站資料閉環 |

## 11. 安全、隱私與稽核

採零信任與最小權限原則。OAuth Scope、Role、Permission 與租戶邊界必須在服務端檢查；跨站 Token 不得直接共用。敏感資料需分級、傳輸與靜態加密，並定義保存、刪除、匯出、撤回與事件通報流程。

AI 任務、Handover、媒合、Gate、Evidence、Risk、付款資格與管理者設定變更均需寫入不可任意修改的 Audit Log。正式上線前需完成租戶隔離測試、水平越權測試、Webhook 重放測試、資料刪除測試、AI 越權測試與備援復原演練。

## 12. 商業化與產品包裝

### 12.1 StyleMatch AI SaaS

- Starter：風格測驗、需求表單與基礎報告。
- Professional：AI 提案、預算建議、文件與圖像任務。
- Business：白標、CRM 串接、團隊管理與 API。
- Enterprise：企業整合、專屬治理、私有部署或指定模型方案。

### 12.2 iSAFE 2.0 SaaS

- Team：案件、流程、Checklist、Evidence 與基礎 Gate。
- Business：合約、付款資格、驗收、保固、PGP 與稽核。
- Enterprise：多組織、企業 API、進階權限、客製流程與私有整合。

### 12.3 整合套裝與 TWCID 生態

整合套裝提供 StyleMatch AI + iSAFE 2.0 + TWCID Marketplace，讓企業完成獲客、需求轉換、媒合與治理。TWCID 的認證、評價與會員資料屬獨立平台資產，使用時必須取得明確授權並公開評分規則與資料可見範圍。

## 13. SBIR 與研發執行路線

### 13.1 Phase 1：AI Assist

期間建議 M1～M3。完成共同資料模型、Agent Registry、AI Gateway、需求分析與 AI Task Trace 原型，並建立 TWCID Pilot 的授權流程。

### 13.2 Phase 2：Governance Workflow

期間建議 M4～M6。完成 Project Handover、iSAFE Case、S1～S10 核心流程、Gate、Checklist、Evidence 與人工覆核。

### 13.3 Phase 3：Project OS

期間建議 M7～M9。完成多租戶 SaaS Core、企業權限、Subscription、Audit、Webhook、白標與真實案件 Pilot。

### 13.4 Phase 4：DEOS Roadmap

期間建議 M10～M12 完成驗證及後續設計，不宣稱一次完成大型 ERP。依市場驗證結果規劃估價、採購、發包、派工、成本與財務模組。

### 13.5 建議 KPI

| KPI | 驗證方式 |
|---|---|
| AI 需求摘要可採用度 | 專業人員覆核，目標達 80% 以上 |
| Handover 成功率 | 有效授權案件端到端建立 iSAFE Case |
| 治理資料完整率 | 必填 Checklist、Evidence 與責任角色完整度 |
| Trace 覆蓋率 | AI、API、事件與治理操作具 Trace ID 的比例 |
| 租戶隔離 | 自動化與人工越權測試均不得讀取跨租戶資料 |
| Pilot 完成度 | 真實案件數、活躍角色、Gate 完成與回饋紀錄 |

## 14. 工程實施優先順序

1. 建立 `tigi-shared-contracts`，凍結 ID、Schema、Error Code 與 Event Envelope。
2. 建立 TIGI Platform Core 的 Tenant、Organization、User、RBAC 與 Audit。
3. 讓 StyleMatch AI 正式建立 Project 與 AI Task Trace。
4. 實作 TWCID Match Request 與授權流程。
5. 實作 Project Handover 與 iSAFE Case 冪等建立。
6. 以真實 Pilot 驗證跨站 Trace、租戶隔離、人工覆核與 Gate 邊界。
7. 再導入 Subscription、Billing、白標、Custom Domain 與 Partner API。

不建議在第一階段先合併三個 Repo、重做所有網站或直接開發完整 DEOS。整合成敗首先取決於共用身分、資料契約、權責邊界與端到端案件流轉。

## 15. 驗收條件

- 三個網站可獨立部署與登入，企業租戶資料不互相洩漏。
- StyleMatch AI 可建立 Project，且每次 AI 任務具完整 Trace。
- TWCID 僅在使用者授權下建立媒合與 Handover。
- iSAFE 可冪等接收外部 Project 並建立 Case。
- AI 嘗試寫入 GateResult、正式 Risk、媒合成交或付款命令時必須被拒絕。
- Gate 通過只建立 Payment Eligibility，不觸發自動付款。
- Webhook 具簽章、重試、去重與失敗告警。
- R2 的 GS、DGM、DGI 與命名空間可在 R4 資料模型中被唯一引用。
- DOCX、PDF、Markdown 的版本、日期與核心決策一致。

## 16. 版本追溯

| 版本 | 定位 | R4 處理方式 |
|---|---|---|
| 20260713_R2 | 完整長版母本 | 保留治理基線、頁面索引與完整脈絡 |
| 20260714_R3 | 修正補充包 | 採用產品邊界、Agent/API、Trace、Handover、Guardrail 與 DEOS 路線 |
| 20260714_R4 | 單一整合正式版 | 作為後續決策、文件與實作的預設入口 |

R4 不宣稱 R2 的 72／48／27／21 頁內容已逐字搬移，而是將其有效治理基線、文件索引與 R3 修正決策整合成可直接執行的單一母本。需要歷史全文、原始附件或送件欄位時，仍可回查版本封存資料夾。

## 17. 最終結論

TIGI 應成為共用治理與 SaaS 基礎；StyleMatch AI、TWCID.net、iSAFE 2.0 則維持清楚的產品責任與品牌入口。整合的核心不是把網站放進同一個畫面，而是讓同一個租戶、使用者、案件、授權與稽核軌跡能在三個產品之間安全流轉。

R4 的正式策略為：品牌分開、資料整合、產品模組化、商業 SaaS 化、技術 Shared Core 化，並以 AI Assist → Governance Workflow → Project OS → DEOS 的節奏降低範圍風險、加快企業落地。
