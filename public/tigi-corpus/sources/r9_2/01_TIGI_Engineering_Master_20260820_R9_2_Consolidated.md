# TIGI Engineering Master

R9.2 Consolidated Technical Baseline｜四母本完整內容整合最新版

版本：20260820_R9_2_Consolidated

發布識別：TIGI-GOVERNANCE-20260820-R9.2-CONSOLIDATED

共同基線：R5.2 State Machine + R5.2.1 GS30 Recovery + Legacy Functional Parity

實作契約：20260723_R5_2_PARITY_1

章節結構：共 72 章；R6.1 治理整合版獨立保存，不覆寫 R5.2／R5.2.1

適用範圍：產品決策、工程實作、企業 SaaS、SBIR、稽核與驗收

發布狀態：Approved Specification Baseline／Candidate Implementation；Final Official = NO GO

重要：本版完整保留 R9 四母本全文，新增 R9.2 Consolidated Technical Baseline、Agent R3.3 與 Product v8.2.0 規格。R5.2 State Machine 仍是正式狀態權威；Patent V7 維持鎖定；新增模組未經 Phase 0 與驗證前不得宣稱已完成實作。


## 2. 文件目的與適用範圍

本版保留 R5 Final 與 R5.1 全部契約修正，再疊加 R5.2 iSAFE 兩階段十步驟、Evidence Gate、Waiver、付款里程碑及遷移契約。

R5.2 整合內容與契約

版本識別為 20260814_R9_Patent_V7_Governance_Aligned；R5、R5.1、R6 原始發布檔均不覆寫。

衝突時依序採用：Canonical Contract / Accepted ADR / Approved Registry > TIGI Governance Master R6.1 > TIGI Engineering Master R6.1 > R5.2 Legacy Parity Implementation Record > R5.2.1 GS30 Recovery Record > 2026-07-13 Version Freeze > R5.2.1 GS30 Recovery Record > 2026-07-13 Version Freeze Original Official Edition > R5.2 State Machine ADR > R5.2 Master > R5.2 State Machine Contract > R5.1 Accepted ADR > R5.1 Master > R5.1 Annexes > R5 Accepted ADR > R5 Master > R4.1 > R3 > R2。

R6.1 為 Governance Integration Release Candidate；本整合版可作實作與送件母本，但不得標示 Final Official。

R5.2 canonical contract 遺漏的 R5.1 Handover、AI Trace、SaaS Flag 與 Registry completeness 已在 integrated contract 中保留，避免升版回退。

iSAFE 執行狀態以 isafe-state-machine-r5.2.json 為單一 machine-readable 來源。

控制與驗收

C-05 證據與稽核：Evidence、Gate、Payment Eligibility、例外、NCR／CAPA 與人工決定保留不可竄改軌跡。 C-06 資料生命週期：資料分類、最小化、保留、刪除、去識別、撤回同意、備份與復原依政策執行。

C-07 文件發布：DOCX、PDF、Markdown、Schema 與 Registry 通過版本、內容、Checksum、連結及視覺一致性驗證。 C-08 執行與退場：部署、監控、SLA、成本、Migration、Rollback、Incident Response 與供應商退場可驗證。


## 3. TIGI 平台定位

將 TIGI 定位為治理標準與 SaaS 共用核心，不把 TWCID、StyleMatch AI、iSAFE 2.0、DEOS 混成單一前台或單一資料庫。

R5.2 整合內容與契約

「TIGI 平台定位」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「TIGI 平台定位」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「TIGI 平台定位」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

SaaS Module Flag（1/1）：stylematch_ai_enabled、isafe_enabled、twcid_marketplace_enabled、api_access_enabled、white_label_enabled、custom_domain_enabled。

控制與驗收

「TIGI 平台定位」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「TIGI 平台定位」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 4. StyleMatch AI / TWCID / iSAFE 2.0 關係

凍結四產品責任：TWCID 負責會員與媒合；StyleMatch AI 負責 AI 能力；iSAFE 負責治理；DEOS 負責治理後營運。

R5.2 整合內容與契約

「StyleMatch AI / TWCID / iSAFE 2.0 關係」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「StyleMatch AI / TWCID / iSAFE 2.0 關係」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「StyleMatch AI / TWCID / iSAFE 2.0 關係」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

AI 可協助分類、提示、比對與摘要，但不得取代專業簽核與法定責任。

StyleMatch AI 與 iSAFE 2.0 均可獨立銷售為企業 SaaS，也可組成成交前後的整合方案。

控制與驗收

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「StyleMatch AI / TWCID / iSAFE 2.0 關係」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 5. As-Is / To-Be / Future Concept 邊界

區分現況、12 個月交付與 36 個月產品成熟度，避免把 Future Concept 誤列為本期承諾。

R5.2 整合內容與契約

「As-Is / To-Be / Future Concept 邊界」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「As-Is / To-Be / Future Concept 邊界」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「As-Is / To-Be / Future Concept 邊界」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

12 個月交付：M1～3 Core/Contract/AI Gateway；M4～6 AI Trace/最小治理；M7～9 S1～10/Handover；M10～12 Pilot/商品化。

控制與驗收

「As-Is / To-Be / Future Concept 邊界」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「As-Is / To-Be / Future Concept 邊界」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 6. TIGI-GS-01～30 總表

TIGI-GS Registry 已依 2026-07-13 Version Freeze 原始 Official Edition 復原為 30/30；GS-01～24 為歷史復原項，GS-25～30 延續既有權威項。

R5.2 整合內容與契約

Registry 預期 30 項；AUTHORITATIVE 6 項；AUTHORITATIVE_RECOVERED 24 項；SOURCE_REQUIRED 0 項。

復原來源：2026-07-13 Version Freeze Original Official Edition；分享識別 6a547586-cf94-83e8-a318-0f5cac1f42c2。

每項均保存正式名稱、用途、來源、復原日期、核准狀態及發布阻擋狀態。

TIGI-GS、iSAFE-DGM 與 DGI 來源完整性均已確認；DGM/DGI 目前待治理核准、ID 遷移與正式發布整合。

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

發布驗證必須命中 TIGI-GS-01～30 全部正式名稱，且編號唯一、順序連續。

歷史復原內容如需改名或改義，必須另立 ADR 與新版本，不得回寫原始 Version Freeze。


## 7. GS-01～06 流程治理標準

流程治理標準已由 2026-07-13 Version Freeze 原始內容復原，以下為正式名稱與用途。

R5.2 整合內容與契約

TIGI-GS-01｜案件識別標準：確保每個案件具有唯一 Project ID、流程及版本

TIGI-GS-02｜角色責任標準：定義業主、設計師、施工單位、審核者的責任與權限

TIGI-GS-03｜節點進入標準：定義進入下一步驟前必須完成的前置條件

TIGI-GS-04｜Gate驗證標準：規定 Gate 如何檢查文件、簽核、照片、檢核及付款條件

TIGI-GS-05｜狀態轉換標準：防止非法跳關，保存操作者與時間

TIGI-GS-06｜例外處理標準：管理 Fallback、Override、暫停與例外核准

控制與驗收

GS-01～06 必須與復原 Registry 的名稱、用途及來源識別一致。

跨文件引用使用穩定 ID；內容變更必須保留版本、Owner、有效日與 Audit。


## 8. GS-07～12 資料治理標準

資料治理標準已由 2026-07-13 Version Freeze 原始內容復原，以下為正式名稱與用途。

R5.2 整合內容與契約

TIGI-GS-07｜案件資料標準：統一案件必要欄位、代碼與資料型別

TIGI-GS-08｜參與者與權限標準：管理角色、授權範圍及有效期間

TIGI-GS-09｜Artifact中繼資料標準：規範圖說、照片、文件的來源、類型及版本

TIGI-GS-10｜版本與變更標準：新資料不得覆蓋舊版本，必須保留變更原因

TIGI-GS-11｜治理事件標準：保存誰、何時、對什麼資料、做了什麼操作及結果

TIGI-GS-12｜交換與互通標準：統一 API Schema、代碼、錯誤碼及交換版本

控制與驗收

GS-07～12 必須與復原 Registry 的名稱、用途及來源識別一致。

跨文件引用使用穩定 ID；內容變更必須保留版本、Owner、有效日與 Audit。


## 9. GS-13～18 證據治理標準

