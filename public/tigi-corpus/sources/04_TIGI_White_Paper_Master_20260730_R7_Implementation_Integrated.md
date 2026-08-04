# TIGI White Paper Master

- 版本：`20260730_R7_Implementation_Integrated`
- 發布識別：`TIGI-GOVERNANCE-20260730-R7-IMPL`
- 內容基礎：R5.2 State Machine、R5.2.1 GS30 Recovery 與 20260723 Legacy Functional Parity
- 契約保留：20260722_R5.1 Accepted ADR、Master、Annexes 與 canonical contract
- 狀態機修正：20260722_R5.2 State Machine ADR、Master 與 isafe-state-machine-r5.2.json
- 適用範圍：產業倡議、政策溝通、標準推廣與生態系共識
- 發布狀態：R7 Implementation Integrated Baseline；435 筆 DGM/DGI 來源已取得，但治理核准、ID 遷移、正式 SaaS 控制及 GitHub 部署完成前不得標示 Final Official

## 2. 產業問題

設計工程產業的核心缺口不是缺少更多工具，而是缺少跨角色、跨階段、可追溯且可驗收的治理語言。

### R5.2 整合內容與契約

- 本版保留 R5 Final 與 R5.1 全部契約修正，再疊加 R5.2 iSAFE 狀態機；發布狀態仍為 Release Candidate。
- 本文件保留 R5 Final 的完整用途化內容，契約衝突依 R5.2 State Machine ADR 與 R5.1 Accepted ADR 與 canonical contract 修正。
- R6.1 為 Governance Integration Release Candidate；本整合版不得標示 Final Official。
- 「文件目的與適用範圍」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「審計軌跡與版本追溯」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

### 控制與驗收

- 任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 3. 治理基礎建設必要性

TIGI 將標準、識別、資料契約、Evidence、Gate、Audit 與文件體系建成可重複使用的產業基礎。

### R5.2 整合內容與契約

- iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 建立「TIGI-GS-01～30 總表」的 Registry ID、名稱、版本、Owner、有效期間與狀態。
- 「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 本章在「TIGI White Paper Master」中的用途，是把「治理基礎建設必要性」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

## 4. TIGI-GS-01～30

TIGI-GS-01～30 已依 2026-07-13 Version Freeze 原始 Official Edition 完成名稱與用途復原，作為本文件的共同治理基準。

### R5.2 整合內容與契約

- TIGI-GS-01｜案件識別標準：確保每個案件具有唯一 Project ID、流程及版本
- TIGI-GS-02｜角色責任標準：定義業主、設計師、施工單位、審核者的責任與權限
- TIGI-GS-03｜節點進入標準：定義進入下一步驟前必須完成的前置條件
- TIGI-GS-04｜Gate驗證標準：規定 Gate 如何檢查文件、簽核、照片、檢核及付款條件
- TIGI-GS-05｜狀態轉換標準：防止非法跳關，保存操作者與時間
- TIGI-GS-06｜例外處理標準：管理 Fallback、Override、暫停與例外核准
- TIGI-GS-07｜案件資料標準：統一案件必要欄位、代碼與資料型別
- TIGI-GS-08｜參與者與權限標準：管理角色、授權範圍及有效期間
- TIGI-GS-09｜Artifact中繼資料標準：規範圖說、照片、文件的來源、類型及版本
- TIGI-GS-10｜版本與變更標準：新資料不得覆蓋舊版本，必須保留變更原因
- TIGI-GS-11｜治理事件標準：保存誰、何時、對什麼資料、做了什麼操作及結果
- TIGI-GS-12｜交換與互通標準：統一 API Schema、代碼、錯誤碼及交換版本
- TIGI-GS-13｜證據識別標準：每一 Evidence 具有唯一 ID 並關聯案件、步驟及 Gate
- TIGI-GS-14｜完整性標準：保存 SHA-256、檔案大小及完整性驗證資料
- TIGI-GS-15｜採集中繼資料標準：保存時間、來源、裝置及可取得的 EXIF／GPS
- TIGI-GS-16｜證據鏈標準：追蹤上傳、引用、驗證、簽核及封存歷程
- TIGI-GS-17｜簽核與見證標準：保存簽核人、角色、意圖、時間及簽核版本
- TIGI-GS-18｜保存與封存標準：規定保存期限、封存、Legal Hold 及刪除程序
- TIGI-GS-19｜Checklist標準：規定檢核項目、結果、證據、檢查人及版本
- TIGI-GS-20｜不符合事項標準：記錄缺失類型、嚴重度、責任人及改善期限
- TIGI-GS-21｜改善閉環標準：管理改善、複驗及缺失關閉條件
- TIGI-GS-22｜風險評分標準：規範 RiskScore 規則、權重、分數與版本
- TIGI-GS-23｜驗收與交付標準：規範驗收範圍、缺失、簽認及交付清單
- TIGI-GS-24｜保固與結案標準：管理保固期間、維修責任、PGP 及案件封存
- TIGI-GS-25｜合約基線治理標準：確認工程範圍、圖說、估價、工期、付款及變更基準一致
- TIGI-GS-26｜工項與施工期別治理標準：將個案工項配置至第一、二、三期工程施工及對應責任角色
- TIGI-GS-27｜付款節點與資格治理標準：規範 Gate、驗收、追加減、保留款及付款資格間的關係
- TIGI-GS-28｜數位治理手冊綁定標準：規範 24 張手冊如何綁定步驟、工項、Evidence 及 Gate
- TIGI-GS-29｜AI輔助治理標準：規範 AI 模型版本、輸入輸出、人工確認及不得取代專業判斷
- TIGI-GS-30｜消費者旅程與資料回饋標準：規範 StyleMatch AI、TWCID、iSAFE 及成果回饋的資料串聯與使用限制

