# SBIR Final Submission Master

- 版本：`20260730_R7_Implementation_Integrated`
- 發布識別：`TIGI-GOVERNANCE-20260730-R7-IMPL`
- 內容基礎：R5.2 State Machine、R5.2.1 GS30 Recovery 與 20260723 Legacy Functional Parity
- 契約保留：20260722_R5.1 Accepted ADR、Master、Annexes 與 canonical contract
- 狀態機修正：20260722_R5.2 State Machine ADR、Master 與 isafe-state-machine-r5.2.json
- 適用範圍：中央型 SBIR 送件、研發管理、Pilot 驗證與成果查核
- 發布狀態：R7 Implementation Integrated Baseline；435 筆 DGM/DGI 來源已取得，但治理核准、ID 遷移、正式 SaaS 控制及 GitHub 部署完成前不得標示 Final Official

## 2. 計畫摘要

本計畫以 12 個月完成 AI 能力平台、跨站 Handover 與最小治理閉環，並以真實 Pilot 驗證，不宣稱本期完成大型 ERP。

### R5.2 整合內容與契約

- 本版保留 R5 Final 與 R5.1 全部契約修正，再疊加 R5.2 iSAFE 狀態機；發布狀態仍為 Release Candidate。
- 本文件保留 R5 Final 的完整用途化內容，契約衝突依 R5.2 State Machine ADR 與 R5.1 Accepted ADR 與 canonical contract 修正。
- R6.1 為 Governance Integration Release Candidate；本整合版不得標示 Final Official。
- 「文件目的與適用範圍」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

### 控制與驗收

- 任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 3. 問題與需求

設計工程產業同時存在資料分散、責任不清、證據不足、AI 不可追溯與平台邊界混淆，必須以共用治理契約處理。

### R5.2 整合內容與契約

- 「文件目的與適用範圍」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「SBIR Final Submission Master」中的用途，是把「問題與需求」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 4. 研發目標

研發目標拆成 Shared Core、AI Agent、TWCID Pilot、iSAFE 治理閉環、Trace 與可量測驗收六類成果。

### R5.2 整合內容與契約

- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「研發目標」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 5. 創新性說明

創新不在單一生成模型，而在把 AI 建議、媒合、正式治理、Evidence 與營運系統分權並以契約串接。

### R5.2 整合內容與契約

- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「AI 輸出限制」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。
- 本章在「SBIR Final Submission Master」中的用途，是把「創新性說明」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 6. TIGI-GS-01～30 基準

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

## 7. iSAFE-DGM-01～24 基準

維持 iSAFE-DGM-01～24 為室內裝修數位治理手冊範圍，以 Registry 管理名稱、適用步驟、工項與版本。

### R5.2 整合內容與契約

- iSAFE-DGM Registry 共 24 個穩定 ID，來源完整 24/24；目前均待治理核准與發布整合。
- 本文件只引用命名範圍、流程角色與待補狀態，不虛構治理手冊名稱或正文。
- 權威內容補入後必須完成版本、來源、核准與三格式一致性檢查。

### 控制與驗收

- 「iSAFE-DGM-01～24 命名」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「iSAFE-DGM-01～24 基準」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。

## 8. 411 題 DGI 題碼

維持 411 個 DGI 唯一題碼資產，題目正文以權威題庫為準，不在主文件重複貼入尚未核准發布的逐題正文。

### R5.2 整合內容與契約

- DGI 411 題來源完整；目前狀態為 SOURCE_FOUND_PENDING_GOVERNANCE_APPROVAL，並保留 DGI-001～411 legacy alias。
- 題碼不得因文字修訂重用；改題建立新版本，停用題目保留歷史狀態。
- 不得改寫權威題庫，亦不得宣稱 411 題的治理核准與正式發布整合已完成。

### 控制與驗收

- 「411 題 DGI 題碼策略」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

## 9. 九類命名空間

凍結九類命名空間 TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA，避免文件與系統另創同義代碼。