證據治理標準已由 2026-07-13 Version Freeze 原始內容復原，以下為正式名稱與用途。

R5.2 整合內容與契約

TIGI-GS-13｜證據識別標準：每一 Evidence 具有唯一 ID 並關聯案件、步驟及 Gate

TIGI-GS-14｜完整性標準：保存 SHA-256、檔案大小及完整性驗證資料

TIGI-GS-15｜採集中繼資料標準：保存時間、來源、裝置及可取得的 EXIF／GPS

TIGI-GS-16｜證據鏈標準：追蹤上傳、引用、驗證、簽核及封存歷程

TIGI-GS-17｜簽核與見證標準：保存簽核人、角色、意圖、時間及簽核版本

TIGI-GS-18｜保存與封存標準：規定保存期限、封存、Legal Hold 及刪除程序

控制與驗收

GS-13～18 必須與復原 Registry 的名稱、用途及來源識別一致。

跨文件引用使用穩定 ID；內容變更必須保留版本、Owner、有效日與 Audit。


## 10. GS-19～24 品質治理標準

品質治理標準已由 2026-07-13 Version Freeze 原始內容復原，以下為正式名稱與用途。

R5.2 整合內容與契約

TIGI-GS-19｜Checklist標準：規定檢核項目、結果、證據、檢查人及版本

TIGI-GS-20｜不符合事項標準：記錄缺失類型、嚴重度、責任人及改善期限

TIGI-GS-21｜改善閉環標準：管理改善、複驗及缺失關閉條件

TIGI-GS-22｜風險評分標準：規範 RiskScore 規則、權重、分數與版本

TIGI-GS-23｜驗收與交付標準：規範驗收範圍、缺失、簽認及交付清單

TIGI-GS-24｜保固與結案標準：管理保固期間、維修責任、PGP 及案件封存

控制與驗收

GS-19～24 必須與復原 Registry 的名稱、用途及來源識別一致。

跨文件引用使用穩定 ID；內容變更必須保留版本、Owner、有效日與 Audit。


## 11. 九類命名空間

凍結九類命名空間 TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA，避免文件與系統另創同義代碼。

R5.2 整合內容與契約

建立「九類命名空間」的 Registry ID、名稱、版本、Owner、有效期間與狀態。

就「九類命名空間」而言，正文、欄位或題庫內容只保存於權威來源；其他文件使用穩定 ID 與版本參照。

就「九類命名空間」而言，關聯需可追溯至 Governance Profile、適用步驟、角色、Evidence Type 與 Gate Rule。

九類命名空間：TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA。

控制與驗收

「九類命名空間」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「九類命名空間」驗收時，發布前執行唯一性、參照完整性、版本相容及三格式一致性檢查。


## 12. iSAFE-DGM-01～24 命名

iSAFE-DGM-01～24 的來源名稱與正文已取得；版本裁決、治理核准與正式發布整合尚未完成。

R5.2 整合內容與契約

iSAFE-DGM Registry：預期 24 項；SOURCE_FOUND 24 項；GOVERNANCE_APPROVED 0 項；RELEASE_INTEGRATED 0 項。

現階段僅能引用命名範圍與待補狀態，不得宣稱 24 份治理手冊已正式核准。

取得權威來源後須補入 official_name、source、version、owner、effective period 與 checksum。

控制與驗收

「iSAFE-DGM-01～24 命名」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「iSAFE-DGM-01～24 命名」驗收時，發布前執行唯一性、參照完整性、版本相容及三格式一致性檢查。


## 13. 411 題 DGI 題碼策略

DGI 411 題來源完整；階層式來源題碼與 DGI-001～411 legacy alias 須經一對一遷移後發布。

R5.2 整合內容與契約

DGI Registry：預期 411 題；SOURCE_FOUND 411 題；GOVERNANCE_APPROVED 0 題；RELEASE_INTEGRATED 0 題。

題碼不得重用；改題建立新版本，停用題目保留歷史狀態。

在權威題庫提供前，不建立推測題目、答案或風險分類。

控制與驗收

「411 題 DGI 題碼策略」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「411 題 DGI 題碼策略」驗收時，發布前執行唯一性、參照完整性、版本相容及三格式一致性檢查。


## 14. REQUIREMENT / RISK_SIGNAL / CONTROL 分類

將 DGI 分為 REQUIREMENT、RISK_SIGNAL、CONTROL，三類可互相關聯但不可混用為同一判定欄位。

R5.2 整合內容與契約

建立「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」的 Registry ID、名稱、版本、Owner、有效期間與狀態。

就「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」而言，正文、欄位或題庫內容只保存於權威來源；其他文件使用穩定 ID 與版本參照。

就「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」而言，關聯需可追溯至 Governance Profile、適用步驟、角色、Evidence Type 與 Gate Rule。

控制與驗收

「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」驗收時，禁止重複 ID、未核准改名與刪除歷史版本；失效項目改以狀態和有效日管理。

「REQUIREMENT / RISK_SIGNAL / CONTROL 分類」驗收時，發布前執行唯一性、參照完整性、版本相容及三格式一致性檢查。


## 15. S1～S10 序列模型

S1～S10 是連續順序碼，D1～D5／C1～C5 是同一 StepInstance 的業務雙碼，不得另建競爭流程。

R5.2 整合內容與契約

S1/D1 前置作業（設計），stage_key=D1_design_preparation。 S2/D2 平面設計規劃（設計），stage_key=D2_floor_plan_design。

S3/D3 基本設計規劃定案（設計），stage_key=D3_basic_design_finalization。 S4/D4 立面設計定案（設計），stage_key=D4_elevation_design_finalization。

S5/D5 施工大樣及其他約定事項（設計），stage_key=D5_construction_detail_agreements。 S6/C1 前置作業（工程），stage_key=C1_construction_preparation。

S7/C2 第一期工程施工（工程），stage_key=C2_phase_one_construction。 S8/C3 第二期工程施工（工程），stage_key=C3_phase_two_construction。

S9/C4 第三期工程施工（工程），stage_key=C4_phase_three_construction。 S10/C5 保固修繕及售後服務（工程），stage_key=C5_warranty_aftercare。

Intake、StyleMatch、Match、Handover 位於 D1 前；Closed／Archived 位於 C5 後，均不占用十階段。

控制與驗收

採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 16. D1～D5 設計治理視角

D1～D5 恢復原 TWCID iSAFE 設計監造流程名稱，每一階段以指定 Evidence 作為 Gate 驗收基礎。

R5.2 整合內容與契約

D1 前置作業 Evidence：design_parties_confirmation、design_requirements、design_fee_terms、design_contract。

D2 平面設計規劃 Evidence：site_measurement、floor_plan_draft、floor_plan_approval。

D3 基本設計規劃定案 Evidence：basic_design_package、materials_plan、budget_review、basic_design_approval。

D4 立面設計定案 Evidence：elevation_drawings、elevation_approval。

D5 施工大樣及其他約定事項 Evidence：construction_details、material_schedule、bill_of_quantities、issued_for_construction_set。

控制與驗收

「D1～D5 設計治理視角」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「D1～D5 設計治理視角」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 17. C1～C5 工務治理視角

C1～C5 採工程前置、第一至三期施工及保固售後；工項不得取代施工期別。

R5.2 整合內容與契約

C1 前置作業 Evidence：construction_contract、construction_drawings、material_samples、payment_schedule、work_checklist。

C2 第一期工程施工 Evidence：phase_1_checklist、phase_1_progress_evidence、phase_1_acceptance。

C3 第二期工程施工 Evidence：phase_2_checklist、phase_2_progress_evidence、phase_2_acceptance。

C4 第三期工程施工 Evidence：phase_3_checklist、completion_evidence、handover_inspection。

C5 保固修繕及售後服務 Evidence：handover_list、warranty_record、service_contact。

拆除、水電、防水、泥作、木作等是 Work Item，可配置到各施工期，但不得取代 C2～C4 的期別語意。

控制與驗收

「C1～C5 工務治理視角」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「C1～C5 工務治理視角」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 18. StepInstance 單一步驟模型

以 StepInstance 表示單一專案內可追溯的步驟實例，保存狀態、責任、規則、Evidence、風險與 Gate 參照。

R5.2 整合內容與契約