### 控制與驗收

- 本文件中的 TIGI-GS 名稱與用途必須與復原 Registry 30/30 一致。
- Gate 通過只代表治理條件成立，不等於 Payment Eligibility、Invoice、付款核准或付款執行。
- 後續變更必須以 ADR、新版 Registry 與跨格式一致性驗證處理。

## 5. iSAFE-DGM-01～24

維持 iSAFE-DGM-01～24 為室內裝修數位治理手冊範圍，以 Registry 管理名稱、適用步驟、工項與版本。

### R5.2 整合內容與契約

- iSAFE-DGM Registry 共 24 個穩定 ID，來源完整 24/24；目前均待治理核准與發布整合。
- 本文件只引用命名範圍、流程角色與待補狀態，不虛構治理手冊名稱或正文。
- 權威內容補入後必須完成版本、來源、核准與三格式一致性檢查。

### 控制與驗收

- 「iSAFE-DGM-01～24 命名」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

## 6. DGI 與可追溯題碼

維持 411 個 DGI 唯一題碼資產，題目正文以權威題庫為準，不在主文件重複貼入尚未核准發布的逐題正文。

### R5.2 整合內容與契約

- DGI 411 題來源完整；目前狀態為 SOURCE_FOUND_PENDING_GOVERNANCE_APPROVAL，並保留 DGI-001～411 legacy alias。
- 題碼不得因文字修訂重用；改題建立新版本，停用題目保留歷史狀態。
- 不得改寫權威題庫，亦不得宣稱 411 題的治理核准與正式發布整合已完成。

### 控制與驗收

- 「411 題 DGI 題碼策略」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

## 7. 九類命名空間

凍結九類命名空間 TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA，避免文件與系統另創同義代碼。

### R5.2 整合內容與契約

- 建立「九類命名空間」的 Registry ID、名稱、版本、Owner、有效期間與狀態。
- 「PM / G / WI 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 「EVD / NCR / CAPA 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 本章在「TIGI White Paper Master」中的用途，是把「九類命名空間」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「九類命名空間」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「PM / G / WI 編碼」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 8. 消費者旅程

跨產品旅程由 journey_id 串聯 StyleMatch、TWCID、正式 Project、iSAFE 與 DEOS，不以 Email 或手機當主鍵。

### R5.2 整合內容與契約

- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「消費者旅程資料回饋模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「工程案例流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。
- 「附錄 E：資料回饋迴圈」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「TIGI White Paper Master」中的用途，是把「消費者旅程」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「消費者旅程資料回饋模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

## 9. StyleMatch AI

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