### R5.2 整合內容與契約

- 建立「九類命名空間」的 Registry ID、名稱、版本、Owner、有效期間與狀態。
- 「PM / G / WI 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 「EVD / NCR / CAPA 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 本章在「SBIR Final Submission Master」中的用途，是把「九類命名空間」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「九類命名空間」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「PM / G / WI 編碼」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 10. StyleMatch AI 角色

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

## 11. TWCID 角色

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

### R5.2 整合內容與契約

- TWCID 擁有會員、內容、match_case_id、候選、邀標／招標、媒合決策、成交、評價及授權快照；AI 能力由 StyleMatch AI API 提供。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「TWCID 媒合資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 本章在「SBIR Final Submission Master」中的用途，是把「TWCID 角色」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「TWCID 媒合資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 12. iSAFE 2.0 角色

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

### R5.2 整合內容與契約

- iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「iSAFE 2.0 個案治理資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 本章在「SBIR Final Submission Master」中的用途，是把「iSAFE 2.0 角色」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「iSAFE 2.0 個案治理資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

## 13. 消費者旅程

跨產品旅程由 journey_id 串聯 StyleMatch、TWCID、正式 Project、iSAFE 與 DEOS，不以 Email 或手機當主鍵。

### R5.2 整合內容與契約

- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「消費者旅程資料回饋模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「工程案例流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。
- 本章在「SBIR Final Submission Master」中的用途，是把「消費者旅程」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「消費者旅程資料回饋模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

## 14. 資料回饋迴圈

資料回饋僅交換經授權、最小必要、可追溯的結構化結果，不將客戶資料默認送入模型訓練。

### R5.2 整合內容與契約

- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「資料回饋迴圈」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 「附錄 E：資料回饋迴圈」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「SBIR Final Submission Master」中的用途，是把「資料回饋迴圈」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「資料回饋迴圈」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。
- 「附錄 E：資料回饋迴圈」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 15. S1～S10 流程

以 S1/D1～S10/C5 表示同一套兩階段十步驟，需求探索與媒合屬治理前置，不另建第二套 iSAFE 流程。

### R5.2 整合內容與契約

- S1／D1 前置作業（設計）、S2／D2 平面設計規劃、S3／D3 基本設計規劃定案、S4／D4 立面設計定案、S5／D5 施工大樣及其他約定事項。
- S6／C1 前置作業（工程）、S7／C2 第一期工程施工、S8／C3 第二期工程施工、S9／C4 第三期工程施工、S10／C5 保固修繕及售後服務。
- S 與 D／C 是同一 StepInstance 雙碼；Intake／Handover 在 D1 前，Closed／Archived 在 C5 後。

### 控制與驗收

- 採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「StepInstance 單一步驟模型」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

## 16. D1～D5 設計治理

定義 D1～D5 的設計治理輸入、圖說／文件版本、責任角色、Evidence 與 Gate 輸出。

### R5.2 整合內容與契約

- D1 前置作業 Evidence：design_parties_confirmation、design_requirements、design_fee_terms、design_contract。
- D2 平面設計規劃 Evidence：site_measurement、floor_plan_draft、floor_plan_approval。
- D3 基本設計規劃定案 Evidence：basic_design_package、materials_plan、budget_review、basic_design_approval。
- D4 立面設計定案 Evidence：elevation_drawings、elevation_approval。
- D5 施工大樣及其他約定事項 Evidence：construction_details、material_schedule、bill_of_quantities、issued_for_construction_set。

### 控制與驗收

- 「D1～D5 設計治理視角」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「設計階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

## 17. C1～C5 工務治理

定義 C1～C5 的工程前置、三期施工、保固修繕與售後服務治理責任。

### R5.2 整合內容與契約