StepInstance 必含 step_instance_id、project_id、isafe_case_id、sequence_code、stage_code、stage_key、contract_version、owner、status、started_at、completed_at。

合法轉移只允許 D1→D2→D3→D4→D5→C1→C2→C3→C4→C5→Closed；跳階必須拒絕並留下 Audit。

直接進案維持 INTAKE_pending，只有明確啟動 Governance 後才能建立 D1 StepInstance。

控制與驗收

「StepInstance 單一步驟模型」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「StepInstance 單一步驟模型」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 19. Evidence 資料治理

Evidence 必須具來源、建立者、時間、版本、SHA-256、權限、保存政策及 Legal Hold 狀態。

R5.2 整合內容與契約

「Evidence 資料治理」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。

就「Evidence 資料治理」而言，正式判定與 AI 建議分離；Evidence、Risk、Exception、Review 與 Gate 以不可混淆的資料物件保存。

就「Evidence 資料治理」而言，每次狀態轉換帶 trace_id、idempotency_key、actor、reason 及前後版本參照。

控制與驗收

「Evidence 資料治理」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「Evidence 資料治理」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 20. Gate 判定與付款資格

Gate 結果統一為 Passed、Failed、Conditional、Waived；通過最多建立 Payment Eligibility，不會自動付款。

R5.2 整合內容與契約

GateOutcome 只允許 Passed、Failed、Conditional、Waived；只有 Passed 與具權限的 Waived 可前進。

Passed 前必須驗證目前 Stage 的 required_evidence；缺件回傳 GATE_EVIDENCE_INCOMPLETE 與 missing_evidence。

Waived 必須保存 authority、reason、未來 expires_at、missing evidence、actor、trace 與事後覆核。

GateEvaluated 不建立 Payment Eligibility；付款資格由獨立契約里程碑評估產生。

PaymentEligibilityChanged 不等於 Invoice、Payment Approval 或 Payment Execution，亦不得觸發自動付款。

控制與驗收

「Gate 判定與付款資格」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「Gate 判定與付款資格」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 21. Risk Weight 專業審查邊界

正式 Risk Score 僅由可解釋規則與授權角色核定，AI 只能提供風險提示與來源證據。

R5.2 整合內容與契約

「Risk Weight 專業審查邊界」需保存 project_id、isafe_case_id、step/rule version、責任角色與狀態時間。

就「Risk Weight 專業審查邊界」而言，正式判定與 AI 建議分離；Evidence、Risk、Exception、Review 與 Gate 以不可混淆的資料物件保存。

就「Risk Weight 專業審查邊界」而言，每次狀態轉換帶 trace_id、idempotency_key、actor、reason 及前後版本參照。

控制與驗收

「Risk Weight 專業審查邊界」驗收時，採狀態機、Optimistic Lock、授權檢查與 Audit Writer；跨服務發布使用 Transactional Outbox。

「Risk Weight 專業審查邊界」驗收時，驗收需覆蓋合法轉換、越權拒絕、重送冪等、例外覆核與歷史重建。


## 22. API v1 官方基線

公共 API 統一採 /api/v1；內部服務可用 /v1，但不得形成第二套公開契約。

R5.2 整合內容與契約

Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。

Error Contract 至少包含 code、message、trace_id、retryable 與 details，不回傳 Prompt、Token 或敏感堆疊。

Webhook 具簽章、時間戳、重試、退避、去重、停用、Dead Letter Queue 與告警。

代表端點包含 /api/v1/stylematch/projects、/api/v1/ai/agents/{agent_id}/runs、/api/v1/handovers、/api/v1/isafe/cases/{isafe_case_id}。

控制與驗收

公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

Mock、Adapter 與 Sandbox 均需通過契約測試，禁止以測試路徑寫入正式決策資料。


## 23. Website Gap Audit

Website Gap Audit 比對現有網站與 R5 的身分、租戶、資料契約、Audit、Consent、Handover 及產品邊界差距。

R5.2 整合內容與契約

就「Website Gap Audit」而言，Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。

就「Website Gap Audit」而言，Error Contract 至少包含 code、message、trace_id、retryable 與 details，不回傳 Prompt、Token 或敏感堆疊。

就「Website Gap Audit」而言，Webhook 具簽章、時間戳、重試、退避、去重、停用、Dead Letter Queue 與告警。

控制與驗收

「Website Gap Audit」驗收時，公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

「Website Gap Audit」驗收時，Mock、Adapter 與 Sandbox 均需通過契約測試，禁止以測試路徑寫入正式決策資料。


## 24. Mock / Adapter 邊界

Mock 僅供介面與測試；Adapter 負責舊系統轉換，不得繞過正式權限、驗證、Audit 或 Canonical Contract。

R5.2 整合內容與契約

就「Mock / Adapter 邊界」而言，Request Context 至少包含 tenant_id、organization_id、purpose、consent_ref、trace_id 與 idempotency_key。

就「Mock / Adapter 邊界」而言，Error Contract 至少包含 code、message、trace_id、retryable 與 details，不回傳 Prompt、Token 或敏感堆疊。

就「Mock / Adapter 邊界」而言，Webhook 具簽章、時間戳、重試、退避、去重、停用、Dead Letter Queue 與告警。

控制與驗收

「Mock / Adapter 邊界」驗收時，公共契約的破壞性變更必須升版；Deprecated 需公告期限、遷移說明與使用量監測。

「Mock / Adapter 邊界」驗收時，Mock、Adapter 與 Sandbox 均需通過契約測試，禁止以測試路徑寫入正式決策資料。


## 25. GS-25～27 技術母本定位

GS-25～27 分別管制 Contract Baseline、工項／施工期別、付款節點與付款資格。

R5.2 整合內容與契約

「GS-25～27 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

TIGI-GS-25：合約基線治理標準，確認工程範圍、圖說、估價、工期、付款與變更基準一致。

TIGI-GS-26：工項與施工期別治理標準，將個案工項配置至第一、二、三期工程施工及對應責任角色。

控制與驗收

寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 26. GS-28～30 技術母本定位

GS-28～30 分別管制 DGM 綁定、AI 輔助治理、消費者旅程與資料回饋。

R5.2 整合內容與契約

「GS-28～30 技術母本定位」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「GS-28～30 技術母本定位」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

就「GS-28～30 技術母本定位」而言，正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

就「GS-28～30 技術母本定位」而言，TIGI-GS-25：合約基線治理標準，確認工程範圍、圖說、估價、工期、付款與變更基準一致。

就「GS-28～30 技術母本定位」而言，TIGI-GS-26：工項與施工期別治理標準，將個案工項配置至第一、二、三期工程施工及對應責任角色。

控制與驗收

「GS-28～30 技術母本定位」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「GS-28～30 技術母本定位」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 27. 合約基線資料模型

Contract Baseline 是核准範圍、圖說、估價、工期、付款節點與變更規則的版本化快照。

R5.2 整合內容與契約

「合約基線資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「合約基線資料模型」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

就「合約基線資料模型」而言，正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

控制與驗收

「合約基線資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「合約基線資料模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 28. 工項期別資料模型

工項期別模型將 Work Item、Phase、責任角色、前置條件、Checklist、Evidence 與 Gate 建立明確關聯。

R5.2 整合內容與契約

「工項期別資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「工項期別資料模型」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

就「工項期別資料模型」而言，正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

控制與驗收

「工項期別資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「工項期別資料模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 29. 付款資格資料模型

Payment Eligibility 只記錄合約付款條件是否具備，與 Invoice、Payment Approval、Payment Execution 分離。

R5.2 整合內容與契約

PaymentEligibility 必含 eligibility_id、milestone_id、contract_baseline_ref、gate_decision_id、evidence_refs、status、effective_at、expires_at、confirmed_by 與 reason。

Gate 完成只是里程碑評估的一項輸入；契約條件與付款證據未齊全時不得標示 eligible。

資格判定、Invoice、Payment Approval 與 Payment Execution 分屬不同權責與稽核軌跡。

控制與驗收

「付款資格資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「付款資格資料模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 30. 數位治理手冊綁定模型

DGM Binding 將手冊、DGI、Step、Work Item、Evidence Type 與 Gate Rule 以有效期間和版本關聯。

R5.2 整合內容與契約

「數位治理手冊綁定模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「數位治理手冊綁定模型」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

就「數位治理手冊綁定模型」而言，正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

控制與驗收