### R5.2 整合內容與契約

- 高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。
- AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。
- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「StyleMatch AI 前端事件」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

### 控制與驗收

- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 10. TWCID

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

### R5.2 整合內容與契約

- TWCID 擁有會員、內容、match_case_id、候選、邀標／招標、媒合決策、成交、評價及授權快照；AI 能力由 StyleMatch AI API 提供。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「TWCID 媒合資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 本章在「TIGI White Paper Master」中的用途，是把「TWCID」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「TWCID 媒合資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 11. iSAFE 2.0

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

### R5.2 整合內容與契約

- S1／D1 前置作業（設計）、S2／D2 平面設計規劃。
- S3／D3 基本設計規劃定案、S4／D4 立面設計定案。
- S5／D5 施工大樣及其他約定事項、S6／C1 前置作業（工程）。
- S7／C2 第一期工程施工、S8／C3 第二期工程施工。
- S9／C4 第三期工程施工、S10／C5 保固修繕及售後服務。
- Intake／Handover 在 D1 前，Closed／Archived 在 C5 後；各 Stage 綁定 required_evidence、Gate、Owner、版本與 Audit。

### 控制與驗收

- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「iSAFE 2.0 個案治理資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 12. 資料回饋迴圈

資料回饋僅交換經授權、最小必要、可追溯的結構化結果，不將客戶資料默認送入模型訓練。

### R5.2 整合內容與契約

- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「資料回饋迴圈」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 「附錄 E：資料回饋迴圈」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「TIGI White Paper Master」中的用途，是把「資料回饋迴圈」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「資料回饋迴圈」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。
- 「附錄 E：資料回饋迴圈」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 13. Gate 不等於自動付款

Gate 結果統一為 Passed、Failed、Conditional、Waived；通過最多建立 Payment Eligibility，不會自動付款。

### R5.2 整合內容與契約

- Passed 必須具備 Stage 指定 Evidence；Waived 必須有權限、理由、期限及事後覆核。
- Waived 的執行欄位至少包含 authority、reason、未來 expires_at、missing evidence、actor 與 trace。
- GateEvaluated 不建立 Payment Eligibility；資格由獨立契約里程碑評估產生。
- PaymentEligibilityChanged 不等於 Invoice、Payment Approval 或付款執行。

### 控制與驗收

- 「Gate 判定與付款資格」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「付款資格資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 14. AI 輔助治理邊界

正式 Risk Score 僅由可解釋規則與授權角色核定，AI 只能提供風險提示與來源證據。

### R5.2 整合內容與契約

- 高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。
- AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。
- iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。
- 「Risk Weight 專業審查邊界」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。
- 「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「AI 輸出限制」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

### 控制與驗收

- 「Risk Weight 專業審查邊界」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 15. GS-25～30 的產業意義

GS-25～27 分別管制 Contract Baseline、工項／施工期別、付款節點與付款資格。

### R5.2 整合內容與契約

- 「GS-25～27 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「GS-28～30 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「合約基線資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「工項期別資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 本章在「TIGI White Paper Master」中的用途，是把「GS-25～30 的產業意義」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 「GS-28～30 技術母本定位」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 16. As-Is / To-Be

區分現況、12 個月交付與 36 個月產品成熟度，避免把 Future Concept 誤列為本期承諾。

### R5.2 整合內容與契約

- 「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 就「Website Gap Audit」而言，Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。
- 就「Mock / Adapter 邊界」而言，Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。
- 本章在「TIGI White Paper Master」中的用途，是把「As-Is / To-Be」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「Website Gap Audit」驗收時，公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

## 17. Future Concept

區分現況、12 個月交付與 36 個月產品成熟度，避免把 Future Concept 誤列為本期承諾。

### R5.2 整合內容與契約

- 「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「TIGI White Paper Master」中的用途，是把「Future Concept」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 18. 標準化與互通

互通建立在穩定 ID、版本化 Schema、公共 API、Canonical Event 與 Governance Profile，而不是共用單一資料庫。

### R5.2 整合內容與契約

