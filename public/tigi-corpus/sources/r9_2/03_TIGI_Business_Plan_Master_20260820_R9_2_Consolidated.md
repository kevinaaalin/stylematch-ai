# TIGI Business Plan Master

R9.1 Spatial Intelligence Commercial Integrated｜四母本完整內容整合最新版

版本：20260820_R9_2_Consolidated

發布識別：TIGI-GOVERNANCE-20260820-R9.2-CONSOLIDATED

共同基線：R5.2 State Machine + R5.2.1 GS30 Recovery + Legacy Functional Parity

實作契約：20260723_R5_2_PARITY_1

章節結構：共 27 章；R6.1 治理整合版獨立保存，不覆寫 R5.2／R5.2.1

適用範圍：營運規劃、策略合作、募資溝通與商業驗證

發布狀態：Approved Specification Baseline／Candidate Implementation；Final Official = NO GO

重要：本版完整保留 R9 四母本全文，新增 R9.2 Consolidated Technical Baseline、Agent R3.3 與 Product v8.2.0 規格。R5.2 State Machine 仍是正式狀態權威；Patent V7 維持鎖定；新增模組未經 Phase 0 與驗證前不得宣稱已完成實作。


## 2. 市場痛點

市場缺乏把需求、媒合、合約、工程 Evidence、治理判定與後續營運串成可信資料鏈的共同基礎。

R5.2 整合內容與契約

本版保留 R5 Final 與 R5.1 全部契約修正，再疊加 R5.2 iSAFE 狀態機；發布狀態仍為 Release Candidate。

本文件保留 R5 Final 的完整用途化內容，契約衝突依 R5.2 State Machine ADR 與 R5.1 Accepted ADR 與 canonical contract 修正。

R6.1 為 Governance Integration Release Candidate；本整合版不得標示 Final Official。

「文件目的與適用範圍」以 R5 正式名稱、版本和 Canonical Contract 為準。

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

控制與驗收

任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。


## 3. 目標客群

核心客群包括設計公司、工程公司、專業服務者、業主、平台營運者與需要企業治理能力的第三方系統。

R5.2 整合內容與契約

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

本章在「TIGI Business Plan Master」中的用途，是把「目標客群」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。


## 4. 解決方案

以 TIGI Shared Core 串接 StyleMatch AI、TWCID、iSAFE 2.0 與未來 DEOS，各產品獨立銷售並可組成整合方案。

R5.2 整合內容與契約

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。

本章在「TIGI Business Plan Master」中的用途，是把「解決方案」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。


## 5. 產品組合

產品組合分為 AI Capability、Marketplace、Governance 與 Future Operations，底層共用身分、權限、Audit、API 與資料治理。

R5.2 整合內容與契約

SaaS Module Flag：stylematch_ai_enabled、isafe_enabled、twcid_marketplace_enabled、api_access_enabled、white_label_enabled、custom_domain_enabled。

方案以 Module Flag 搭配 Entitlement 管理，不以共用資料庫或前端登入狀態綁定產品。

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。


## 6. TIGI-GS-01～30 商業價值

TIGI-GS-01～30 已依 2026-07-13 Version Freeze 原始 Official Edition 完成名稱與用途復原，作為本文件的共同治理基準。

R5.2 整合內容與契約

TIGI-GS-01｜案件識別標準：確保每個案件具有唯一 Project ID、流程及版本

TIGI-GS-02｜角色責任標準：定義業主、設計師、施工單位、審核者的責任與權限

TIGI-GS-03｜節點進入標準：定義進入下一步驟前必須完成的前置條件

TIGI-GS-04｜Gate驗證標準：規定 Gate 如何檢查文件、簽核、照片、檢核及付款條件

TIGI-GS-05｜狀態轉換標準：防止非法跳關，保存操作者與時間

TIGI-GS-06｜例外處理標準：管理 Fallback、Override、暫停與例外核准

TIGI-GS-07｜案件資料標準：統一案件必要欄位、代碼與資料型別

TIGI-GS-08｜參與者與權限標準：管理角色、授權範圍及有效期間

TIGI-GS-09｜Artifact中繼資料標準：規範圖說、照片、文件的來源、類型及版本

TIGI-GS-10｜版本與變更標準：新資料不得覆蓋舊版本，必須保留變更原因

TIGI-GS-11｜治理事件標準：保存誰、何時、對什麼資料、做了什麼操作及結果

TIGI-GS-12｜交換與互通標準：統一 API Schema、代碼、錯誤碼及交換版本

TIGI-GS-13｜證據識別標準：每一 Evidence 具有唯一 ID 並關聯案件、步驟及 Gate

TIGI-GS-14｜完整性標準：保存 SHA-256、檔案大小及完整性驗證資料

TIGI-GS-15｜採集中繼資料標準：保存時間、來源、裝置及可取得的 EXIF／GPS

TIGI-GS-16｜證據鏈標準：追蹤上傳、引用、驗證、簽核及封存歷程

TIGI-GS-17｜簽核與見證標準：保存簽核人、角色、意圖、時間及簽核版本

TIGI-GS-18｜保存與封存標準：規定保存期限、封存、Legal Hold 及刪除程序

TIGI-GS-19｜Checklist標準：規定檢核項目、結果、證據、檢查人及版本

TIGI-GS-20｜不符合事項標準：記錄缺失類型、嚴重度、責任人及改善期限

TIGI-GS-21｜改善閉環標準：管理改善、複驗及缺失關閉條件

TIGI-GS-22｜風險評分標準：規範 RiskScore 規則、權重、分數與版本

TIGI-GS-23｜驗收與交付標準：規範驗收範圍、缺失、簽認及交付清單

TIGI-GS-24｜保固與結案標準：管理保固期間、維修責任、PGP 及案件封存

TIGI-GS-25｜合約基線治理標準：確認工程範圍、圖說、估價、工期、付款及變更基準一致

TIGI-GS-26｜工項與施工期別治理標準：將個案工項配置至第一、二、三期工程施工及對應責任角色

TIGI-GS-27｜付款節點與資格治理標準：規範 Gate、驗收、追加減、保留款及付款資格間的關係

TIGI-GS-28｜數位治理手冊綁定標準：規範 24 張手冊如何綁定步驟、工項、Evidence 及 Gate

TIGI-GS-29｜AI輔助治理標準：規範 AI 模型版本、輸入輸出、人工確認及不得取代專業判斷

TIGI-GS-30｜消費者旅程與資料回饋標準：規範 StyleMatch AI、TWCID、iSAFE 及成果回饋的資料串聯與使用限制

控制與驗收

本文件中的 TIGI-GS 名稱與用途必須與復原 Registry 30/30 一致。

Gate 通過只代表治理條件成立，不等於 Payment Eligibility、Invoice、付款核准或付款執行。

後續變更必須以 ADR、新版 Registry 與跨格式一致性驗證處理。


## 7. iSAFE-DGM-01～24 商業價值

維持 iSAFE-DGM-01～24 為室內裝修數位治理手冊範圍，以 Registry 管理名稱、適用步驟、工項與版本。

R5.2 整合內容與契約

iSAFE-DGM Registry 共 24 個穩定 ID，來源完整 24/24；目前均待治理核准與發布整合。

本文件只引用命名範圍、流程角色與待補狀態，不虛構治理手冊名稱或正文。

權威內容補入後必須完成版本、來源、核准與三格式一致性檢查。

控制與驗收

「iSAFE-DGM-01～24 命名」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「411 題 DGI 題碼策略」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。


## 8. 九類命名空間資產化

凍結九類命名空間 TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA，避免文件與系統另創同義代碼。

R5.2 整合內容與契約

建立「九類命名空間」的 Registry ID、名稱、版本、Owner、有效期間與狀態。

「PM / G / WI 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「EVD / NCR / CAPA 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

本章在「TIGI Business Plan Master」中的用途，是把「九類命名空間資產化」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「九類命名空間」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「PM / G / WI 編碼」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。


## 9. StyleMatch AI 導流

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

R5.2 整合內容與契約

