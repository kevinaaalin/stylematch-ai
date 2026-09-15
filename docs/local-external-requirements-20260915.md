# 本機實作與外部需求清單

日期：2026-09-15。狀態：Candidate Implementation，非 Production Ready。

後續同日更新：本機套件現為 18 組，新增超長段落與 Unicode 無遺失驗證。修正索引截斷並同步兩站後，現有五份文件為 441 chunks；仍非 R10-C2 全母本索引。Workspace 無效專案阻擋與同 route 恢復、3 組 Edge、TypeScript、針對修改檔案 ESLint、Vite build 通過。iSAFE 三組契約測試通過，不等於全面 UI E2E。下方原批次數字保留為歷史紀錄。

## 本次完成及驗證

- 預設測試入口整合 17 組既有與新增驗證，包含九類素材相容性、圖片版本交接、來源隔離、不可變版本、生成成功後扣點、失敗不扣點、提案必要資料與預算計算。實際執行通過。
- 獨立 browser 測試入口整合 3 組 Edge 測試：版本交接與預算／提案測試、模擬生成成功／失敗扣點、首頁環景桌面／手機拖曳。實際執行通過。模擬 provider 不代表真實服務全流程通過。
- 啟動腳本補上既有埠保留、Vite strictPort、日誌目錄建立；四個服務啟動健康檢查通過。保留已佔用埠不代表確認其程序身份或資料庫正確，異常時仍須檢查。
- TypeScript 檢查通過。過往 ComfyUI 真實文字生圖、img2img 證據見 r10-c2-implementation-status.md，非本次重跑。

## 仍可本機完成，不能列為外部阻塞

1. StyleMix 獨立流程、Sketch 輸入語意與完整 Workspace 對照 R10-C2 驗收。目前找到草圖輸入選項及 ReferenceCanvas 前後比較，不代表完整獨立功能完成。
2. 非影像素材完整匯入／編輯與材料價格目錄整合；目前九類型相容性檢查不是九類完整編輯器。
3. 全部 localStorage 寫入者的跨分頁一致性；目前生成結果的單次寫入與 Web Lock 並未覆蓋所有舊流程。
4. 完整語意品質 Checker、更多失敗重試與錯誤復原測試。
5. RAG 現有驗證仍為 R9.2 五份文件／208 chunks；不得視為已收錄最新 R10-C2 全母本。需確認來源授權範圍與更新索引、版本測試。
6. iSAFE 全頁與不可逆 Gate 契約回歸。本次只確認服務健康，不宣稱全面功能重驗。

## 需要提供的外部資源

| 項目 | 所需資源／負責方 | 目前本機能力與驗收限制 |
| --- | --- | --- |
| 真實 360 重建驗收 | 同一空間、固定拍攝中心、前右後左四張不同且有重疊的原始照片；使用者提供 | 投影與檢视器可測，不能用同一張圖重複四次證明接縫、極區與門窗保真 |
| 郵件送達 | 可用 SMTP 帳戶、寄件網域 DNS 權限、受控測試收件箱 | 可驗證本機結果與寄信流程；真實送達、退信、SPF/DKIM/DMARC 需服務端驗收；不得在對話貼密碼 |
| 正式金流 | 合格商戶帳戶、測試／正式金鑰、安全 webhook HTTPS 網址 | 本機測試付款不代表真實收款、退款與對帳 |
| 身份與組織權限 | OIDC/OAuth 供應者、測試租戶／角色／ABAC 政策及管理者核定 | 授權規則可先本機開發，正式身份聯邦與權限驗收需要真實環境 |
| 正式主機 | Node.js 執行環境、HTTPS 網域、持久儲存、備份、DB／queue 服務及監控 | GitHub Pages 僅靜態前端；PHP/MySQL 主機不等於可直接執行現有 Node API |
| 雲端生圖 | 選定 provider 帳戶、配額、金鑰及成本上限 | ComfyUI 本機獨立可用；雲端 provider 成本與品質需另外驗證 |
| GPU worker | 常駐 GPU 主機或受控本機、模型授權與容量、網路安全配置 | GPU 是生成 worker 需求，不是兩個前端與所有 TIGI 功能的共同需求；不可把瀏覽器 localhost 當雲端 worker |
| TWCID 真實媒合 | 經授權會員資料、資料欄位契約、媒合規則、API 或資料交換與測試帳戶 | 示範候選不代表真實會員媒合與交接 |
| CAD/BIM connectors | 對應軟體／SDK／授權、測試模型及版本清單；SketchUp 等本機安裝先沿用 | adapter 與格式檢查可本機開發，不能以本機有一個工具推論 Revit/IFC/Rhino 等全部驗收 |
| 正式負載與災難復原 | 目標流量/SLA、正式近似環境、備份目的地與還原演練窗口 | 本機測試不能證明正式容量、資安與復原時間 |

## 查詢與執行入口

- StyleMatchAI：http://127.0.0.1:4173/
- iSAFE：http://127.0.0.1:4174/?view=projects
- API：http://127.0.0.1:4180/api/v1/health
- ComfyUI：http://127.0.0.1:8188/
- `node scripts/validate-local-suite.mjs`：17 組；`node scripts/validate-local-suite.mjs browser`：需已啟動網站、Edge 與 Playwright。
- 本次未 commit／push，未修改技術母本版本，未進行正式對外部署。