- 狀態機以 isafe-state-machine-r5.2.json 為單一可執行來源；文件、API、UI 與 Migration 必須使用相同 stage code／key／name。
- 互通契約包含 16 個 Canonical Event、28 個 Handover 必要欄位、7 個 Billing 物件、13 個高影響 AI Trace 欄位及 6 個 SaaS Module Flag。
- 共同控制以 C-01～C-08 管理版本、租戶、權限、契約、證據、資料生命週期、文件發布與執行退場。
- 來源完整性已確認為 435/435；標準化仍不等於治理核准或正式發布整合完成。
- Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。
- 「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

### 控制與驗收

- 公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。
- 遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

## 19. 產業落地路線

落地由真實高頻場景與既有平台開始，採 Modular Monolith 加獨立 AI／Governance Service 漸進部署。

### R5.2 整合內容與契約

- 導入須先完成 legacy mapping、正式資料庫備份、遷移覆核、rollback 與 production smoke test。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「TIGI White Paper Master」中的用途，是把「產業落地路線」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。
- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 20. 治理成果衡量

治理成果以流程可重建、Evidence 完整、權限正確、AI 可追溯、例外可覆核及產業採用阻力衡量。

### R5.2 整合內容與契約

- iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「驗證與測試清單」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「TIGI White Paper Master」中的用途，是把「治理成果衡量」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。
- 「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 21. R6 可信治理實作證據與適用邊界

R6 以本地可執行系統驗證治理標準可落地，同時維持 Gate、付款資格、付款核准與付款執行的責任分離。

### R5.2 整合內容與契約

- 本地實作契約為 20260723_R5_2_PARITY_1；R5.2 狀態機契約維持 20260722_R5_2。
- 監管流程採 D1～D5 與 C1～C5 共 10 個正式階段，S1～S10 僅為同一 StepInstance 的連續順序碼。
- 舊站監管內容已整理為 82 項逐項檢核，支援完成、異常、不適用及待檢核狀態。
- 設計與工程各建立 30%、30%、30%、10% 四個里程碑，共 8 個付款里程碑。
- 已建立設計費、工程費、合約編號與核准狀態基線，並支援收據、實付金額及付款證明紀錄。
- 已支援文件、圖片與 Evidence 上傳下載；檢核、證據、合約及追加工程異動寫入 Audit 與 outbox event。
- 追加工程保存名稱、金額、工期影響、原因與狀態；案件溝通涵蓋留言、提問、爭議諮詢及治理歷程。
- 案件切換已保持目前案件，不再於儲存後跳回第一個案件；本地 QA 案件標題亂碼亦已備份後修正。
- 桌面 1440px 與手機 390px 均無頁面水平溢位；容器內導覽及功能分頁可橫向捲動。
- 驗收案件為 IS-2026-0003；API 自動測試 1 passed／0 failed，前端 console error／warning 為 0。
- 本地驗收網址：http://127.0.0.1:4174/?view=projects&case=IS-2026-0003
- 本次更新只存在本地工作區，尚未 commit、push 或部署至 GitHub 正式網站。
- 82 項檢核把舊站作業語意映射到十階段治理模型；里程碑與 Gate 維持關聯但不混同。
- 本地資料、歷程與 Evidence 可作標準化及產業驗證材料，但不能替代外部稽核、正式權限或法律判斷。

### 控制與驗收

- Gate Passed 只表示治理條件成立，不會自動建立 Payment Eligibility、Invoice、付款核准或付款執行。
- Payment Eligibility 仍由獨立契約里程碑評估產生，Approval 與 Execution 維持權責分離。
- 本地測試結果是 Pilot／工程驗證證據，不得描述為正式生產環境上線、正式資安驗證或外部使用成效。
- 正式發布前必須完成權限矩陣、物件儲存、病毒掃描、檔案版本與保留政策、通知服務及 production smoke test。
- iSAFE-DGM 24 項與 DGI 411 題來源已取得並通過完整性檢查；治理核准、ID 遷移與正式發布整合尚未完成。

## 22. 結論

R5 的共同策略是品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化。

### R5.2 整合內容與契約

- R5 以品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化作為四份文件共同結論。
- 「結語」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「TIGI White Paper Master」中的用途，是把「結論」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「結語」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「結論」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。

## R6.1 Governance Registry Integration Baseline（2026-07-23）