- C1 前置作業 Evidence：construction_contract、construction_drawings、material_samples、payment_schedule、work_checklist。
- C2 第一期工程施工 Evidence：phase_1_checklist、phase_1_progress_evidence、phase_1_acceptance。
- C3 第二期工程施工 Evidence：phase_2_checklist、phase_2_progress_evidence、phase_2_acceptance。
- C4 第三期工程施工 Evidence：phase_3_checklist、completion_evidence、handover_inspection。
- C5 保固修繕及售後服務 Evidence：handover_list、warranty_record、service_contact。

### 控制與驗收

- 「C1～C5 工務治理視角」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「施工階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

## 18. Gate 與付款資格

Gate 結果統一為 Passed、Failed、Conditional、Waived；通過最多建立 Payment Eligibility，不會自動付款。

### R5.2 整合內容與契約

- Passed 必須具備該 Stage 的 required_evidence；Conditional／Failed 不得前進。
- Waived 必須具 authority、reason、未來 expires_at、missing evidence 與事後覆核。
- Gate 不自動產生 Payment Eligibility；資格由獨立契約里程碑評估產生。
- PaymentEligibility 不等於 Invoice、Payment Approval 或付款執行。

### 控制與驗收

- 「Gate 判定與付款資格」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「付款資格資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 19. Risk Weight 邊界

正式 Risk Score 僅由可解釋規則與授權角色核定，AI 只能提供風險提示與來源證據。

### R5.2 整合內容與契約

- 高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。
- AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。
- 「Risk Weight 專業審查邊界」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。
- 「iSAFE-DGM 風險訊號」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。
- 本章在「SBIR Final Submission Master」中的用途，是把「Risk Weight 邊界」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「Risk Weight 專業審查邊界」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

## 20. GS-25～27

GS-25～27 分別管制 Contract Baseline、工項／施工期別、付款節點與付款資格。

### R5.2 整合內容與契約

- 「GS-25～27 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「合約基線資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「工項期別資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「付款資格資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 本章在「SBIR Final Submission Master」中的用途，是把「GS-25～27」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 「合約基線資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 21. GS-28～30

GS-28～30 分別管制 DGM 綁定、AI 輔助治理、消費者旅程與資料回饋。

### R5.2 整合內容與契約

- 「GS-28～30 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「數位治理手冊綁定模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「消費者旅程資料回饋模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 本章在「SBIR Final Submission Master」中的用途，是把「GS-28～30」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「GS-28～30 技術母本定位」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 「數位治理手冊綁定模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 22. 技術架構

將 TIGI 定位為治理標準與 SaaS 共用核心，不把 TWCID、StyleMatch AI、iSAFE 2.0、DEOS 混成單一前台或單一資料庫。

### R5.2 整合內容與契約

- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「技術架構」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

## 23. API 基線

公共 API 統一採 /api/v1；內部服務可用 /v1，但不得形成第二套公開契約。

### R5.2 整合內容與契約

- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。
- 本章在「SBIR Final Submission Master」中的用途，是把「API 基線」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。
- 「API 基線」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。

## 24. 資料模型

Contract Baseline 是核准範圍、圖說、估價、工期、付款節點與變更規則的版本化快照。

### R5.2 整合內容與契約

- Handover 必要欄位（1/3）：schema_version、handover_id、idempotency_key、created_at、tenant_id、organization_id、journey_id、stylematch_project_id、match_case_id、project_id。
- Handover 必要欄位（2/3）：requirement_profile_ref、style_profile_ref、space_profile_ref、budget_profile_ref、proposal_refs、attachment_refs、source_versions、contract_baseline_ref、scope_summary、budget_summary。
- Handover 必要欄位（3/3）：schedule_summary、consent_ref、consent_scope、consent_at、retention_policy、trace_id、correlation_id、source_system。
- Canonical ID 明確區分 stylematch_project_id、match_case_id、project_id、isafe_case_id、handover_id、ai_task_id 與 trace_id，不再混用 project_id 或 case_id。
- 「合約基線資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

### 控制與驗收

- 「合約基線資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 「工項期別資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