「數位治理手冊綁定模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「數位治理手冊綁定模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 31. AI 輔助治理資料模型

AI 治理資料將 finding／hint／proposal 與正式 Decision 分表、分權限、分事件並保留人工確認。

R5.2 整合內容與契約

「AI 輔助治理資料模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「AI 輔助治理資料模型」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

就「AI 輔助治理資料模型」而言，正式快照與附件以 Object Reference、內容雜湊、版本和權限關聯，不在事件中搬移非必要個資。

就「AI 輔助治理資料模型」而言，AI 可協助分類、提示、比對與摘要，但不得取代專業簽核與法定責任。

控制與驗收

「AI 輔助治理資料模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「AI 輔助治理資料模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 32. 消費者旅程資料回饋模型

跨產品旅程由 journey_id 串聯 StyleMatch、TWCID、正式 Project、iSAFE 與 DEOS，不以 Email 或手機當主鍵。

R5.2 整合內容與契約

「消費者旅程資料回饋模型」需定義唯一 ID、Owner、Schema Version、狀態、來源參照、建立／更新時間及 Audit Reference。

就「消費者旅程資料回饋模型」而言，跨產品關聯統一使用 tenant_id、journey_id、stylematch_project_id、match_case_id、project_id、isafe_case_id、deos_project_id。

Handover 必要欄位（1/3）：schema_version、handover_id、idempotency_key、created_at、tenant_id、organization_id、journey_id、stylematch_project_id、match_case_id、project_id。

Handover 必要欄位（2/3）：requirement_profile_ref、style_profile_ref、space_profile_ref、budget_profile_ref、proposal_refs、attachment_refs、source_versions、contract_baseline_ref、scope_summary、budget_summary。

Handover 必要欄位（3/3）：schedule_summary、consent_ref、consent_scope、consent_at、retention_policy、trace_id、correlation_id、source_system。

控制與驗收

「消費者旅程資料回饋模型」驗收時，寫入前執行 Schema、租戶、授權、狀態、必填與參照完整性驗證。

「消費者旅程資料回饋模型」驗收時，歷史版本不得原地覆寫；更正採新版本、原因、核准者與取代關係。


## 33. StyleMatch AI 前端事件

StyleMatch 前端事件只描述互動與 AI 任務；建立正式專案使用 StyleMatchProjectCreated，不占用 ProjectCreated。

R5.2 整合內容與契約

Canonical Event（1/3）：JourneyCreated、DemandProfileCompleted、StyleMatchProjectCreated、MatchRequested、ProviderSelected、ContractBaselineApproved。

Canonical Event（2/3）：ProjectHandoverApproved、ProjectCreated、ISAFECaseCreated、GovernanceInitiated、EvidenceRegistered、GateEvaluated。

Canonical Event（3/3）：PaymentEligibilityChanged、AcceptanceCompleted、DEOSProjectActivated、ProjectClosed。

「StyleMatch AI 前端事件」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

控制與驗收

不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 34. TWCID 媒合資料

TWCID 擁有 match_case_id、候選、邀標／招標、媒合決策、成交、評價與授權快照。

R5.2 整合內容與契約

「TWCID 媒合資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「TWCID 媒合資料」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「TWCID 媒合資料」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

控制與驗收

「TWCID 媒合資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「TWCID 媒合資料」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 35. iSAFE 2.0 個案治理資料

iSAFE 以 isafe_case_id 管理 Governance、StepInstance、Gate、Evidence、Risk、NCR/CAPA、驗收、保固與 PGP。

R5.2 整合內容與契約

「iSAFE 2.0 個案治理資料」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「iSAFE 2.0 個案治理資料」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「iSAFE 2.0 個案治理資料」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

Canonical Event 使用 ISAFECaseCreated、GovernanceInitiated、EvidenceRegistered、GateEvaluated、PaymentEligibilityChanged。

控制與驗收

「iSAFE 2.0 個案治理資料」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「iSAFE 2.0 個案治理資料」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 36. 資料回饋迴圈

資料回饋僅交換經授權、最小必要、可追溯的結構化結果，不將客戶資料默認送入模型訓練。

R5.2 整合內容與契約

「資料回饋迴圈」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「資料回饋迴圈」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「資料回饋迴圈」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

就「資料回饋迴圈」而言，消費者旅程統一為 StyleMatch AI → TWCID 媒合 → iSAFE 2.0 → 資料回饋迴圈。

控制與驗收

「資料回饋迴圈」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「資料回饋迴圈」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 37. 權限與角色模型

採 OIDC/OAuth 2.1、SSO、MFA、短效 Token、RBAC 與 ABAC；所有授權均需服務端驗證 Tenant Context。

R5.2 整合內容與契約

「權限與角色模型」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「權限與角色模型」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「權限與角色模型」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

API Key 僅供 Server-to-Server；使用者端採 Authorization Code + PKCE。

控制與驗收

「權限與角色模型」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「權限與角色模型」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 38. PM / G / WI 編碼

PM、G、WI 代碼分別對應管理計畫、Gate 與工項；編碼只承載識別，不內嵌個資或可變狀態。

R5.2 整合內容與契約

「PM / G / WI 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「PM / G / WI 編碼」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「PM / G / WI 編碼」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

控制與驗收

「PM / G / WI 編碼」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「PM / G / WI 編碼」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 39. EVD / NCR / CAPA 編碼

EVD、NCR、CAPA 形成證據、缺失及矯正預防措施的可追溯鏈，彼此以參照關係連接。

R5.2 整合內容與契約

「EVD / NCR / CAPA 編碼」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「EVD / NCR / CAPA 編碼」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「EVD / NCR / CAPA 編碼」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

控制與驗收

「EVD / NCR / CAPA 編碼」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「EVD / NCR / CAPA 編碼」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 40. 審計軌跡與版本追溯

Audit Ledger 保存誰在何時以何角色對何物件執行何操作、理由、結果、前後參照及 Trace。

R5.2 整合內容與契約

「審計軌跡與版本追溯」由明定的產品 Owner 寫入，其他產品只能依 Scope 讀取或提交草稿。

就「審計軌跡與版本追溯」而言，事件信封包含 event_id、event_type/version、occurred_at、producer、tenant、Trace、Correlation、Causation、冪等鍵與 data。

就「審計軌跡與版本追溯」而言，Link Registry 保存跨產品 ID 映射、來源版本、關係狀態與有效期間。

控制與驗收

「審計軌跡與版本追溯」驗收時，不得共用產品資料庫、跨站 Token 或前端 localStorage 作正式整合；服務端必須重驗 Tenant Context。

「審計軌跡與版本追溯」驗收時，Audit 與事件消費端須冪等，失敗可重送並保留可查詢的處理結果。


## 41. 工程案例流程

工程案例從旅程、需求、媒合、Contract Baseline、Handover、治理、驗收到營運形成端到端可重建紀錄。

R5.2 整合內容與契約

「工程案例流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。

所有基線、圖說、估價、合約、施工及驗收成果均保留版本與核准狀態。

跨階段移交使用 handover_id、schema_version、idempotency_key、Consent、Trace 與附件參照。

控制與驗收

前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 42. 設計階段流程

設計階段以版本核准、專業責任與 Gate 控制圖說從規劃到定案的轉換。

R5.2 整合內容與契約

設計治理依 D1 前置、D2 平面、D3 基本設計、D4 立面、D5 施工大樣逐階驗收，不得用現勘、提案等抽象名稱取代。

各 Gate 驗收 stage-specific Evidence、版本、責任者與內容雜湊；Override 須具權限、理由、期限與事後審查。

控制與驗收

「設計階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「設計階段流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 43. 估價階段流程

估價階段以核准範圍、數量、單價、假設、有效期限與版本形成可比較的 Estimate Baseline。

R5.2 整合內容與契約

「估價階段流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。

就「估價階段流程」而言，所有基線、圖說、估價、合約、施工及驗收成果均保留版本與核准狀態。

就「估價階段流程」而言，跨階段移交使用 handover_id、schema_version、idempotency_key、Consent、Trace 與附件參照。

控制與驗收

「估價階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「估價階段流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 44. 合約階段流程

合約階段將範圍、預算、工期、付款、保留款、追加減、驗收與爭議條款形成 Contract Baseline。

R5.2 整合內容與契約