- 上位治理母本：`TIGI_Governance_Master_24_Chapters_Independent_Edition_20260723_R6_1_RC.md`
- Canonical Contract：`canonical-contract-r6.1-governance-integration.json`
- 雲端來源：iSAFE-DGM 24/24、DGI 411/411，完整性檢查通過且無重複題碼。
- 核准狀態：`SOURCE_FOUND_PENDING_GOVERNANCE_APPROVAL`。
- DGI 遷移：保留 `DGI-001～411` legacy alias，對應階層式來源題碼。
- Payment 基線：Gate PASS 不等於 Payment Eligibility、Approval、Invoice 或 Execution。
- 文件狀態：TIGI White Paper Master R6.1 Release Candidate；不得標示 Final Official。

### 文件族譜

`Canonical Contract / Approved Registry > Governance Master > TIGI White Paper Master > 歷史來源`

### 發布阻擋

- DGM/DGI 版本裁決與治理核准。
- 411 筆 DGI alias migration 與參照完整性 QA。
- 正式 SaaS 權限、物件儲存、病毒掃描、備份、部署核准及 production smoke test。

## R6.1 RC Engineering QA / Release Management Update（2026-07-28）

- Document Set ID：`TIGI-4MASTER-20260728-R6.1-RC-QA-01`
- Version：`20260730_R7_Implementation_Integrated`
- Release ID：`TIGI-GOVERNANCE-20260730-R7-IMPL`
- QA Freeze：`TIGI-R6.1-RC-FREEZE-20260723-01`
- Release Status：`RELEASE_CANDIDATE`
- RC Version Freeze：`GO`
- Final Official：`NO GO`
- `final_official_allowed=false`

### 驗收權威與證據邊界

Official QA Report 是 R6.1 的唯一驗收摘要；Canonical Contract、Approved Registry、Accepted ADR、Manifest、SHA256、Git 與測試輸出仍是原始權威證據。文件 QA PASS 不等於 Governance Approval、Release Integration 或 Production Deployment PASS。

### Registry 狀態

| Registry | Source Completeness | Governance Approval | Release Integration |
|---|---:|---:|---:|
| TIGI-GS-01～30 | PASS 30/30 | PASS 30/30 | PASS 30/30 |
| iSAFE-DGM-01～24 | PASS 24/24 | PENDING 0/24 | PENDING 0/24 |
| DGI 411 | PASS 411/411 | PENDING 0/411 | PENDING 0/411 |

### Production Readiness

| Module | Current Level | Release Note |
|---|---|---|
| GS-01～30 | RELEASE_INTEGRATED | 30/30 已治理核准並發布整合 |
| DGM 01～24 | LOCALLY_IMPLEMENTED | 來源 24/24；治理核准 0/24 |
| DGI 411 | LOCALLY_IMPLEMENTED | 來源 411/411；治理核准 0/411 |
| State Machine / Evidence / CAPA / Payment | LOCALLY_IMPLEMENTED | 本地實作存在；production 未證明 |
| Journey / Handover / OpenAPI / JSON Schema | SPECIFIED | 規格存在；正式整合或成品待補 |
| Production Deployment | SPECIFIED | 尚無 Final Official 部署證據 |

### TIGI White Paper Master 更新控制

- 產業倡議須把治理願景、規格完成、本地實作與正式部署分開陳述，避免把 Future Concept 或 RC 能力寫成既成產業標準。
- GS-01～30 為已核准並整合的治理標準；DGM 24 與 DGI 411 目前只完成來源取得與完整性驗證。
- Final Official 的公共論述必須以 Final Release Decision 的 GO 為前提；目前只能引用 R6.1 Release Candidate。

### Final Official Release Blockers

1. 完成 DGM 24 與 DGI 411 的治理核准及發布整合。
2. 修正 Canonical Contract 的舊 `remaining_registry_source_required=435` 欄位。
3. 建立並核准 R6.1 ADR Master。
4. 將 Governance Master 與 State Machine Contract 納入正式 Release Package。
5. 正式發布 OpenAPI YAML/JSON、SQL Schema、JSON Schema 與獨立架構圖來源。
6. 完成 Git commit、tag、push、GitHub Release 與 SHA256 驗證。