高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。

AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。

Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

「StyleMatch AI 前端事件」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

控制與驗收

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。


## 10. TWCID 媒合

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

R5.2 整合內容與契約

TWCID 擁有會員、內容、match_case_id、候選、邀標／招標、媒合決策、成交、評價及授權快照；AI 能力由 StyleMatch AI API 提供。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「TWCID 媒合資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

本章在「TIGI Business Plan Master」中的用途，是把「TWCID 媒合」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「TWCID 媒合資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。


## 11. iSAFE 2.0 轉換

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

R5.2 整合內容與契約

S1／D1 前置作業（設計）、S2／D2 平面設計規劃。

S3／D3 基本設計規劃定案、S4／D4 立面設計定案。

S5／D5 施工大樣及其他約定事項、S6／C1 前置作業（工程）。

S7／C2 第一期工程施工、S8／C3 第二期工程施工。

S9／C4 第三期工程施工、S10／C5 保固修繕及售後服務。

Intake／Handover 在 D1 前，Closed／Archived 在 C5 後；Stage Evidence、Waiver 與獨立付款里程碑形成企業治理價值。

控制與驗收

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「iSAFE 2.0 個案治理資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。


## 12. 資料回饋變現

資料回饋僅交換經授權、最小必要、可追溯的結構化結果，不將客戶資料默認送入模型訓練。

R5.2 整合內容與契約

Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。

「資料回饋迴圈」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「附錄 E：資料回饋迴圈」以 R5 正式名稱、版本和 Canonical Contract 為準。

本章在「TIGI Business Plan Master」中的用途，是把「資料回饋變現」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「資料回饋迴圈」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「附錄 E：資料回饋迴圈」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。


## 13. SaaS 收費模式

將 TIGI 定位為治理標準與 SaaS 共用核心，不把 TWCID、StyleMatch AI、iSAFE 2.0、DEOS 混成單一前台或單一資料庫。

R5.2 整合內容與契約

Platform Core Billing 物件：Product、Plan、Feature、Entitlement、Subscription、UsageEvent、InvoiceReference。

Product／Plan／Feature 定義商品與方案；Entitlement／Subscription／UsageEvent／InvoiceReference 管理權益、訂閱、用量與發票參照。

PaymentEligibility 不等於 Invoice、PaymentApproval 或付款執行，也不觸發自動付款。

計價可採 Tenant、Seat、Project、AI Task、Evidence Storage 或 Governance Profile，但 Entitlement、Usage Event 與 Invoice Reference 由 Platform Core 統一治理。

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 14. 企業授權模式

將 TIGI 定位為治理標準與 SaaS 共用核心，不把 TWCID、StyleMatch AI、iSAFE 2.0、DEOS 混成單一前台或單一資料庫。

R5.2 整合內容與契約

企業版以租戶隔離、SSO、RBAC／ABAC、稽核、資料保留、私有模型路由與 SLA 作為主要授權差異。

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「企業授權模式」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 15. API 生態模式

公共 API 統一採 /api/v1；內部服務可用 /v1，但不得形成第二套公開契約。

R5.2 整合內容與契約

跨產品事件採 16 個 Canonical Event；正式 Handover 契約固定 28 個必要欄位，合作方不得自行改名。

公開 API 以 `/api/v1`、Scope、Entitlement、Metering、Trace、冪等與 Webhook 契約形成可授權的生態能力。

Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。

Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

本章在「TIGI Business Plan Master」中的用途，是把「API 生態模式」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 16. GS-25～30 對商業閉環

GS-25～27 分別管制 Contract Baseline、工項／施工期別、付款節點與付款資格。

R5.2 整合內容與契約

「GS-25～27 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

「GS-28～30 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

「付款資格資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

「數位治理手冊綁定模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

本章在「TIGI Business Plan Master」中的用途，是把「GS-25～30 對商業閉環」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「GS-28～30 技術母本定位」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。


## 17. Gate 與付款資格商業邊界

Gate 結果統一為 Passed、Failed、Conditional、Waived；通過最多建立 Payment Eligibility，不會自動付款。

R5.2 整合內容與契約

Gate Passed 只表示治理條件成立，不自動產生 Payment Eligibility、Invoice 或付款執行。

付款資格產品化須連結 milestone_id、Contract Baseline、Gate Decision、Evidence、確認者與理由。

Waived 必須有 authority、reason、未來 expires_at 與事後覆核，不得作為加速付款或繞過驗收的商業功能。

控制與驗收

「Gate 判定與付款資格」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「付款資格資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。


## 18. AI 輔助治理商品化

AI 治理資料將 finding／hint／proposal 與正式 Decision 分表、分權限、分事件並保留人工確認。

R5.2 整合內容與契約

高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。

AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。

iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。

「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

「AI 輸出限制」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

控制與驗收

「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「AI 輸出限制」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。


## 19. 競爭優勢

護城河由產業標準、治理資料模型、跨站 ID、Evidence Chain、Agent 評估與真實 Pilot 資料共同形成。

R5.2 整合內容與契約

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

「資料回饋迴圈」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「審計軌跡與版本追溯」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

本章在「TIGI Business Plan Master」中的用途，是把「競爭優勢」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「資料回饋迴圈」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。


## 20. Go-to-Market

GTM 先從 TWCID 既有流量與 iSAFE 高頻治理場景驗證，再以企業 SaaS、API 與合作夥伴複製擴張。

R5.2 整合內容與契約

「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「Go-to-Market」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 21. 合作夥伴

合作夥伴依流量入口、專業服務、工程導入、模型供應、雲端基礎與產業推廣分工，並以契約限制資料與決策權。

R5.2 整合內容與契約

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「合作夥伴」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 22. 營運指標

營運指標同時追蹤採用、轉換、留存、使用量、治理品質、系統可靠度及客戶成功，不只衡量註冊數。

R5.2 整合內容與契約

新增各 Stage 完成率、required_evidence 完整率、Waiver 比率、跳階拒絕率、Migration review 與付款誤觸發率。

「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「營運指標」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「營運指標」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。


## 23. 財務假設

財務母本保留可驗證的計價單位、成本驅動、轉換率、續約率與情境模型，不填入未經核定的營收數字。

R5.2 整合內容與契約

營收、客單、轉換率、續約率、毛利與取得成本均應保留基準值、情境、資料來源及敏感度，不以未驗證數字作正式承諾。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「財務假設」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。


## 24. 風險控管

商業風險以產品定位、銷售週期、導入成本、模型成本、資料責任、夥伴依賴與法遵要求分類管理。

R5.2 整合內容與契約

R5／R5.1 legacy stage values 必須依 Mapping 遷移並人工覆核；未備份或未完成 smoke test 不得切換正式環境。

「Risk Weight 專業審查邊界」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。

「權限與角色模型」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

「例外處理與人工覆核」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「風險控管」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「Risk Weight 專業審查邊界」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「權限與角色模型」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。


## 25. 里程碑

里程碑依 12 個月可交付成果與 36 個月產品成熟度分開管理，避免把長期 DEOS 當成本期承諾。

R5.2 整合內容與契約

「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。

「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「里程碑」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。


## 26. 募資與資源需求

資源需求依研發、Pilot、商業化與營運能力分段，並以里程碑、Runway 與可驗證成果作為釋出依據。

R5.2 整合內容與契約

資金需求須依 12 個月交付與 36 個月產品成熟路線分段，並區分研發、Pilot、商業化與營運資金用途。

「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

本章在「TIGI Business Plan Master」中的用途，是把「募資與資源需求」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。


## 27. R6 產品就緒度與商業化邊界

R6 證明核心監管工作區已可操作，但正式 SaaS、通知、物件儲存、多租戶計費及正式部署仍屬後續商業化範圍。

R5.2 整合內容與契約

本地實作契約為 20260723_R5_2_PARITY_1；R5.2 狀態機契約維持 20260722_R5_2。

監管流程採 D1～D5 與 C1～C5 共 10 個正式階段，S1～S10 僅為同一 StepInstance 的連續順序碼。