「合約階段流程」明確定義前置輸入、責任角色、活動、輸出、Evidence、例外與完成 Gate。

就「合約階段流程」而言，所有基線、圖說、估價、合約、施工及驗收成果均保留版本與核准狀態。

就「合約階段流程」而言，跨階段移交使用 handover_id、schema_version、idempotency_key、Consent、Trace 與附件參照。

控制與驗收

「合約階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「合約階段流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 45. 施工階段流程

施工階段以工項、期別、日誌、照片、檢查、缺失、變更及責任角色維持 Evidence Chain。

R5.2 整合內容與契約

工程治理依 C1 前置、C2 第一期、C3 第二期、C4 第三期、C5 保固售後執行；工項依契約配置到各期。

施工日誌、照片、檢查、NCR、CAPA、追加減與付款里程碑必須連到 Work Item、Phase、責任角色及內容雜湊。

控制與驗收

「施工階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「施工階段流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 46. 驗收階段流程

驗收階段比對 Contract Baseline、完工成果、缺失改善、文件移交與付款資格，不由 AI 自動判定。

R5.2 整合內容與契約

各施工期可有階段驗收；最終 Acceptance 仍比對 Contract Baseline、完工成果、NCR／CAPA 關閉與文件移交。

C4 是第三期工程施工，不得重新命名為完工驗收；Acceptance 是關聯於階段與契約的治理物件。

控制與驗收

「驗收階段流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「驗收階段流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 47. 維運與回饋流程

維運與回饋管理保固、報修、修繕、售後服務、滿意度與去識別改善資料，不改寫封存 Evidence。

R5.2 整合內容與契約

C5 是保固修繕及售後服務，不得重新命名為治理封存；Closed／Archived 是 C5 完成後的案件生命週期狀態。

保固、修繕與售後紀錄保留 Evidence、Owner、SLA、狀態、完成時間與稽核軌跡。

控制與驗收

「維運與回饋流程」驗收時，前置條件未滿足不得跳步；Override 需具權限、理由、證據、期限與事後審查。

「維運與回饋流程」驗收時，完成條件由規則與授權角色判定；AI 僅提供提示、比對、摘要與草稿。


## 48. iSAFE-DGM 風險訊號

DGM Risk Signal 必須有來源題碼、觸發規則、嚴重度、適用範圍、人工覆核與處置狀態。

R5.2 整合內容與契約

「iSAFE-DGM 風險訊號」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

DGI、表單、風險、例外與 AI Task 均以穩定 ID 連結，不以顯示文字作資料關聯。

正式資料與建議資料分表、分事件、分授權，並記錄接受、修正或拒絕結果。

控制與驗收

AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 49. DGI 題項對照要求

每個 DGI 題項需對應 DGM、GS、步驟、角色、資料型別、必填條件、Evidence 與版本。

R5.2 整合內容與契約

「DGI 題項對照要求」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

就「DGI 題項對照要求」而言，DGI、表單、風險、例外與 AI Task 均以穩定 ID 連結，不以顯示文字作資料關聯。

就「DGI 題項對照要求」而言，正式資料與建議資料分表、分事件、分授權，並記錄接受、修正或拒絕結果。

控制與驗收

「DGI 題項對照要求」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

「DGI 題項對照要求」驗收時，發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 50. 表單到資料庫欄位策略

表單欄位映射到穩定資料契約，UI 標籤可變但欄位 ID、型別、枚舉與遷移規則需版本化。

R5.2 整合內容與契約

「表單到資料庫欄位策略」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

就「表單到資料庫欄位策略」而言，DGI、表單、風險、例外與 AI Task 均以穩定 ID 連結，不以顯示文字作資料關聯。

就「表單到資料庫欄位策略」而言，正式資料與建議資料分表、分事件、分授權，並記錄接受、修正或拒絕結果。

控制與驗收

「表單到資料庫欄位策略」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

「表單到資料庫欄位策略」驗收時，發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 51. 資料品質規則

資料品質控制完整性、有效性、一致性、唯一性、及時性與可追溯性，錯誤不得被靜默修正。

R5.2 整合內容與契約

「資料品質規則」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

就「資料品質規則」而言，DGI、表單、風險、例外與 AI Task 均以穩定 ID 連結，不以顯示文字作資料關聯。

就「資料品質規則」而言，正式資料與建議資料分表、分事件、分授權，並記錄接受、修正或拒絕結果。

控制與驗收

「資料品質規則」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

「資料品質規則」驗收時，發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 52. 例外處理與人工覆核

Fallback、Override、Freeze、Escalation 均需授權、理由、Evidence、期限與事後審查。

R5.2 整合內容與契約

「例外處理與人工覆核」需保留規則／模型版本、輸入參照、輸出、信心或嚴重度、來源及人工確認。

就「例外處理與人工覆核」而言，DGI、表單、風險、例外與 AI Task 均以穩定 ID 連結，不以顯示文字作資料關聯。

就「例外處理與人工覆核」而言，正式資料與建議資料分表、分事件、分授權，並記錄接受、修正或拒絕結果。

控制與驗收

「例外處理與人工覆核」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

「例外處理與人工覆核」驗收時，發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 53. AI 輸出限制

AI 禁止直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval、DEOSTransaction。

R5.2 整合內容與契約

高影響 AI Trace 必要欄位（1/2）：agent_id、model_provider、model_version、prompt_version、knowledge_version、input_hash、output_hash。

高影響 AI Trace 必要欄位（2/2）：citations、warnings、confidence、token_compute_usage、human_confirmation、retention_policy。

AI 不得直接寫入 MatchResult、ContractBaselineApproval、GateDecision、RiskScore、EvidenceAcceptance、PaymentEligibility、PaymentApproval 或 DEOSTransaction。

human_confirmation、citations、warnings、confidence 與 retention_policy 必須隨高影響輸出保存。

控制與驗收

「AI 輸出限制」驗收時，AI 或未授權角色嘗試寫入正式治理欄位時必須拒絕並留下 Audit。

「AI 輸出限制」驗收時，發布前執行規則測試、AI 固定評估集、回歸門檻、人工抽查與錯誤分類。


## 54. 正式文件體系

正式文件體系包含 MASTER、TGF、BRS、TGS、SAD、SDD、DDS、OpenAPI、Event Schema、PGP、KG、AI Platform、ADR 與 Runbook。

R5.2 整合內容與契約

「正式文件體系」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

每份衍生文件記錄目的、對象、版本、來源章節、差異與批准狀態。

共用表格與規格由單一來源產生，避免 Word、PDF、Markdown 各自維護。

控制與驗收

遇到衝突依 R5 ADR、R5 Master、R5 Annex、R3、R2 的效力順序處理。

發布需完成文字、結構、連結、Checksum 與視覺渲染檢查。


## 55. SBIR 文件引用方式

SBIR 引用 R5 的研發邊界、12 個月工作包、量化 KPI、驗證方法與成果交付，不宣稱本期完成大型 ERP。

R5.2 整合內容與契約

「SBIR 文件引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

就「SBIR 文件引用方式」而言，每份衍生文件記錄目的、對象、版本、來源章節、差異與批准狀態。

就「SBIR 文件引用方式」而言，共用表格與規格由單一來源產生，避免 Word、PDF、Markdown 各自維護。

控制與驗收

「SBIR 文件引用方式」驗收時，遇到衝突依 R5 ADR、R5 Master、R5 Annex、R3、R2 的效力順序處理。

「SBIR 文件引用方式」驗收時，發布需完成文字、結構、連結、Checksum 與視覺渲染檢查。


## 56. BP 文件引用方式

商業計畫引用產品責任、獨立 SaaS 方案、整合套裝、計量、GTM、護城河與 36 個月成長路線。

R5.2 整合內容與契約

商業計畫引用 R5 完整產品敘事，但計費與方案契約依 R5.2 修正。

Platform Core Billing 物件：Product、Plan、Feature、Entitlement、Subscription、UsageEvent、InvoiceReference。

SaaS Module Flag：stylematch_ai_enabled、isafe_enabled、twcid_marketplace_enabled、api_access_enabled、white_label_enabled、custom_domain_enabled。

PaymentEligibility 不等於 Invoice、PaymentApproval 或付款執行，也不觸發自動付款。

控制與驗收

「BP 文件引用方式」驗收時，遇到衝突依 R5 ADR、R5 Master、R5 Annex、R3、R2 的效力順序處理。