Final Official 只能由 Final Release Decision 的 GO 及全部 Required Gate PASS 共同產生，不得人工直接切換。

---

# R7 Implementation Integrated Addendum

- 文件：白皮書母本
- 版本：`20260730_R7_Implementation_Integrated`
- 發布識別：`TIGI-GOVERNANCE-20260730-R7-IMPL`
- 狀態：Implementation Integrated Baseline；非 Final Official
- 原則：R6.1 原檔不覆寫，R7 另版保存

## R7 新增一：StyleMatch AI 裝修規劃設計提案工作流

- 需求流程固定為五步：基本資料、空間照片、偏好需求、預算分析、後續方案。
- 三種後續方案只能在需求填寫完成後顯示：AI 裝修規劃設計提案、專業設計師媒合、TWCID 平台招標媒合。
- 專案資料至少包含 project_id、case_code、房屋類型、屋齡、坪數、格局、預算、材料等級、空間調性、特殊需求、space_photos、reference_photos 與 service_option。
- StyleMatch 專案成立不等同 iSAFE 立案；不得在需求階段直接建立 isafe_case_id。

## R7 新增二：設計提案組稿與 PDF Artifact

- Proposal Assembly Workflow 依專案資料自動生成設計提案預覽，並輸出 A4 PDF。
- 共通章節為：專案需求摘要、設計概念、風格意象、空間調性、參考圖片、平面配置（有資料時）、空間現況、材料使用建議、預算與落地提醒。
- 平面配置為條件式章節；沒有 floor_plan Artifact 時不得生成虛構平面圖。
- 圖片來源必須可追溯至 proposal_media.reference_photos 或 proposal_media.space_photos。
- PDF 應保存 proposal_version、generated_at、project_id、case_code、輸入摘要與生成器版本；正式 SaaS 應保存 checksum、下載授權與 audit event。
- 提案 PDF 屬前期概念 Artifact，不等同施工圖、正式估價單、簽證文件或工程契約。

## R7 新增三：StyleMatch 專案與會員權限控台

- 控台一級功能包含目前方案、StyleMatch 專案、會員與權限。
- StyleMatch 專案內頁集中顯示專案需求內容、圖片及設計提案預覽／PDF 下載。
- 目前方案可導向平台方案價格；MVP 方案切換僅供本地檢視，不得視為正式訂閱或付款成功。
- 會員角色至少包含 Owner、Admin、Designer、Viewer；正式環境由 RBAC API 與 Tenant Context 驗證，不以 localStorage 作授權來源。

## R7 新增四：StyleMatch 與 iSAFE 程序邊界

- StyleMatch 負責需求、圖片、風格、提案與前期媒合資料；iSAFE 負責工程階段、Gate、Evidence、Risk、NCR／CAPA、付款資格、稽核與保固。
- 進入 iSAFE 前必須完成 TWCID 媒合、人工確認、授權範圍確認與正式 Handover。
- iSAFE 接收端成功冪等立案後才回存 isafe_case_id；StyleMatch 前端不得自行推算或預建該識別碼。
- StyleMatch 控台與 iSAFE 控台必須使用明顯不同的標題、說明與操作區塊，避免將前期概念提案誤認為工程監管。

## R7 新增五：AI 空間設計與 360° 環景

- 功能名稱統一為「AI 空間設計與 360° 環景」。
- 輸入沿用專案空間照片、設計提案風格參考圖及所選空間，不要求使用者重複輸入風格 DNA。
- 同一空間可保存多張參考圖；客餐廳等複合空間應以空間群組或多標籤處理。
- 預覽可免費顯示；正式檔案下載須由後端付款結果解鎖，前端不得自行宣告付款完成。

## R7 驗收與發布條件

- StyleMatch 五步需求流程、專案內頁與提案預覽可在本地端完成。
- 提案 PDF 可輸出 A4 多頁文件，中文字與圖片渲染正常，平面配置依資料有無決定。
- StyleMatch 與 iSAFE 控台具有明確視覺、權責與識別碼邊界。
- 正式 SaaS 發布前仍須完成後端身分、付款、Artifact Storage、Audit、Checksum、AI Trace 與部署驗收。