舊站監管內容已整理為 82 項逐項檢核，支援完成、異常、不適用及待檢核狀態。

設計與工程各建立 30%、30%、30%、10% 四個里程碑，共 8 個付款里程碑。

已建立設計費、工程費、合約編號與核准狀態基線，並支援收據、實付金額及付款證明紀錄。

已支援文件、圖片與 Evidence 上傳下載；檢核、證據、合約及追加工程異動寫入 Audit 與 outbox event。

追加工程保存名稱、金額、工期影響、原因與狀態；案件溝通涵蓋留言、提問、爭議諮詢及治理歷程。

案件切換已保持目前案件，不再於儲存後跳回第一個案件；本地 QA 案件標題亂碼亦已備份後修正。

桌面 1440px 與手機 390px 均無頁面水平溢位；容器內導覽及功能分頁可橫向捲動。

驗收案件為 IS-2026-0003；API 自動測試 1 passed／0 failed，前端 console error／warning 為 0。

本地驗收網址：http://127.0.0.1:4174/?view=projects&case=IS-2026-0003

本次更新只存在本地工作區，尚未 commit、push 或部署至 GitHub 正式網站。

現階段可支援監管案件工作區、契約與里程碑、Evidence、追加工程、溝通及 Audit 的產品展示與 Pilot。

VIP 專案、公開招標、評價展示、真實通知、企業 SSO、方案配額與多租戶計費尚未納入本次完成範圍。

控制與驗收

Gate Passed 只表示治理條件成立，不會自動建立 Payment Eligibility、Invoice、付款核准或付款執行。

Payment Eligibility 仍由獨立契約里程碑評估產生，Approval 與 Execution 維持權責分離。

本地測試結果是 Pilot／工程驗證證據，不得描述為正式生產環境上線、正式資安驗證或外部使用成效。

正式發布前必須完成權限矩陣、物件儲存、病毒掃描、檔案版本與保留政策、通知服務及 production smoke test。

iSAFE-DGM 24 項與 DGI 411 題來源已取得並通過完整性檢查；治理核准、ID 遷移與正式發布整合尚未完成。


## 28. 結論

R5 的共同策略是品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化。

R5.2 整合內容與契約

R5 以品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化作為四份文件共同結論。

「結語」以 R5 正式名稱、版本和 Canonical Contract 為準。

本章在「TIGI Business Plan Master」中的用途，是把「結論」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

控制與驗收

「結語」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「結論」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。


## R6.1 Governance Registry Integration Baseline（2026-07-23）

本附錄將 TIGI Business Plan Master 納入 TIGI Governance Master R6.1 的共同治理基線。

| 控制項 | R6.1 狀態 |
| --- | --- |
| 上位治理母本 | TIGI_Governance_Master_24_Chapters_Independent_Edition_20260723_R6_1_RC.docx |
| TIGI-GS | 30/30 已復原並維持權威 |
| iSAFE-DGM | SOURCE_FOUND 24/24；待治理核准與發布整合 |
| DGI | SOURCE_FOUND 411/411；待 ID 遷移、治理核准與發布整合 |
| Payment | Gate PASS 不等於 Payment Eligibility、Approval、Invoice 或 Execution |
| 發布狀態 | R6.1 Release Candidate；不得標示 Final Official |

### 文件族譜

Canonical Contract / Approved Registry > Governance Master > TIGI Business Plan Master > 歷史來源

### 發布阻擋

- DGM/DGI 版本裁決與治理核准。
- 411 筆 DGI alias migration 與參照完整性 QA。
- 正式 SaaS 權限、物件儲存、病毒掃描、備份、部署核准及 production smoke test。

## R6.1 RC Engineering QA / Release Management Update（2026-07-28）

Document Set ID: TIGI-4MASTER-20260728-R6.1-RC-QA-01

Version: 20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated

Release ID: TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

QA Freeze: TIGI-R6.1-RC-FREEZE-20260723-01

Release Status: RELEASE_CANDIDATE

Decision: GO for RC Freeze; NO GO for Final Official

Final Official Allowed: false

Official QA Report 是唯一驗收摘要；原始權威仍是 Canonical Contract、Approved Registry、Accepted ADR、Manifest、SHA256、Git 與測試證據。

### Registry 狀態

| Registry | Source | Governance Approval | Release Integration |
| --- | --- | --- | --- |
| TIGI-GS-01～30 | PASS 30/30 | PASS 30/30 | PASS 30/30 |
| iSAFE-DGM-01～24 | PASS 24/24 | PENDING 0/24 | PENDING 0/24 |
| DGI 411 | PASS 411/411 | PENDING 0/411 | PENDING 0/411 |


### Production Readiness

| Module | Current Level | Release Note |
| --- | --- | --- |
| GS-01～30 | RELEASE_INTEGRATED | 30/30 已核准並整合 |
| DGM / DGI | LOCALLY_IMPLEMENTED | 來源完整；治理核准與整合待完成 |
| State / Evidence / CAPA / Payment | LOCALLY_IMPLEMENTED | 本地實作；production 未證明 |
| Journey / Handover / OpenAPI / Schema | SPECIFIED | 正式工程成品與整合待補 |
| Production Deployment | SPECIFIED | 無 Final Official 部署證據 |


### TIGI Business Plan Master 更新控制

- 商業簡報、合作與授權材料不得將 LOCALLY_IMPLEMENTED 描述為正式上線，也不得將來源完整描述為治理核准完成。
- Payment Eligibility 與 Payment Approval、Invoice、Payment Execution 持續分離；Gate PASS 不得作為自動付款承諾。
- R6.1 Final Official、GitHub Release、正式 API 與企業 SaaS 上線均屬 Release Blocker 關閉後才能對外使用的聲明。
### Final Official Release Blockers

完成 DGM 24 與 DGI 411 的治理核准及發布整合。

修正 Canonical Contract 的舊 remaining_registry_source_required=435 欄位。

建立並核准 R6.1 ADR Master。

將 Governance Master 與 State Machine Contract 納入正式 Release Package。

正式發布 OpenAPI、SQL Schema、JSON Schema 與獨立架構圖來源。

完成 Git commit、tag、push、GitHub Release 與 SHA256 驗證。

Final Official 只能由 Final Release Decision 的 GO 及全部 Required Gate PASS 共同產生，不得人工直接切換。


## R7.2 Style / Proposal / Vision / Commercial QA Integrated Addendum

商業計畫母本｜版本 20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜發布識別 TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

本附錄記錄 2026-07-30 StyleMatch AI 本地實作基線。R6.1 原始檔案保持不變；R7 將已完成的網站行為轉為可稽核的產品、資料與流程契約。

### R7 新增一：StyleMatch AI 裝修規劃設計提案工作流

- 需求流程固定為五步：基本資料、空間照片、偏好需求、預算分析、後續方案。
- 三種後續方案只能在需求填寫完成後顯示：AI 裝修規劃設計提案、專業設計師媒合、TWCID 平台招標媒合。
- 專案資料至少包含 project_id、case_code、房屋類型、屋齡、坪數、格局、預算、材料等級、空間調性、特殊需求、space_photos、reference_photos 與 service_option。
- StyleMatch 專案成立不等同 iSAFE 立案；不得在需求階段直接建立 isafe_case_id。
### R7 新增二：設計提案組稿與 PDF Artifact

- Proposal Assembly Workflow 依專案資料自動生成設計提案預覽，並輸出 A4 PDF。
- 共通章節為：專案需求摘要、設計概念、風格意象、空間調性、參考圖片、平面配置（有資料時）、空間現況、材料使用建議、預算與落地提醒。
- 平面配置為條件式章節；沒有 floor_plan Artifact 時不得生成虛構平面圖。
- 圖片來源必須可追溯至 proposal_media.reference_photos 或 proposal_media.space_photos。
- PDF 應保存 proposal_version、generated_at、project_id、case_code、輸入摘要與生成器版本；正式 SaaS 應保存 checksum、下載授權與 audit event。
- 提案 PDF 屬前期概念 Artifact，不等同施工圖、正式估價單、簽證文件或工程契約。
### R7 新增三：StyleMatch 專案與會員權限控台