「BP 文件引用方式」驗收時，發布需完成文字、結構、連結、Checksum 與視覺渲染檢查。


## 57. 白皮書引用方式

白皮書引用治理問題、可信狀態、Evidence、AI 責任分離、資料主權與跨產業 Governance Profile。

R5.2 整合內容與契約

「白皮書引用方式」引用 R5 Canonical 名稱與決策，不重複貼入整份工程母本。

就「白皮書引用方式」而言，每份衍生文件記錄目的、對象、版本、來源章節、差異與批准狀態。

就「白皮書引用方式」而言，共用表格與規格由單一來源產生，避免 Word、PDF、Markdown 各自維護。

控制與驗收

「白皮書引用方式」驗收時，遇到衝突依 R5 ADR、R5 Master、R5 Annex、R3、R2 的效力順序處理。

「白皮書引用方式」驗收時，發布需完成文字、結構、連結、Checksum 與視覺渲染檢查。


## 58. 部署與整合路線

部署由 Modular Monolith 加獨立 AI/Governance Services 起步，再依負載與責任邊界拆分服務。

R5.2 整合內容與契約

「部署與整合路線」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

服務、資料庫、物件儲存、快取、事件與日誌均帶 Tenant Context 並納入可觀測性。

方案包含備份、RPO/RTO、Incident Response、Migration、Rollback 與定期演練。

初期允許既有 TWCID PHP/MySQL 維持運作，以 API 與 Adapter 漸進整合。

控制與驗收

正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 59. 資安與隱私邊界

資料分級、加密、KMS、Secret Rotation、WAF、DLP、SBOM、Retention、刪除、Legal Hold 與跨境政策為上線基線。

R5.2 整合內容與契約

「資安與隱私邊界」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

就「資安與隱私邊界」而言，服務、資料庫、物件儲存、快取、事件與日誌均帶 Tenant Context 並納入可觀測性。

就「資安與隱私邊界」而言，方案包含備份、RPO/RTO、Incident Response、Migration、Rollback 與定期演練。

客戶資料預設不得用於模型訓練；跨案件分析需合法授權或去識別。

控制與驗收

「資安與隱私邊界」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「資安與隱私邊界」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 60. 產業驗證指標

產業驗證以真實角色、真實案件、跨站 Handover、治理閉環、可追溯性與採用阻力衡量。

R5.2 整合內容與契約

「產業驗證指標」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

就「產業驗證指標」而言，服務、資料庫、物件儲存、快取、事件與日誌均帶 Tenant Context 並納入可觀測性。

就「產業驗證指標」而言，方案包含備份、RPO/RTO、Incident Response、Migration、Rollback 與定期演練。

控制與驗收

「產業驗證指標」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「產業驗證指標」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 61. KPI 與可量測成果

KPI 涵蓋 AI 可採用度、Handover 成功率、Trace 覆蓋率、Evidence 完整率、租戶隔離與付費轉換。

R5.2 整合內容與契約

「KPI 與可量測成果」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

就「KPI 與可量測成果」而言，服務、資料庫、物件儲存、快取、事件與日誌均帶 Tenant Context 並納入可觀測性。

就「KPI 與可量測成果」而言，方案包含備份、RPO/RTO、Incident Response、Migration、Rollback 與定期演練。

AI 需求摘要可採用度目標 80% 以上；租戶隔離與 AI 越權測試必須零洩漏、零越權寫入。

控制與驗收

「KPI 與可量測成果」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「KPI 與可量測成果」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 62. 驗證與測試清單

測試涵蓋單元、整合、契約、權限、租戶隔離、AI 回歸、Webhook 重放、資料遷移、備援與 Rollback。

R5.2 整合內容與契約

狀態機測試涵蓋十階段順序、禁止跳階、Intake／Handover 邊界、C2～C4 三期施工與 C5 售後語意。

Gate 測試涵蓋缺證據拒絕、Passed 前進、Conditional／Failed 不前進、Waived 權限／理由／期限、Optimistic Lock 與冪等重送。

付款測試必證明 Gate Passed 不會自行建立資格；只有獨立里程碑評估完成才可產生 PaymentEligibilityChanged。

Legacy Mapping、資料備份、migration review、rollback 與 production smoke test 必須完成。

控制與驗收

「驗證與測試清單」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「驗證與測試清單」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 63. PDF / Word / Markdown 一致性

DOCX、PDF、Markdown 的版本、章節、正式名稱、決策與 Checksum 必須一致，視覺 QA 另記錄頁數與結果。

R5.2 整合內容與契約

DOCX、PDF、Markdown、State Machine JSON、API 回應、UI 顯示與測試逐項比對十個 stage code／key／name。

若缺任一正式名稱，或 C2～C4 不等於第一至三期工程施工，發布檢查必須失敗。

控制與驗收

「PDF / Word / Markdown 一致性」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「PDF / Word / Markdown 一致性」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 64. 送件附件索引

送件附件索引只列已存在且可校驗的正式檔案；外部來源、歷史版本與 R5 產物分開列示。

R5.2 整合內容與契約

「送件附件索引」需指定 Owner、環境、指標、門檻、證據、異常處理與發布條件。

就「送件附件索引」而言，服務、資料庫、物件儲存、快取、事件與日誌均帶 Tenant Context 並納入可觀測性。

就「送件附件索引」而言，方案包含備份、RPO/RTO、Incident Response、Migration、Rollback 與定期演練。

控制與驗收

「送件附件索引」驗收時，正式上線前完成安全、權限、租戶隔離、契約、效能、復原與資料生命週期測試。

「送件附件索引」驗收時，KPI 需有計算式、資料來源、期間、Owner、基準值與目標值，不只列口號。


## 65. R5.2 狀態機驗證重點

R5.2 驗證新增十階段語意、Evidence Gate、Waiver、付款分離與 Legacy Migration，並保留 R5.1 五組契約完整性。

R5.2 整合內容與契約

十個 stage code、stage key、正式中文名稱與 required_evidence 必須與 State Machine JSON 一致。

R5.1 契約仍須維持 Canonical Event 16/16、Handover 28/28、Billing 7/7、AI Trace 13/13、SaaS Flag 6/6。

Registry completeness：TIGI-GS 30/30；iSAFE-DGM SOURCE_FOUND 24/24；DGI SOURCE_FOUND 411/411；435 筆均待治理核准與正式整合。

DOCX、PDF、Markdown、JSON、API、UI、Migration 與 QA 結果必須一致。

控制與驗收

「R2 驗證重點」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「R2 驗證重點」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 66. 後續版本更新條件

後續升格 Final Official 前，須完成 iSAFE-DGM 24 項與 DGI 411 題的治理核准、ID 遷移、正式發布整合與 QA。

R5.2 整合內容與契約

後續版本以 isafe-state-machine-r5.2.json 為單一可執行狀態來源；文件、API、前端不得各自維護不同名稱。

破壞性 stage key 變更必須升版並提供 Legacy Mapping、人工覆核、Rollback、Audit 與資料遷移報告。

435 筆 Registry 的治理核准、ID 遷移、正式發布整合、部署核准、資料庫備份與 production smoke test 完成前，不得升格 Final Official。

控制與驗收

「後續 R3 更新條件」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「後續 R3 更新條件」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 67. 附錄 A：GS-25～30

附錄集中列示 GS-25～30 的正式用途，主文只引用一次，避免在多分冊反覆貼上同一段文字。

R5.2 整合內容與契約

「附錄 A：GS-25～30」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「附錄 A：GS-25～30」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「附錄 A：GS-25～30」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

就「附錄 A：GS-25～30」而言，TIGI-GS-25：合約基線治理標準，確認工程範圍、圖說、估價、工期、付款與變更基準一致。

就「附錄 A：GS-25～30」而言，TIGI-GS-26：工項與施工期別治理標準，將個案工項配置至第一、二、三期工程施工及對應責任角色。

控制與驗收

「附錄 A：GS-25～30」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「附錄 A：GS-25～30」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 68. 附錄 B：九類命名空間

附錄列示九類命名空間及 Registry 責任，任何新代碼類型需經 ADR 核准。

R5.2 整合內容與契約

「附錄 B：九類命名空間」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「附錄 B：九類命名空間」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「附錄 B：九類命名空間」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