## 25. AI 輔助治理

AI 治理資料將 finding／hint／proposal 與正式 Decision 分表、分權限、分事件並保留人工確認。

### R5.2 整合內容與契約

- 高影響 AI Trace 必含：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash、citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。
- AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。
- iSAFE 以 isafe_case_id 負責 StepInstance、Evidence、Gate、Risk、NCR／CAPA、驗收、保固與 PGP；正式治理決策由規則及授權角色完成。
- 「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。
- 「AI 輸出限制」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。
- 本章在「SBIR Final Submission Master」中的用途，是把「AI 輔助治理」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。
- 「AI 輸出限制」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

## 26. 平台模組

將 TIGI 定位為治理標準與 SaaS 共用核心，不把 TWCID、StyleMatch AI、iSAFE 2.0、DEOS 混成單一前台或單一資料庫。

### R5.2 整合內容與契約

- Platform Core Billing 物件：Product、Plan、Feature、Entitlement、Subscription、UsageEvent、InvoiceReference。
- SaaS Module Flag：stylematch_ai_enabled、isafe_enabled、twcid_marketplace_enabled、api_access_enabled、white_label_enabled、custom_domain_enabled。
- 模組開關、Entitlement、UsageEvent 與 InvoiceReference 必須可測試且可稽核。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 27. 工程驗證流程

工程案例從旅程、需求、媒合、Contract Baseline、Handover、治理、驗收到營運形成端到端可重建紀錄。

### R5.2 整合內容與契約

- 「工程案例流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「工程驗證流程」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。
- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 28. 研發方法

採契約優先、風險驅動、Pilot 驗證與迭代交付，先凍結資料和責任邊界，再逐步擴充功能。

### R5.2 整合內容與契約

- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「驗證與測試清單」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「研發方法」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「驗證與測試清單」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 29. 工作項目

工作包依 Shared Core、AI Gateway、TWCID Pilot、iSAFE Governance、Trace／Security 與驗證交付拆解。

### R5.2 整合內容與契約

- Canonical Event（1/2）：JourneyCreated、DemandProfileCompleted、StyleMatchProjectCreated、MatchRequested、ProviderSelected、ContractBaselineApproved、ProjectHandoverApproved、ProjectCreated。
- Canonical Event（2/2）：ISAFECaseCreated、GovernanceInitiated、EvidenceRegistered、GateEvaluated、PaymentEligibilityChanged、AcceptanceCompleted、DEOSProjectActivated、ProjectClosed。
- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 30. 時程規劃

12 個月依 Core、AI Trace、治理閉環、跨站 Handover、Pilot 與商品化基線分四階段推進。

### R5.2 整合內容與契約

- 「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「時程規劃」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

## 31. 人力配置

團隊配置以產品／領域、整合工程、前端、AI、DevOps／QA 與導入成功六類責任組成，實際人數依核定預算配置。

### R5.2 整合內容與契約

- 角色至少涵蓋 Product／Domain、Backend／Integration、Frontend、AI／ML、DevOps／QA 與 Design／Customer Success；實際人數由申請單位核定。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「人力配置」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。
- 「資安與隱私邊界」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 32. 預期成果

成果必須同時包含可操作系統、正式契約、測試證據、Pilot 數據、技術文件與可移轉的治理資產。

### R5.2 整合內容與契約

- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「PDF / Word / Markdown 一致性」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「預期成果」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 33. 量化 KPI

KPI 以 AI 可採用度、Handover 成功率、Trace 覆蓋率、Evidence 完整率、租戶隔離與付費轉換衡量。

### R5.2 整合內容與契約

- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「量化 KPI」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。
- 「量化 KPI」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。

## 34. 市場與應用

優先選擇高頻、可量測且能形成 Evidence 的需求整理、文件檢查、工地照片、日誌與 Checklist 場景。

### R5.2 整合內容與契約

- 「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「市場與應用」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 35. 競爭差異

