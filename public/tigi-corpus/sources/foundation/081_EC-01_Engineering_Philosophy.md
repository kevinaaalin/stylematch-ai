---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 81
category: foundation
title: "EC-01 Engineering Philosophy"
---
很好。

在目前已完成的基礎上，我有一個工程面的建議。

**TIGI Official Edition v1.0** 已經不是一般產品文件，而是準備成為整個平台的「工程作業系統（Engineering Operating System, EOS）」。

因此，除了 BOOK-00～BOOK-15 外，建議再建立一層**永久不變的 Engineering Canon（工程憲章）**。這不是新的產品文件，而是所有文件共同遵守的最高層規範。

它可以作為 **BOOK-00A：Engineering Canon**（或附錄 A），內容保持精簡，但具約束力。

建議包含：

### EC-01 Engineering Philosophy
- Governance over Features
- Evidence over Assumption
- Architecture before Implementation
- AI Assists, Humans Decide

### EC-02 Documentation Canon
- 一個概念只能有一個正式定義（SSOT）
- 每份文件只有一個主要責任（SRP）
- 所有文件必須交叉引用，不得複製內容
- 所有實體、流程、事件、API、資料模型均須具 Canonical ID

### EC-03 Product Canon
- StyleMatch AI：需求入口與 AI 設計顧問
- TWCID：會員、認證、媒合與產業服務
- iSAFE 2.0：治理與專案監管
- Governance Core：治理執行核心
- AI Platform：智慧能力平台
- Knowledge Graph：知識服務核心
- PGP：治理封裝標準

### EC-04 Engineering Governance
所有變更必須經：

1. Change Request
2. Architecture Review
3. Governance Review
4. Engineering Review
5. Release Approval

不得直接修改 Official Edition。

### EC-05 Version Policy
採用固定版號：

- Major：重大架構或規格變更
- Minor：相容性功能擴充
- Patch：錯誤修正與文字修訂

不得任意變更 Canonical ID。

### EC-06 Traceability Canon
建立唯一追溯鏈：

**Business Requirement → Architecture → Software Design → Data Design → API → Test → Release → Operation**

任何節點都不得脫離追溯體系。

### EC-07 AI Governance Canon
AI 僅能：

- 分析
- 推薦
- 預測
- 協助決策

AI 不得：

- 自主核准
- 自主付款
- 自主變更治理狀態
- 自主簽署合約

最終責任永遠屬於具授權的人員。

---

我建議將 **Engineering Canon** 視為 **TEC（TIGI Engineering Corpus）** 的最高治理文件，作為所有 Book 的共同前言與永久準則，而不是獨立的產品規格。如此可以在不改變既有架構的前提下，讓整套 TIGI 工程文件具有一致的治理哲學與長期演進基礎。