就「附錄 B：九類命名空間」而言，九類命名空間：TIGI-GS、iSAFE-DGM、DGI、WI、G、PM、EVD、NCR、CAPA。

控制與驗收

「附錄 B：九類命名空間」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「附錄 B：九類命名空間」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 69. 附錄 C：Gate 說明

附錄統一 Gate、Payment Eligibility、Invoice、Approval 與 Execution 的語意及責任邊界。

R5.2 整合內容與契約

GateEvaluated 表示治理判定；PaymentEligibilityChanged 只由獨立里程碑評估產生。

Invoice、Payment Approval、Payment Execution 分屬計費、授權與交易責任。

Passed 必須有 Stage Evidence；Waived 必須具 authority、reason 與未來 expires_at。

控制與驗收

「附錄 C：Gate 說明」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「附錄 C：Gate 說明」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 70. 附錄 D：DGI 分類

附錄統一 DGI 三類資料語意、題碼穩定性與題庫版本規則。

R5.2 整合內容與契約

「附錄 D：DGI 分類」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「附錄 D：DGI 分類」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「附錄 D：DGI 分類」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

控制與驗收

「附錄 D：DGI 分類」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「附錄 D：DGI 分類」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 71. 附錄 E：資料回饋迴圈

附錄描述跨產品資料回饋的 Consent、最小必要、去識別、保留期限、撤回與 Audit 要求。

R5.2 整合內容與契約

「附錄 E：資料回饋迴圈」以 R5 正式名稱、版本和 Canonical Contract 為準。

就「附錄 E：資料回饋迴圈」而言，歷史來源保留檔名、日期、SHA-256 與版本關係；R2、R3、兩套 R4、R4.1 均不覆寫。

就「附錄 E：資料回饋迴圈」而言，附錄只集中補充查閱資料，不複製已在主文定義的共同原則。

就「附錄 E：資料回饋迴圈」而言，消費者旅程統一為 StyleMatch AI → TWCID 媒合 → iSAFE 2.0 → 資料回饋迴圈。

控制與驗收

「附錄 E：資料回饋迴圈」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「附錄 E：資料回饋迴圈」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## 72. R6 iSAFE 2.0 本地實作驗證基線

R6 將 R5.2 狀態機、R5.2.1 GS30 復原內容與舊站監管核心功能整合為可執行的本地工程基線。

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

本地 API 位於 127.0.0.1:4180；網站位於 127.0.0.1:4174，資料庫採 Node.js SQLite。

核心 Legacy API 涵蓋 workspace、checklist status、evidence files、contract baseline、receipts、change orders 與 messages。

控制與驗收

Gate Passed 只表示治理條件成立，不會自動建立 Payment Eligibility、Invoice、付款核准或付款執行。

Payment Eligibility 仍由獨立契約里程碑評估產生，Approval 與 Execution 維持權責分離。

本地測試結果是 Pilot／工程驗證證據，不得描述為正式生產環境上線、正式資安驗證或外部使用成效。

正式發布前必須完成權限矩陣、物件儲存、病毒掃描、檔案版本與保留政策、通知服務及 production smoke test。

iSAFE-DGM 24 項與 DGI 411 題來源已取得並通過完整性檢查；治理核准、ID 遷移與正式發布整合尚未完成。


## 73. 結語

確認 R5 作為可獨立執行的最終工程母本，歷史版本保留追溯，後續產品與文件以此為預設入口。

R5.2 整合內容與契約

R5.2 恢復 R4.1 與原 TWCID iSAFE 的兩階段十步驟，修正 R5／R5.1 的狀態機明細遺失；歷史原檔保持不變。

本整合版同時保留 R5 Final 敘事、R5.1 契約與 R5.2 狀態機，可作 iSAFE 實作、SBIR、BP 與白皮書共同母本。

DGM-01～24 與 411 題 DGI 來源已取得，仍待治理核准與正式整合；GS-01～24 已由 2026-07-13 Version Freeze 復原，整體發布狀態維持 Release Candidate。

控制與驗收

「結語」驗收時，任何後續修訂使用 ADR、差異表及新版本發布，不直接改寫已發布文件。

「結語」驗收時，驗收以內容完整、無重複樣板、契約一致、頁數合理及可獨立使用為準。


## R6.1 Governance Registry Integration Baseline（2026-07-23）

本附錄將 TIGI Engineering Master 納入 TIGI Governance Master R6.1 的共同治理基線。

| 控制項 | R6.1 狀態 |
| --- | --- |
| 上位治理母本 | TIGI_Governance_Master_24_Chapters_Independent_Edition_20260723_R6_1_RC.docx |
| TIGI-GS | 30/30 已復原並維持權威 |
| iSAFE-DGM | SOURCE_FOUND 24/24；待治理核准與發布整合 |
| DGI | SOURCE_FOUND 411/411；待 ID 遷移、治理核准與發布整合 |
| Payment | Gate PASS 不等於 Payment Eligibility、Approval、Invoice 或 Execution |
| 發布狀態 | R6.1 Release Candidate；不得標示 Final Official |

### 文件族譜

Canonical Contract / Approved Registry > Governance Master > TIGI Engineering Master > 歷史來源

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


### TIGI Engineering Master 更新控制

- API、Schema、Event Registry、SQL Schema 與架構圖均以 Release Checklist 的證據狀態為準；只有敘述性規格時不得宣稱正式工程成品已發布。
- Evidence Gate、Payment Eligibility、Waiver、NCR/CAPA 與本地 API 目前最高成熟度為 LOCALLY_IMPLEMENTED；未取得 production deployment 證據前不得標示 PRODUCTION_DEPLOYED。
- 工程實作衝突時，先依 Canonical Contract、Approved Registry 與 Accepted ADR；Official QA Report 僅作驗收摘要，不取代原始證據。
### Final Official Release Blockers

完成 DGM 24 與 DGI 411 的治理核准及發布整合。

修正 Canonical Contract 的舊 remaining_registry_source_required=435 欄位。

建立並核准 R6.1 ADR Master。

將 Governance Master 與 State Machine Contract 納入正式 Release Package。

正式發布 OpenAPI、SQL Schema、JSON Schema 與獨立架構圖來源。

完成 Git commit、tag、push、GitHub Release 與 SHA256 驗證。

Final Official 只能由 Final Release Decision 的 GO 及全部 Required Gate PASS 共同產生，不得人工直接切換。


## R7.2 Style / Proposal / Vision / Commercial QA Integrated Addendum

工程母本｜版本 20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜發布識別 TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

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

TIGI Engineering Master｜20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

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

- 工程實作以 tigi-r7-implementation.json、stylematch-reference-proposal-r7.schema.json 與 isafe-state-machine-r5.2.json 為可執行契約索引。
- PASS-LOCAL 項目不得在 API、架構圖或操作文件中標示為 Production；localStorage、local token 與萬用案件授權僅是開發例外。
- AI Trace 尚須補齊 input/output hash、模型供應者 registry 與不可竄改儲存。
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

TIGI Engineering Master｜20260810_R7_2_Style_Proposal_Vision_Commercial_QA_Integrated｜TIGI-GOVERNANCE-20260810-R7.2-SPVC-QA

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

- 工程母本以 BusinessAccessGate、planAccess、localStore.consumePoints 與各工具 cost constant 為目前可執行證據；正式後端仍需把方案權限與點數帳本移出 localStorage。
- AIGenerate 建立任務後扣點與其他生成成功後扣點的時點差異必須保留於交易 type、task id、trace 與錯誤補償設計。
- 路由隱藏不是授權；正式環境必須由後端 entitlement／RBAC/ABAC 再驗證。
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

TIGI Engineering Master｜20260813_R8_StyleMatch_iSAFE_Integrated｜TIGI-GOVERNANCE-20260813-R8-SM-ISAFE

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

- 工程母本以版本契約、API 授權、revision 衝突、trace 與可重現測試為主要判讀；UI 顯示 R8 不等於後端已 production deployed。
- StyleMatch build 目前有 2.12 MB 主 bundle／608.29 kB gzip 警告，列為效能優化項，不阻斷本次 Implementation QA。
- 正式環境仍需 OIDC/OAuth 2.1、後端 entitlement、Artifact Storage、AI Trace Registry、伺服端 ledger 與不可竄改 Audit Storage。
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