- 控台一級功能包含目前方案、StyleMatch 專案、會員與權限。
- StyleMatch 專案內頁集中顯示專案需求內容、圖片及設計提案預覽／PDF 下載。
- 目前方案可導向平台方案價格；MVP 方案切換僅供本地檢視，不得視為正式訂閱或付款成功。
- 會員角色至少包含 Owner、Admin、Designer、Viewer；正式環境由 RBAC API 與 Tenant Context 驗證，不以 localStorage 作授權來源。
### R7 新增四：StyleMatch 與 iSAFE 程序邊界

- StyleMatch 負責需求、圖片、風格、提案與前期媒合資料；iSAFE 負責工程階段、Gate、Evidence、Risk、NCR／CAPA、付款資格、稽核與保固。
- 進入 iSAFE 前必須完成 TWCID 媒合、人工確認、授權範圍確認與正式 Handover。
- iSAFE 接收端成功冪等立案後才回存 isafe_case_id；StyleMatch 前端不得自行推算或預建該識別碼。
- StyleMatch 控台與 iSAFE 控台必須使用明顯不同的標題、說明與操作區塊，避免將前期概念提案誤認為工程監管。
### R7 新增五：AI 空間設計與 360° 環景

- 功能名稱統一為「AI 空間設計與 360° 環景」。
- 輸入沿用專案空間照片、設計提案風格參考圖及所選空間，不要求使用者重複輸入風格 DNA。
- 同一空間可保存多張參考圖；客餐廳等複合空間應以空間群組或多標籤處理。
- 預覽可免費顯示；正式檔案下載須由後端付款結果解鎖，前端不得自行宣告付款完成。
### R7 驗收與發布條件

- StyleMatch 五步需求流程、專案內頁與提案預覽可在本地端完成。
- 提案 PDF 能輸出 A4 多頁文件，中文字與圖片渲染正常；平面圖章節依資料有無決定。
- StyleMatch 與 iSAFE 控台有明確視覺、權責與識別碼邊界。
- 本版仍不得標示 Final Official；正式 SaaS 發布前須完成後端身分、付款、Artifact Storage、Audit、Checksum、AI Trace 與部署驗收。

## R7.1 StyleMatch Implementation QA Integration（2026-08-04）

TIGI Business Plan Master｜20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

本節承接 20260730_R7_Implementation_Integrated，整合 2026-08-03 程式稽核、API／資料契約與 ComfyUI 端到端證據。本次為非破壞性 R7.1 實作 QA 更新，不變更既有治理標準與付款基線。

### 一、已驗證的本地實作與契約

- 2026-08-03 程式逐項稽核確認五步需求流程、提案組稿、條件式平面圖、專案識別碼邊界、參考圖片版本、確認圖組及成功才扣點的冪等交易均具本地實作證據。
- 案件 API 必須帶 Authorization、Tenant／Organization、Purpose、Consent、Trace、X-Server-Role、X-Case-Role 與 X-Case-Authorization；寫入另需 Idempotency-Key，案件角色與範圍由伺服端驗證。
- project_id 與 case_code 由 StyleMatch 建立；twcid_match_id 由 TWCID 回存；isafe_case_id 僅能由 iSAFE 成功接收正式 Handover 後回存。離線識別碼不得成為正式欄位。
- analysis 使用 stylematch.analysis.v1，包含 deterministic 風格分布、confidence、reasons、evidence、預算區間與 risk_flags；八字或星座僅為選填文化偏好，權重不得高於 5%。
- 圖片修改必須新增 reference_revision，不得覆寫既有版本；正式提案只能引用版本化且已確認的 confirmed_reference_set。
- 點數交易以 project_id + confirmed_reference_set_id 為冪等範圍，提案生成成功才扣點；失敗不得寫入 completed ledger。
- ComfyUI 端到端驗收已在本地完成：任務 aitask_f9151649-aef4-4509-88cb-4d4674ee3bb2，workflow stylematch-sdxl-v1，checkpoint sd_xl_base_1.0.safetensors，輸出 SHA-256 759843FA277EC6109B6B2FD8EEE34D6C778F7007632B017C2BED684BB6C3F055。
- 上述證據最高僅證明 LOCALLY_IMPLEMENTED／PASS-LOCAL；不等於治理核准、發布整合、Production Deployment 或 Final Official。
### 二、治理與成熟度矩陣

| 範圍 | 證據 | 成熟度／核准 | R7.1 判讀 |
| --- | --- | --- | --- |
| GS-01～30 | PASS 30/30 | RELEASE_INTEGRATED | 沿用 R7 已核准治理基線 |
| iSAFE-DGM-01～24 | PASS 24/24 | PENDING | 來源完整；治理核准與發布整合未完成 |
| DGI 411 | PASS 411/411 | PENDING | 來源完整；治理核准與發布整合未完成 |
| StyleMatch 五步需求／提案 | PASS-LOCAL | LOCALLY_IMPLEMENTED | 本地程式與稽核證據存在 |
| AI 圖片任務／ComfyUI | PASS-LOCAL | LOCALLY_IMPLEMENTED | 8188 端到端本地驗收通過 |
| Identity／Payment／Artifact／Audit | PARTIAL | SPECIFIED | 正式環境成品與驗收仍為 blocker |

### 三、本母本的獨立判讀控制

- 商業敘述可將 StyleMatch 提案與 AI 圖片流程列為本地產品基線，但不得宣稱正式訂閱、正式扣款或企業 Production 上線。
- Payment Eligibility、Download Entitlement、Checkout Session 與 Payment Execution 必須分離，前端不得自行標示付款完成。
- iSAFE 案件成立只接受正式 Handover 回傳，避免把 StyleMatch 專案量誤列為受監管案件量。
### 四、Final Official Release Blockers

| 編號 | 發布阻擋 |
| --- | --- |
| 1 | 正式 OIDC/OAuth 2.1、SSO、MFA 與後端 RBAC/ABAC。 |
| 2 | 正式 Artifact Storage、PDF checksum、下載授權與不可竄改 Audit Storage。 |
| 3 | 完整 AI Trace Registry、input/output hash 與 production model governance。 |
| 4 | Stripe production payment、webhook 部署與付款驗收。 |
| 5 | DGM 24 與 DGI 411 的治理核准及正式發布整合。 |
| 6 | Production deployment acceptance、Git tag／Release 與正式發布決策。 |

發布結論：R7.1 Implementation QA Baseline = GO；Final Official = NO GO；final_official_allowed=false。


## R7.2 Style／Proposal／Vision／Commercial QA Integration（2026-08-10）

TIGI Business Plan Master｜20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

本節承接 20260804_R7_1_Implementation_QA_Integrated，整合 30 種設計風格、deterministic 分析、CLIP Vision、平面圖驅動提案、會員可見性、單次購買範圍與商業點數交易。本次不變更 R5.2 案件狀態機、GS／DGM／DGI 或 Payment Eligibility 基線。

### 一、Release Control 與版本判讀

| 控制欄位 | R7.2 值 | 判讀 |
| --- | --- | --- |
| Version | 20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated | 四份母本唯一共同版本 |
| Document Set | TIGI-4MASTER-20260810-R7.2-SPVC-QA-01 | DOCX／PDF／MD／JSON 同步 |
| Implementation QA | GO | 本地功能與文件整合通過 |
| Final Official | NO GO | final_official_allowed=false |

### 二、30 種風格與 CLIP Vision 技術基線

- 30 種 canonical style catalog、別名遷移與 shared schema 已完成本地驗證；Chill 輕鬆風與飯店精品風採單一正式命名。
- StyleAnalysisEngine 與 BudgetEngine 採 deterministic 輸出，ProposalReport 顯示風格分布、信心、理由、預算區間、風險、Tone & Manner 與三種方案方向。
- CLIP Vision 使用 openai/clip-vit-large-patch14，固定 revision 32bd64288804d66eefd0ccbe215aa642df71cc41，向量維度 768，30 種風格文字向量與圖片 embedding 契約已驗證。
- 模型相似度只提供排序、margin 與輔助證據；低信心結果不得自動接受，必須經人工確認，不得成為治理、法遵、付款或案件核准依據。
### 三、會員、方案與工具可見性

