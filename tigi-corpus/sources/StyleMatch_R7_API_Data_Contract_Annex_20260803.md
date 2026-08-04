# StyleMatch AI R7 API／資料契約附錄

- 附錄版本：20260803_R7_STYLEMATCH_ANNEX_1
- 適用母本：20260730_R7_Implementation_Integrated
- 狀態：LOCAL IMPLEMENTATION BASELINE；非Final Official

## 1. Request Context與案件授權

案件相關API至少必須帶入Authorization、X-Tenant-Id、X-Organization-Id、X-Purpose、X-Consent-Ref、X-Trace-Id、X-Server-Role、X-Case-Role及X-Case-Authorization。寫入另需Idempotency-Key。伺服端必須驗證角色及case_code／isafe_case_id授權，不接受前端顯示角色作為授權證據。

## 2. StyleMatch專案識別碼

project_id與case_code由StyleMatch建立；twcid_match_id只由TWCID媒合結果回存；isafe_case_id只由iSAFE接收正式handover後回存。離線fallback產生的識別碼是開發資料，不得同步為正式isafe_case_id。

## 3. AI分析契約

analysis使用stylematch.analysis.v1，包含deterministic風格分布、confidence、reasons、evidence、預算區間與risk_flags。八字或星座屬使用者選填文化偏好，權重固定不得高於5%，不得表述為科學、命理或風水決策。

## 4. 參考圖片版本契約

reference_revision保存revision_id、project_id、space、image_role、image_url、source_image_url、instruction、prompt、seed、version、status、source_task_id及created_at。修改必須新增版本，不得覆寫既有圖片。

confirmed_reference_set保存confirmed_reference_set_id、version、project_id、revision_ids、images、status及confirmed_at。每次確認建立新版本；正式提案必須引用一個已確認圖組。

## 5. 點數與提案生成契約

point_ledger交易保存transaction_id、idempotency_key、project_id、type、points、status、confirmed_reference_set_id及created_at。扣點只可在提案生成成功的同一提交邊界內完成；失敗不得扣點。同一project_id與confirmed_reference_set_id重試必須回傳既有交易。

## 6. AI圖片任務API

- POST /api/v1/ai/image-tasks：建立冪等任務並驗證case_code授權。
- GET /api/v1/ai/image-tasks/{ai_task_id}：取得任務狀態並驗證原案件授權。
- GET /api/v1/ai/image-tasks/{ai_task_id}/download-entitlement：由後端付款狀態決定下載權限。
- POST /api/v1/ai/image-tasks/{ai_task_id}/checkout-session：建立付款流程，不得由前端自行標示付款完成。
- GET /api/v1/ai/image-tasks/{ai_task_id}/download：完成付款後下載正式檔案。

## 7. 離線與正式環境邊界

localStorage、local token、萬用案件授權及本地點數均只供離線／開發fallback。Production必須使用後端資料庫、正式Identity Provider、最小權限case grant、不可竄改audit、Artifact Storage及付款供應商驗證。