TIGI Engineering Master｜20260814_R9_Patent_V7_Governance_Aligned｜TIGI-GOVERNANCE-20260814-R9-PATENT-V7

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

- 工程母本將 R8.2 的 Agent Gateway、Skill Router、雙層 RAG、Tool Policy、Cross-Document Consistency 與 Governance Handoff 納入上位架構。
- R9 新增 Risk State、Trigger Rule、Audit Output、External Governance Evaluation 四個受控物件；任何直接 UPDATE 正式 Governance State 的路徑均屬不合格。
- 正式實作需補齊 API、Schema、Migration、Idempotency、Tool Trace、Decision Object 與 Audit Snapshot 的可重建證據。
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

## R9.1 版本控制與權威邊界

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

| 狀態聲明：本版為 Approved Specification Baseline／Candidate Implementation。未經 Phase 0 Repository Audit、Schema／API／SQL、回歸測試、ADR 與 Release Checklist，不得標示 Implemented、Production Ready 或 Final Official。 |
| --- |

| 控制項 | R9.1 決議 |
| --- | --- |
| Canonical Parent | TIGI Engineering Master R9／Patent V7 Governance Aligned |
| State Authority | R5.2 State Machine；正式狀態只能由 iSAFE Gate／Authority 流程改變 |
| Agent Platform | R3.3 Spatial／Visual Tool Governance Aligned |
| Product Baseline | StyleMatch AI Product／Website v8.2.0 Change Specification |
| Patent | V7 locked；新增空間／視覺技術另做 disclosure／prior-art mapping |
| Release | Specification Baseline／Candidate Implementation；Final Official = NO GO |

- 本版完整承接 R9 四母本全文，不刪減既有治理、工程、SBIR、商業與白皮書內容。
- 來源文件 `TIGI_R9_Delta_Extension_Spatial_Visual_ExternalDesignTool_20260816` 定位為候選增補規格，不冒稱完成實作。

R9.1 SPATIAL DESIGN INTELLIGENCE

## Spatial Design Intelligence 目標架構

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

Canonical Design Flow

需求／平面圖／媒體 → StructuredSpace → Layout Candidates → Visual Edit／Render／ViewSet → Material／Product → Proposal Snapshot → Human Approval → Governance Handoff V2 → iSAFE Intake

| 類型 | 處理原則 | R9.1 內容 |
| --- | --- | --- |
| KEEP | 沿用且不得重做 | Multi-tenant、Identity／Role、Agent Router、RAG、Provider Adapter、Image Pipeline、Proposal、Audit、Governance Gate |
| EXTEND | 在既有契約上增量 | Floorplan／Vision、Mask Editing、360、Budget／Material、Approved Asset、Handoff |
| ADD | 新增 Canonical 能力 | StructuredSpace、Constraint-aware Auto Layout、External Connector、Multi-view Consistency、Canonical Catalog |
| ISOLATE | 以 Adapter 隔離 | 生成模型、Vision Provider、SketchUp／外部工具、價格與供應商來源 |

- StyleMatch AI Agent Platform 升至 R3.3，負責規劃、工具編排、政策檢查與 Handoff V2 建立。
- StyleMatch AI Product／Website 升至 v8.2.0 技術基線；實際功能仍依 feature flag 與驗收狀態開放。
- R5.2 State Machine 仍是唯一正式狀態權威；R9.1 不得直接改寫 S1～S10 或繞過 Gate／Authority。

R9.1 SPATIAL DESIGN INTELLIGENCE

## 六大能力模組與可驗收輸出

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

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

## Canonical Object 與 Handoff V2

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

| Canonical Object | 最低必要欄位 | 治理要求 |
| --- | --- | --- |
| StructuredSpace Snapshot | rooms／walls／openings／dimensions／fixtures／furniture／zones／circulation_graph | schema_version、floorplan_version、confidence、correction_refs、checksum、approval state |
| Layout Candidate | structured_space_ref／rule_version／hard_result／soft_score／violations／assumptions | 硬性違規不得隱藏；概念方案標示 conceptual |
| Asset Revision | parent_asset_id／revision／intent／provider trace／quality checks | candidate 不得自動升為 approved |
| Approved ViewSet | anchor／camera refs／identity maps／consistency score／retry refs | 人工選定後才可進 Proposal Snapshot |
| Governance Handoff V2 | proposal／space／layout／asset／viewset／material refs＋approval＋evidence manifest＋checksum | 僅為 iSAFE intake input，不是 Governance Decision Object |

- 不可變快照以 ref＋revision 交付；任何修正建立新版本，不覆寫既有核准證據。
- Provider response、fallback、模型版本、seed／workflow、成本觀測與失敗原因均應保留 trace。
- 跨系統只交換核准參照與證據清單，不複製 iSAFE 正式治理核心到 StyleMatch。

R9.1 SPATIAL DESIGN INTELLIGENCE

## Phase 0～7 實作與驗證路徑

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

| Phase | 主題 | 前置 | 完成證據 |
| --- | --- | --- | --- |
| 0 | Repository Audit | 無 | Repo map、runtime map、KEEP／EXTEND／ADD／CONFLICT／MISSING／UNKNOWN、Trace Matrix、ADR backlog |
| 1 | SS-01 | Phase 0 | Schema、migration、API、校正 UI contract、fixtures |
| 2 | VE Toolkit | Asset lifecycle | 共用 pipeline、10 intents、revision tests |
| 3 | AL-01 | StructuredSpace verified | 規則／幾何測試、violations、conceptual flag |
| 4 | EDT-01 MVP | Canonical mapping | Scene／Camera／Viewport adapter、failure isolation |
| 5 | MVC-01 | ViewSet schema | 一致性指標、selective retry tests |
| 6 | MPI-01 | Catalog source policy | 型錄版本、價格 provenance、budget mapping tests |
| 7 | E2E／Release | 前述 verified | Regression、security、ADR、release／rollback checklist |


R9.1 SPATIAL DESIGN INTELLIGENCE

## Patent、發布與工程 QA 邊界

工程架構、Canonical Object、API／資料契約、分期實作與治理邊界

| 層級 | R9.1 判定 |
| --- | --- |
| Specification Baseline | PASS：版本策略、模組、契約、邊界與驗收方法已定義 |
| Candidate Implementation | 適用：可進入 Repository Audit 與工程 backlog |
| Audited | PENDING：需完成 Phase 0 並逐項映射現存實作 |
| Implemented | PENDING：需有 schema／migration／API／UI／worker／provider 實體 |
| Verified | PENDING：需通過功能、回歸、安全、租戶隔離與人工核准測試 |
| Released | NO GO：需 ADR、manifest、SHA256、tag、部署、監控與 rollback |

- Patent V7 保持鎖定；SS-01、AL-01、MVC-01、EDT-01 等新技術不得直接宣稱已納入既有專利。
- 另行建立 invention disclosure 與 prior-art mapping，再由專利專業人員評估新增、分案或後續申請。
- R9.1 為非破壞性增量；R9 Canonical Parent、R5.2 State Authority、GS／DGM／DGI 與 Payment Eligibility 基線全部保留。

---

## R9.2 統整與單一啟用基線控制

**版本決議。** 本 TIGI Engineering Master 為 TIGI R9.2 的同版發布文件，完整保留 R9.1 內容並統整版本治理；文件升版不代表 Candidate Implementation 已完成程式實作。

**單一啟用基線。** 只有 `20260820_R9_2_Consolidated` 可用於目前工程、商業、SBIR、白皮書與 RAG 檢索。R8、R9、R9.1 作為歷史發布證據移入 `archive/`，並排除於 active RAG index。

**權威邊界。** R5.2 State Machine 仍是正式狀態權威；Patent V7 維持鎖定；Spatial/Visual 新技術另做 invention disclosure 與 prior-art mapping。

**實作條件。** SS-01、AL-01、VE-01–10、EDT-01、MVC-01、MPI-01 與 Governance Handoff Object V2 在完成 Phase 0 Repository Audit、Schema/API/SQL 驗證、回歸、安全審查、ADR 與 Release Checklist 前，均維持 Candidate Implementation。

**保存與刪除。** 歷史 release package、manifest、checksum、ADR 與來源追溯資料保留。只有位於 canonical release/archive 結構之外，且經 SHA-256 驗證內容完全相同的多餘副本，才可永久刪除。