| 角色／方案 | 可使用範圍 | 限制 |
| --- | --- | --- |
| 一般會員 | 首頁、風格測驗、AI 裝修提案、我的專案、方案價格 | 不顯示商業工具 |
| 單次購買方案 | 空間需求整理、裝修預算配置、設計理念／風格參考照片／材料方向 | 不建立點數權限 |
| 商業方案 Pro／Team | 一般會員功能 + 平面圖視覺化、空間與 360°、提案圖確認 | 進階操作依交易扣點 |
| 直接網址存取 | FloorPlanVisualizer、AIGenerate、ReferenceCanvas | BusinessAccessGate 伺服前路由閘門 |

### 四、提案工作區與功能責任邊界

- 產品工作區順序固定為：提案總覽 → 平面圖 AI 視覺化 → 空間與 360° → 提案圖確認 → TWCID 媒合 → 簽約後 iSAFE 2.0。
- 平面圖 AI 視覺化負責上傳與分析、風格鳥瞰、遮罩區域重繪、相機位置／朝向／FOV 與指定視角空間圖；輸出是 AI 概念提案，不是施工圖或精準 3D 模型。
- 提案圖確認只負責 reference_revision 候選版本、比較、採用與 confirmed_reference_set；遮罩與區域重繪不得放入提案圖確認頁。
- 一般會員固定可見五個入口；商業會員登入後才顯示單一『商業工具』選單，內含三個進階工具。直接網址仍由 BusinessAccessGate 防護。
### 五、商業點數交易基線

| 功能 | 交易 type | 點數 | 資格 | 扣點時點 |
| --- | --- | --- | --- | --- |
| 平面圖鳥瞰生成 | floorplan_birdseye | 10 | 商業方案 | 成功後扣點 |
| 遮罩區域重繪 | floorplan_region_redraw | 5 | 商業方案 | 成功後扣點 |
| 指定視角空間圖 | floorplan_room_view | 10 | 商業方案 | 成功後扣點 |
| 提案候選圖片改版 | reference_image_revision | 5 | 商業方案 | 成功後扣點 |
| 空間創意彩現 | space_image_generation | 10 | 商業方案 | 任務建立成功後扣點 |
| 360° 環景生成 | space_panorama_generation | 15 | 商業方案 | 任務建立成功後扣點 |
| 正式圖像提案 | proposal_generation | 30 | 商業方案 | 成功後扣點；同一確認版本冪等 |

治理注意：點數 ledger 是商業功能消耗紀錄，不是工程 Payment Eligibility、發票或付款執行證據。

### 六、治理不變項與成熟度

- R7.2 不改寫 S1／D1～S10／C5、TIGI-GS-01～30、iSAFE-DGM-01～24、DGI 411 或 isafe-state-machine-r5.2.json。
- Gate PASS 不等於 Payment Eligibility；Payment Eligibility 不等於 Payment Approval、Invoice 或 Payment Execution。商業點數 ledger 亦不得替代工程付款治理。
- 所有 point-consuming action 必須在 UI 與 localStore 資料層同時檢查商業資格、專案、餘額與交易資料；交易寫入 point_ledger，使用 idempotency_key 防止重複扣點。
- 本版證據最高為 LOCALLY_IMPLEMENTED／PASS-LOCAL；Implementation QA = GO，不代表 Governance Approved、Release Integrated、Production Deployed 或 Final Official。
### 七、本母本的獨立判讀控制

- 單次購買方案 NT$2,999 僅包含空間需求整理、裝修預算配置、設計理念／風格參考照片／材料方向，不含點數與進階生成工具。
- 商業方案 Pro／Team 才建立進階工具資格；點數價格是 R7.2 本地產品基線，正式定價、稅務、退款、SLA 與金流仍須獨立核准。
- 一般會員保留『我的專案』入口；商業工具採一個下拉入口，降低首頁與導覽決策負擔。
### 八、Final Official Release Blockers

| 編號 | 發布阻擋 |
| --- | --- |
| 1 | 正式 OIDC/OAuth 2.1、SSO、MFA 與後端 RBAC/ABAC／entitlement。 |
| 2 | 伺服端點數帳本、交易鎖、失敗補償、退款、對帳、稅務與正式金流驗收。 |
| 3 | Artifact Storage、PDF／圖片 checksum、下載授權與不可竄改 Audit Storage。 |
| 4 | AI Trace Registry、input/output hash、模型供應者 registry、模型風險與 production acceptance。 |
| 5 | DGM 24 與 DGI 411 的治理核准、正式發布整合與 Production deployment acceptance。 |
| 6 | Git commit／tag／push、GitHub Release、SHA256 package 驗證與 Final Release Decision。 |

發布結論：R7.2 Implementation QA Baseline = GO；Final Official = NO GO；final_official_allowed=false。


## R8 StyleMatch AI／iSAFE 2.0 Integrated Baseline（2026-08-13）

TIGI Business Plan Master｜20260813_R8_StyleMatch_iSAFE_Integrated｜TIGI-GOVERNANCE-20260813-R8-SM-ISAFE

本節承接 R7.2 Style／Proposal／Vision／Commercial QA 基線，將 StyleMatch AI 前期規劃、TWCID 識別邊界、iSAFE 2.0 簽約後治理、local-api 與可信知識索引整合成同一網站版本。R8 不改寫 R5.2 狀態機或既有治理 registry。

### 一、Release Control 與獨立判讀

| 控制欄位 | R8 值 | 判讀 |
| --- | --- | --- |
| Version | 20260813_R8_StyleMatch_iSAFE_Integrated | 四份母本與網站共同版本 |
| Document Set | TIGI-4MASTER-20260813-R8-SM-ISAFE-01 | DOCX／PDF／MD／JSON 同步 |
| State Authority | 20260722_R5_2 | R8 不建立新狀態語意 |
| Implementation QA | GO | 本地測試與文件整合通過 |
| Final Official | NO GO | final_official_allowed=false |

### 二、網站與服務基線

| 模組 | 版本／日期 | 可驗證基線 | 成熟度 |
| --- | --- | --- | --- |
| StyleMatch AI | 8.0.0 | 30 canonical styles；deterministic analysis；30 local quiz images | PASS-LOCAL |
| Style reference dataset | 2026-08-13 | 815 synthetic ComfyUI PNG／30 styles；僅作研發與測試資料 | LOCALLY_AVAILABLE |
| iSAFE 2.0 | 20260813_R8_StyleMatch_iSAFE_Integrated | R8 release contract；13 navigation items；雙方執行前檢核 | PASS-LOCAL |
| local-api | 20260722_R5_2 | 十階段狀態機；Evidence Gate；Payment Eligibility 分離 | PASS |
| Knowledge corpus | schema 4.0 | R8 四母本＋README＋API annex；產製後重建 | PASS |


### 三、跨產品識別、授權與同步邊界

- case_code 是跨產品顯示識別；twcid_match_id 只在 TWCID 媒合成立後建立；isafe_case_id 只在 iSAFE 正式立案後建立。StyleMatch 前期專案不得預先虛構後兩者。
- 受保護案件 API 必須驗證 X-Server-Role、X-Case-Role 與 X-Case-Authorization；開發環境萬用授權只允許搭配本機 token，不得成為 production 預設。
- local-api 4180 無法連線時可使用 localStorage MVP，但 fallback 必須標記 local source；重新連線後以 revision 衝突規則處理，不得覆寫較新的伺服端資料。
- StyleMatch、TWCID 與 iSAFE 的 Journey／Handover／Audit 必須保留 trace、來源、時間、版本與人工決定，不得只靠畫面狀態推定。
### 四、iSAFE 狀態機與治理不變項