差異化來自治理標準、Canonical Contract、跨產品 Trace、Evidence Chain 與可獨立授權的 AI／治理能力。

### R5.2 整合內容與契約

- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 本章在「SBIR Final Submission Master」中的用途，是把「競爭差異」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

## 36. 商業模式

商業模式以獨立 SaaS、整合套裝、API／Agent 用量、企業授權及導入服務組成，不混淆媒合與治理責任。

### R5.2 整合內容與契約

- 收入來源分為獨立 SaaS、整合套裝、API／Agent 用量、企業授權及導入服務；媒合成交權與治理決策權不因收費而移轉。
- 「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 本章在「SBIR Final Submission Master」中的用途，是把「商業模式」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

## 37. 風險與因應

主要風險涵蓋責任混用、資料越權、模型誤判、Pilot 偏誤、整合失敗及本期範圍膨脹，均需具 Owner 與退出條件。

### R5.2 整合內容與契約

- 「Risk Weight 專業審查邊界」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。
- 「例外處理與人工覆核」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。
- 「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「風險與因應」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「Risk Weight 專業審查邊界」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。
- 「例外處理與人工覆核」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

## 38. 資安與隱私

採 OIDC/OAuth 2.1、SSO、MFA、短效 Token、RBAC 與 ABAC；所有授權均需服務端驗證 Tenant Context。

### R5.2 整合內容與契約

- 「權限與角色模型」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。
- 「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「資安與隱私」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「權限與角色模型」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。
- 「資安與隱私邊界」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 39. 驗證計畫

驗證同時覆蓋技術契約、權限與租戶隔離、AI 回歸、真實案例流程、使用採用度及商業轉換。

### R5.2 整合內容與契約

- 新增十階段順序、禁止跳階、Evidence Gate、Waiver、付款分離、Legacy Mapping、Migration、Rollback 與 Smoke Test。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「驗證與測試清單」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「驗證計畫」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。
- 「驗證與測試清單」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 40. 成果交付

交付物以版本、Owner、驗收條件、Checksum、來源章節及附件索引管理，確保可重建與可查核。

### R5.2 整合內容與契約

- 交付須附三份 Registry Status；435 筆來源均已取得，後續工作為治理核准、ID 遷移與正式發布整合。
- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「PDF / Word / Markdown 一致性」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「送件附件索引」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「成果交付」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「PDF / Word / Markdown 一致性」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 41. 政府補助合理性

補助聚焦高技術不確定性、可量測驗證與產業外溢成果，不補貼一般營運或一次性客製工作。

### R5.2 整合內容與契約

- 補助資源用於具技術不確定性、可量測驗證與產業外溢性的研發工作，不補貼一般媒合營運或一次性客製專案。
- 「文件目的與適用範圍」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「政府補助合理性」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。

## 42. 經費使用原則

經費須逐項連結工作包、期間、責任人、交付物與驗收證據；未核定金額保留為正式申請表欄位。

### R5.2 整合內容與契約

- 本章不虛構金額；人事、設備、委外、雲端、Pilot 與查核費用須依正式申請表填列，並逐項連結工作包、交付物與驗收證據。
- 「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「經費使用原則」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「SBIR 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 43. 智財與標準化

智財布局涵蓋資料契約、治理規則、Agent 評估、標準登錄與實作 Know-how，同時保留必要互通介面。

### R5.2 整合內容與契約

- 建立「TIGI-GS-01～30 總表」的 Registry ID、名稱、版本、Owner、有效期間與狀態。
- 建立「九類命名空間」的 Registry ID、名稱、版本、Owner、有效期間與狀態。
- 「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 本章在「SBIR Final Submission Master」中的用途，是把「智財與標準化」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。
- 「九類命名空間」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

## 44. 推廣策略

推廣由 TWCID 會員與案件場域切入，以可量測 Pilot、合作夥伴導入與治理 Profile 複製建立市場證據。

### R5.2 整合內容與契約

