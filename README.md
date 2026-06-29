# StyleMatch AI

StyleMatch AI 是室內裝修規劃 SaaS 的 localStorage MVP。此版本聚焦於首頁展示、風格測試、AI 裝修規劃設計提案、單張 AI 空間照片生成模擬、我的專案會員權限控台、平台方案價格與案件控台。

## 功能範圍

- 首頁服務介紹、設計風格探索、預算案例與方案摘要
- 免費設計風格測試
- AI 裝修規劃設計提案流程
- 單張 AI 空間照片生成模擬
- 我的專案與 SaaS 會員權限控台
- 平台方案價格
- Cases 案件控台，包含 `case_code`、`twcid_match_id`、`isafe_case_id`、`stage_status`、timeline 與 audit log

## 開發

```powershell
npm install
npm run dev
```

預設開發網址：

```text
http://127.0.0.1:4173
```

## Production Build

```powershell
npm run build
npm run preview
```

Build output：

```text
dist/
```

## 部署建議

建議使用 Vercel 或 Netlify 部署。

- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

目前資料仍使用瀏覽器 `localStorage`，適合 Demo 與流程驗證。正式 SaaS 版本需再接會員登入、資料庫、付款、權限控管與後端 API。