- R8 是 StyleMatch AI 與 iSAFE 2.0 的產品整合基線，不建立新的案件狀態語意；iSAFE 執行權威仍是 20260722_R5_2 與 isafe-state-machine-r5.2.json。
- S1／D1～S10／C5、TIGI-GS-01～30、iSAFE-DGM-01～24、DGI 411、九類命名空間及 82 項 D1-C5 checklist 全數沿用。
- Gate PASS 不等於 Payment Eligibility；Payment Eligibility 不等於 Payment Approval、Invoice 或 Payment Execution；商業點數 ledger 亦不得替代工程付款治理。
- DGM 24/24 與 DGI 411/411 代表來源完整，不代表 GOVERNANCE_APPROVED、RELEASE_INTEGRATED 或 PRODUCTION_DEPLOYED。
- R6.1 Canonical Contract 暫作 registry semantic baseline；正式 R8 Canonical Contract 未經治理核准前，不得宣稱 R8 已取代 R6.1 語意契約。

### 五、Style Dataset、Vision 與人工確認

- 30 種 canonical style catalog 與 30 張快速測驗本地圖片已通過驗證；StyleAnalysisEngine、BudgetEngine 與 ProposalReport 保持 deterministic 輸出。
- 本地 ComfyUI synthetic dataset 目前有 815 張 PNG、涵蓋 30 種風格；各風格數量不完全相等，因此只能標示 LOCALLY_AVAILABLE，不得直接宣稱 balanced production training set。
- openai/clip-vit-large-patch14 固定 revision 32bd64288804d66eefd0ccbe215aa642df71cc41、768 維；相似度僅作排序與輔助證據，低信心必須人工確認。
- 合成圖、快速測驗圖與正式客戶上傳圖必須分開保存來源、授權、prompt、seed、模型、checksum 與用途；進入 production 前仍需完成內容授權與品質抽驗。
### 六、可信知識索引

- R8 知識索引 schema 4.0 將產品 release version、index schema version 與 state contract version 分開顯示。
- 正式 R8 corpus 由四份 R8 母本、R8 README 與 R8 API／資料契約附錄構成，共六份來源；任何搜尋結果都必須保留 sourceUrl、documentId、heading 與版本。
- Knowledge view 是唯讀判讀入口，不是治理核准介面；回答不得將較舊 R7／R7.2 章節誤判為目前 release decision。
### 七、Implementation QA 證據矩陣

| 驗證項 | 證據 | 結果 |
| --- | --- | --- |
| Style catalog | 30 styles | PASS |
| Style analysis / proposal migration | deterministic | PASS |
| Offline image style fallback | confidence cap 35% | PASS |
| Style test image manifest | 30 local images | PASS |
| TypeScript | tsc -p jsconfig.json | PASS |
| Vite production build | 2,604 modules | PASS；bundle size warning |
| iSAFE R8 website tests | 4 passed / 0 failed | PASS |
| local-api tests | 3 passed / 0 failed | PASS |


### 八、本母本的獨立判讀控制

- R8 保留 R7.2 單次購買與商業點數方案；本次產品整合不自動變更價格、權益、退款、稅務或 SLA。
- StyleMatch 前期規劃、TWCID 媒合與 iSAFE 簽約後治理形成可追溯漏斗，但三階段的責任、資料與收入認列不得合併。
- 815 張合成圖是研發資產，不直接等同可商用素材庫；正式商業使用需另有來源、授權、品質與品牌政策。
### 九、Final Official Release Blockers

| 編號 | 發布阻擋 |
| --- | --- |
| 1 | 正式 R8 Canonical Contract、ADR 與 435 項 DGM／DGI 治理核准。 |
| 2 | 正式 OIDC/OAuth 2.1、SSO、MFA、後端 RBAC/ABAC／entitlement 與租戶隔離。 |
| 3 | 伺服端點數帳本、交易鎖、退款、對帳、稅務、正式金流與 Payment 執行整合。 |
| 4 | Artifact Storage、PDF／圖片 checksum、下載授權與不可竄改 Audit Storage。 |
| 5 | AI Trace Registry、input/output hash、模型與資料集 registry、授權及 production acceptance。 |
| 6 | Git commit／tag／push、GitHub Release、SHA256 驗證與 Production deployment acceptance。 |

發布結論：R8 Implementation QA Baseline = GO；Final Official = NO GO；final_official_allowed=false。


## R9／Patent V7 治理對齊基線（2026-08-14）

TIGI Business Plan Master｜20260814_R9_Patent_V7_Governance_Aligned｜TIGI-GOVERNANCE-20260814-R9-PATENT-V7

本節以 R8 四份完整母本為內容底座，整合分享頁取得之 R8.2 Agent Governance Parent Source，以及本地 verified R9／Patent V7 source package。未重述的 R8 章節持續有效；R9 是加法式治理對齊，不刪除或改寫既有內容。

| 控制欄位 | R9 判讀 | 約束 |
| --- | --- | --- |
| Version／Release | 20260814_R9_Patent_V7_Governance_Aligned | TIGI-GOVERNANCE-20260814-R9-PATENT-V7 |
| Document Set | TIGI-4MASTER-20260814-R9-PATENT-V7-01 | 四份 DOCX／PDF／MD／JSON |
| Lineage | R8 full master + 20260813_R8_2_AGENT_GOVERNANCE_INTEGRATED + Patent V7 | R8.2 為增量來源，不是四母本替代檔 |
| State Authority | 20260722_R5_2 | S1／D1-S10／C5 與正式轉換語意不變 |
| Source status | IMPLEMENTATION_GOVERNANCE_QA_BASELINE | verified alignment package |
| Local conformance | CONDITIONAL | 存在版本、manifest 與資料集缺口 |
| Final Official | NO GO | final_official_allowed=false |

### 版本權威與非覆寫規則

- Patent V7 定義保護範圍、治理原則與權限邊界；不單獨授權 production state transition。
- R9 為 R8.2 的治理對齊層；R8.2 又是 R8 的 Agent Governance 增量，未重述內容仍回到 R8 完整母本。
- 衝突時採 Canonical Contract／Accepted ADR／Approved Registry／R5.2 State Machine 優先；敘述文件不得覆寫 machine-readable authority。

## R9 上位架構與權限邊界

### Canonical execution chain

User／Website／API → Tenant Resolver + Auth／RBAC-ABAC → Project Context → Skill Router → Application RAG／Governance Trusted Knowledge + Tool Policy → Tools／Image／Proposal／External Evaluation → AI Recommendation／Evaluation Input → Cross-Document Consistency + Evidence + Risk State + Trigger Rules → Notification／Escalation／Pending Action → Human／Authorized Role → Governance Decision Object → Governance Gate + R5.2 State Machine → Formal Governance Event → Audit Output／PGP

| Domain | 版本 | 允許責任 | 禁止事項 |
| --- | --- | --- | --- |
| StyleMatch AI Product | v8.1.0 target | 產品流程、Style DNA、需求、平面圖／影像、提案、核准資產、handoff | 不得操作 Gate 或寫正式治理狀態 |
| Agent Platform | R3.2 | 檢索、評估、查詢、受控工具、建立 handoff object | 不得繞過 Tool Policy／Authority |
| iSAFE Governance | R9 | 唯一正式治理 decision、transition、event、official audit output domain | 不得繞過 R5.2 State Authority |
| R5.2 State Machine | 20260722_R5_2 | 正式狀態與 Gate authority | R9 不得直接重編 S1-S10 |

### 不變治理基線

- TIGI-GS-01～30、iSAFE-DGM-01～24、DGI 411 與 Payment Eligibility 責任分離持續有效。
- Gate PASS 不等於 Payment Eligibility；Payment Eligibility 不等於 Payment Approval、Invoice 或 Payment Execution。
- StyleMatch Project State 不等於 iSAFE Governance State；handoff object 不等於 Governance Decision Object。

## R8.2 Agent Governance 繼承內容

### R8.2 正式增量