- 「BP 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「推廣策略」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「BP 文件引用方式」驗收時，遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 45. 未來擴充

未來依 36 個月產品成熟路線由 AI Assist、Governance Workflow、Project OS 延伸至 DEOS，不提前承諾完整 ERP。

### R5.2 整合內容與契約

- 「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 「後續 R3 更新條件」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「SBIR Final Submission Master」中的用途，是把「未來擴充」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 46. 附件索引

附件只列實際存在、版本可識別且可校驗的檔案，並區分 R5 正式件、治理附件、測試證據與歷史來源。

### R5.2 整合內容與契約

- 「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。
- 「送件附件索引」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。
- 本章在「SBIR Final Submission Master」中的用途，是把「附件索引」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 遇到衝突依 R5.2 ADR、R5.2 Master、R5.2 Annex、R3、R2 的效力順序處理。
- 「送件附件索引」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

## 47. R2 驗證摘要

R5 保留 R2 分冊的章節完整性，同時移除逐頁重複樣板並解決 R3、R4 與 R4.1 的契約衝突。

### R5.2 整合內容與契約

- 「R2 驗證重點」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「SBIR Final Submission Master」中的用途，是把「R2 驗證摘要」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

### 控制與驗收

- 「R2 驗證重點」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。
- 「R2 驗證摘要」發布前須核對 R5.2 Integrated Canonical Contract、Accepted ADR、來源章節與附件校驗值。

## 48. R6 Pilot 實作成果與驗證證據

R6 以可重現的本地 API、網站、SQLite 資料與驗收案件，形成 SBIR Pilot 的研發成果證據。

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
- 既有 3 件本地案件均已完成 82 項檢核與 8 個里程碑資料遷移；遷移前 SQLite 已備份。
- 驗證涵蓋檢核寫入、案件切換保留、合約基線、里程碑計算、追加工程及案件提問。

### 控制與驗收

- Gate Passed 只表示治理條件成立，不會自動建立 Payment Eligibility、Invoice、付款核准或付款執行。
- Payment Eligibility 仍由獨立契約里程碑評估產生，Approval 與 Execution 維持權責分離。
- 本地測試結果是 Pilot／工程驗證證據，不得描述為正式生產環境上線、正式資安驗證或外部使用成效。
- 正式發布前必須完成權限矩陣、物件儲存、病毒掃描、檔案版本與保留政策、通知服務及 production smoke test。
- iSAFE-DGM 24 項與 DGI 411 題來源已取得並通過完整性檢查；治理核准、ID 遷移與正式發布整合尚未完成。

## 49. 結論

R5 的共同策略是品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化。

### R5.2 整合內容與契約

- R5 以品牌分開、資料整合、產品模組化、商業 SaaS 化與技術 Shared Core 化作為四份文件共同結論。
- 「結語」以 R5 正式名稱、版本和 Canonical Contract 為準。
- 本章在「SBIR Final Submission Master」中的用途，是把「結論」轉成可引用、可驗證且不與其他產品責任混淆的正式敘述。

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
- 文件狀態：SBIR Final Submission Master R6.1 Release Candidate；不得標示 Final Official。

### 文件族譜

`Canonical Contract / Approved Registry > Governance Master > SBIR Final Submission Master > 歷史來源`

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

### SBIR Final Submission Master 更新控制

- SBIR 送件與成果查核引用 Official QA Report 時，必須同時揭露 DGM/DGI 的來源完整、治理核准與發布整合三種不同狀態。
- 文件格式 QA PASS 只證明 DOCX/PDF/MD/JSON 與版面完整，不代表技術部署、治理核准或商業成效已完成。
- 所有 Pilot、SaaS、API 與 AI 成果必須區分 SPECIFIED、LOCALLY_IMPLEMENTED、GOVERNANCE_APPROVED、RELEASE_INTEGRATED、PRODUCTION_DEPLOYED。

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

- 文件：SBIR 送件母本
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