| 模組 | R8.2 規格 | R9 延伸 |
| --- | --- | --- |
| Agent Tool Governance | tenant／project／role／state／risk／tool_policy 驗證；保留 tool_trace | 加入 governance_effect、trigger_rule_ref、risk_state_ref、human_review_required |
| Multi-tenant context | tenant_id + project_id + role_id；禁止跨租戶 RAG、Tool Result、Project Memory | 治理物件與外部評估同樣受 tenant/project scope 約束 |
| Governance Handoff | 僅 approved／versioned／trusted artifacts 形成 handoff_object | StyleMatch、BIM、ERP、CRM、採購等皆可作第一資訊系統 |
| Dual-layer RAG | Application RAG 與 Governance Trusted Knowledge 分離 metadata、權限與 trust state | Knowledge Gap／Pending Review 可觸發通知與升級 |
| Cross-document consistency | Requirement → Specification → Contract → Execution → Evidence → Acceptance → Payment | 異常可作 Risk／Trigger／Gate input，不直接轉換狀態 |

### Canonical objects carried forward

- agent_context、governance_context、skill_route、knowledge_trace、tool_trace、consistency_anomaly、ai_recommendation、handoff_object。
- Approved Asset、Immutable Proposal Snapshot 與 Handoff Object V2 皆為下位實作物件；正式效力仍由 iSAFE 治理鏈形成。
- 聊天草稿、失敗生成、未核准圖片與暫存 Prompt 不得直接成為正式 Evidence。

## Patent V7 四類治理物件

| Canonical object | Minimum contract | Governance effect |
| --- | --- | --- |
| governance_risk_state | risk_state_id、tenant_id、project_id、risk_level、source/event/evidence refs、required_action、resolution_condition、rule_version | 治理風險輸入；不得直接變更正式狀態 |
| governance_trigger_rule | trigger_rule_id、rule_version、condition、effect、responsible_role、deadline、required_action、resolution_condition、escalation_policy | 產生事件、待辦或 Gate input；正式轉換仍需 Decision Object |
| governance_audit_output | audit_output_id、snapshot_time、state/gate/decision/evidence/risk refs、pending_actions、integrity_hash、previous_audit_ref | 不可變快照；補正不得覆寫原治理事件 |
| external_governance_evaluation | evaluation_id、provider、service/version、input/output refs、type、confidence、validation_status、created_at | 外部 AI、規則或專家服務僅提供治理輸入 |

### Risk／Trigger vocabulary

Risk State：NORMAL、WARNING、RESTRICTED、HOLD、BLOCKED、ESCALATED、RESOLVED。

Trigger Result：ALLOW、WARN、CONDITIONAL、RESTRICT、HOLD、BLOCK、ESCALATE。

- 每個 Trigger Result 應建立治理事件或 pending action，並綁定 responsible_role、deadline、required_action、resolution_condition 與 escalation_policy。
- Risk／Trigger／External Evaluation 不得直接執行 Gate PASS、風險解除、履約資格、付款資格或付款執行。
- Audit Output 應能重建指定時間點的 State、Gate、Risk、Evidence、Decision、責任與待辦，並保留 integrity hash／previous audit chain。

## 治理知識、通知、稽核與付款分離

### Trusted Knowledge／Knowledge Gap

- Application RAG 與 Governance Trusted Knowledge 可共用檢索基礎設施，但 metadata、trust state、法域、版本、權限與用途必須分離。
- 外部搜尋或未驗證資料先進 Candidate Knowledge；不足、衝突或版本不確定時建立 Knowledge Gap／Pending Review。
- Governance Decision Object 必須保留 Knowledge、Evidence 與 Rule Version 參照，支援可追溯重建。
### Notification／Escalation

- Risk State、Trigger Rule、Evidence 缺漏、Knowledge Gap、逾期與 Gate 異常可形成 Notification Event。
- 通知至少綁定 tenant_id、project_id、event_ref、risk_level、recipient_role、deadline、delivery_status。
- Email、LINE、SMS、App Push、Webhook 僅是 Delivery Adapter；通知或升級事件本身不具正式狀態轉換權。
### Payment／Authority separation

AI 建議、外部評估、Risk、Trigger、治理判定、履約資格、付款資格、付款核准、Invoice 與 Payment Execution 必須保持可追溯責任分離。


## StyleMatch v8.1.0 與本地實作 QA

### Unified AI image task contract

- 統一 output types：reference_image_revision、floorplan_birdseye、floorplan_region_redraw、floorplan_room_view、style_test_reference。
- 請求帶入 tenant、organization、user、member tier、case role、server role、case authorization、purpose、consent、trace 與 idempotency key。
- 正式 API／ComfyUI 結果標記 authoritative=true；local SDK fallback 必須明示為非權威候選資產。
- 遮罩／區域重繪屬提案圖修正流程；平面圖視覺化負責鳥瞰、空間與視角生成，不混淆功能責任。
### Local QA evidence

| Audit item | Evidence | Result |
| --- | --- | --- |
| R9／Patent V7 來源套件 | 4 份對齊 PDF、Patent V7、MANIFEST、TECHNICAL_ALIGNMENT | PASS |
| R8.2 Parent Source | 分享頁附件已取得並納入來源證據 | PASS |
| R9 machine-readable contract | JSON 可解析；R5.2 authority／Final NO GO | PASS |
| Unified AI image task contract | 5 類 output_type、治理授權標頭、authoritative/fallback 分流 | PASS |
| 30-style catalog／analysis／fallback | 30 styles；deterministic；offline confidence cap 35% | PASS |
| Product version alignment | 來源要求 v8.1.0；package.json 目前為 8.0.0 | PENDING |
| Quick style image manifest | 未完整涵蓋 30 個 canonical style IDs | FAIL |
| Synthetic ComfyUI dataset | 1,460 PNG／manifest rows；目標 1,500 | INCOMPLETE |

判讀：R9 source package 可作工程與治理 QA 基線；本地產品實作尚未完全對齊 v8.1.0，因此 Local Conformance = CONDITIONAL，不能宣告 Final Official。


## R9 驗收條件與本母本判讀

### 共同 acceptance criteria

- R9 不得破壞 R8／R8.2 既有模組、正式治理語意、GS／DGM／DGI 與付款責任基線。
- 四個 Patent V7 物件均須具有 tenant/project scope、唯一識別、版本／來源參照與完整 trace。
- 不得存在 Risk／Trigger／External Evaluation 直接 UPDATE 正式 Governance State 的程式路徑。
- Handoff 與高影響 Tool Call 採 idempotency／request hash，避免重送造成重複正式事件。
- AI Recommendation、Evaluation、Risk／Trigger Result、Pending Review 與 Formal Governance Result 在 UI 與資料語意上分層。
### 本文件的獨立判讀控制

- 商業計畫應區分 StyleMatch Product v8.1.0、Agent Platform R3.2 與 iSAFE Governance R9 的產品責任、資料責任與收入邊界。
- AI 圖像與 Agent 工具可採點數或商業方案，但不得把治理判定、付款資格或正式 Audit Output 當成未經授權的自動化賣點。
- 1,460 張本地合成圖屬研發資產，未完成授權、品質、平衡及 production acceptance 前不得宣稱為正式商用資料庫。
### Final Official blockers

| No. | Required evidence／action |
| --- | --- |
| 1 | 將 StyleMatch AI package version 與正式產品基線同步至 v8.1.0，並完成版本發布證據。 |
| 2 | 修復快速風格測驗 image manifest，使 30 個 canonical style IDs 全部覆蓋並重跑測試。 |
| 3 | 補齊或正式裁決合成資料集 1,460／1,500 的缺口，完成 checksum、授權、品質與資料平衡驗收。 |
| 4 | 將 Patent V7 四個治理物件納入 Approved Registry、JSON Schema、OpenAPI、SQL migration 與 Accepted ADR。 |
| 5 | 完成 Risk／Trigger／Audit Output／External Evaluation 的 API、冪等、權限、事件與回歸測試。 |
| 6 | 完成 production identity、artifact storage、AI trace registry、不可竄改 audit storage 與正式部署驗收。 |
| 7 | 完成 Release Checklist、Manifest、SHA256、Git commit/tag/push 與正式 Release Decision。 |

發布結論：R9 Implementation／Governance QA Baseline 可供規格、實作與驗收規劃使用；Local Conformance = CONDITIONAL；Final Official = NO GO；final_official_allowed=false。


R9.1 SPATIAL DESIGN INTELLIGENCE

## R9.1 商業定位與價值主張

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

| 狀態聲明：本版為 Approved Specification Baseline／Candidate Implementation。未經 Phase 0 Repository Audit、Schema／API／SQL、回歸測試、ADR 與 Release Checklist，不得標示 Implemented、Production Ready 或 Final Official。 |
| --- |

| 客群 | 核心價值 | R9.1 提升 |
| --- | --- | --- |
| 準屋主 | 降低需求與預算表達門檻 | 由風格／提案進一步形成可校正空間母本 |
| 設計專業者 | 提高前期提案效率與版本溝通 | Auto Layout、VE、360、材料／產品與外部工具串接 |
| 平台／企業 | 取得可追溯、可整合的設計資料 | Canonical Object、API、租戶隔離與 Handoff V2 |
| 治理方 | 提案核准後才進正式履約治理 | iSAFE intake 與 State Authority 邊界 |


R9.1 SPATIAL DESIGN INTELLIGENCE

## 產品分層與使用者旅程

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

建議旅程：免費風格測驗 → 單次 AI 裝修規劃與設計提案 → 我的專案 → 商業會員空間工作區 → 設計師媒合 → 簽約後 iSAFE 2.0。

| 階段 | 一般使用者 | 商業會員／專業者 |
| --- | --- | --- |
| 入口 | 免費 30 種風格測驗 | 登入後專案總覽 |
| 單次提案 | 需求、預算、理念、參考照片、材料方向 | 可承接既有專案資料 |
| 空間深化 | 不預設開放扣點工具 | 平面圖視覺化、空間與 360、提案圖確認 |
| 治理移交 | 媒合與簽約後進入 | Approved Snapshot＋Handoff V2 → iSAFE |

- 一般 user 仍有「我的專案」；自由畫布／平面圖視覺化／空間與 360 不在公開選單造成干擾。
- 遮罩與區域重繪屬提案圖確認／Visual Editing，不放在平面圖 AI 視覺化編輯器的核心流程。

R9.1 SPATIAL DESIGN INTELLIGENCE

## 商業方案與扣點邊界

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

| 方案 | 包含 | 升級／扣點原則 |
| --- | --- | --- |
| 免費 | 風格測驗、基礎結果、我的專案 | 不執行高成本生圖／空間運算 |
| 單次購買 | 空間需求、裝修預算配置、設計理念、風格參考照片、材料方向 | 僅交付一次 AI 裝修規劃與設計提案 |
| 商業方案 | 平面圖、StructuredSpace、Auto Layout、VE、360、外部工具、材料／產品 | 凡扣點功能均需商業方案；點數紀錄成本與用量 |
| 企業／API | 租戶、權限、整合、SLA、治理 handoff | 依席次、用量、API、儲存與服務分級 |

- 扣點不等於付款資格，也不等於 iSAFE 工程付款；兩者分屬產品計費與治理付款領域。
- 點數扣除須有 idempotency、cost observation、task／asset trace 與失敗補償政策。

R9.1 SPATIAL DESIGN INTELLIGENCE

## 空間智能產品組合

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

| ID | 模組 | 輸入 | 可驗收輸出 | 狀態 |
| --- | --- | --- | --- | --- |
| SS-01 | StructuredSpace | 平面圖／影像／人工校正 | 版本化空間快照 | Candidate |
| AL-01 | Auto Layout | 空間快照／規則／需求 | 候選配置＋違規清單 | Candidate |
| VE-01～10 | Visual Editing | 意圖／遮罩／參考／約束 | 可追溯圖像修訂 | Candidate |
| EDT-01 | External Tool Connector | Scene／Camera／Viewport | Canonical refs／assets | Candidate |
| MVC-01 | Multi-view／360 | Anchor／Camera Plan | 一致性 ViewSet | Candidate |
| MPI-01 | Material／Product | 空間／風格／預算／型錄 | 選材與價格觀測 | Candidate |

- VE-01～10 共用單一 Image Editing Pipeline，不建立十套彼此分裂的後端。
- Auto Layout 由 LLM 提出候選與排序，硬性尺寸、碰撞、開門、淨距與動線由確定性規則／幾何引擎判斷。
- 所有 Candidate Artifact 必須帶 tenant_id、project_id、版本、來源、trace、假設、警示與 approval_state。

R9.1 SPATIAL DESIGN INTELLIGENCE

## 市場進入、夥伴與收入引擎

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

| 收入引擎 | 對象 | 前置條件 |
| --- | --- | --- |
| 單次提案 | 準屋主 | 清楚限制與可交付內容 |
| 商業會員 | 設計師／設計公司 | 穩定空間智能 workflow 與點數成本 |
| 企業 SaaS | 公會／品牌／通路／工程企業 | 租戶隔離、API、SLA、稽核 |
| 材料／產品資料 | 供應商／品牌 | 來源、價格、可用性與揭露政策 |
| Connector／API | SketchUp／外部工具與生態夥伴 | 版本相容、失敗隔離與授權 |

- 先以 StyleMatch 既有前期規劃流量驗證，再擴大 TWCID 媒合與 iSAFE 治理轉換，不把所有決策塞在首頁。
- 商業指標應同時追蹤啟用、提案完成、升級、點數毛利、核准率、媒合與治理移交，不只看生圖次數。

R9.1 SPATIAL DESIGN INTELLIGENCE

## 成本、風險與發布治理

產品組合、商業方案、點數經濟、專業工具、成本與成長路徑

| 風險／成本 | 商業影響 | 控制 |
| --- | --- | --- |
| Vision／Image 變動成本 | 毛利波動 | Provider policy、成本觀測、點數定價、fallback 分級 |
| 品質不一致 | 退款與信任風險 | Candidate／Approved 分離、人工核准、benchmark |
| 外部資料過期 | 選材／價格錯誤 | timestamp、source、status、免責與人工確認 |
| 功能過度承諾 | 法務與品牌風險 | 標示 AI 概念提案，非施工圖／精準 3D／BIM |
| 治理混淆 | 責任與付款爭議 | StyleMatch 計費、iSAFE Governance、Payment Eligibility 分離 |

- v8.2.0 是技術基線／變更規格，未通過 Phase 0 與 E2E 前不得當作已上線功能銷售。
- Final Official 仍為 NO GO；正式商用需版本 manifest、SHA256、監控、SLA、資安與 rollback。

---

## R9.2 統整與單一啟用基線控制

**版本決議。** 本 TIGI Business Plan Master 為 TIGI R9.2 的同版發布文件，完整保留 R9.1 內容並統整版本治理；文件升版不代表 Candidate Implementation 已完成程式實作。

**單一啟用基線。** 只有 `20260820_R9_2_Consolidated` 可用於目前工程、商業、SBIR、白皮書與 RAG 檢索。R8、R9、R9.1 作為歷史發布證據移入 `archive/`，並排除於 active RAG index。

**權威邊界。** R5.2 State Machine 仍是正式狀態權威；Patent V7 維持鎖定；Spatial/Visual 新技術另做 invention disclosure 與 prior-art mapping。

**實作條件。** SS-01、AL-01、VE-01–10、EDT-01、MVC-01、MPI-01 與 Governance Handoff Object V2 在完成 Phase 0 Repository Audit、Schema/API/SQL 驗證、回歸、安全審查、ADR 與 Release Checklist 前，均維持 Candidate Implementation。

**保存與刪除。** 歷史 release package、manifest、checksum、ADR 與來源追溯資料保留。只有位於 canonical release/archive 結構之外，且經 SHA-256 驗證內容完全相同的多餘副本，才可永久刪除。
