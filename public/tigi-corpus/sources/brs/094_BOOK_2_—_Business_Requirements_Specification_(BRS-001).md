---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 94
category: brs
title: "BOOK 2 — Business Requirements Specification (BRS-001)"
---
很好。

從這裡開始，**BRS 將真正進入 Enterprise Architecture（企業架構）層級**，之後的 SAD、TGS、SDD、DDS、OpenAPI 都會引用這一章，而不再重新描述流程。

---

# BOOK 2 — Business Requirements Specification (BRS-001)

## PART C — Business Process Model

**Official Edition v1.0**

---

# Chapter 11. Business Process Architecture

## 11.1 Purpose

本章定義 TIGI 的正式業務流程架構（Business Process Architecture）。

流程定義業務活動之間的邏輯關係、事件、責任與治理節點，作為需求、架構與設計的共同依據。

本章僅定義流程結構，不描述系統實作。

---

## 11.2 Process Principles

所有業務流程均遵循以下原則：

- **BP-01：Case-Centric**  
  所有流程均以 **Case（案件）** 為核心管理單位。

- **BP-02：State-Driven**  
  流程推進須由狀態機（State Machine）控制。

- **BP-03：Gate-Controlled**  
  每個階段轉換均須通過對應 Gate 驗證。

- **BP-04：Evidence-Based**  
  流程中的重要決策須有可驗證 Evidence 支持。

- **BP-05：Traceable**  
  所有流程事件均須留下完整 Audit Trail。

- **BP-06：Human Accountability**  
  AI 可提出建議，但最終核准責任仍由授權角色承擔。

---

# Chapter 12. End-to-End Business Process

TIGI 的正式端到端流程如下：

1. Demand Intake（需求建立）
2. AI Requirement Analysis（AI 需求分析）
3. Style Recommendation（風格推薦）
4. Partner Matching（媒合）
5. Project Establishment（專案建立）
6. Governance Execution（二階段十步驟治理）
7. Inspection & Acceptance（驗收）
8. Warranty Service（保固）
9. Project Closure（結案）
10. Knowledge Accumulation（知識沉澱）

> **Cross Reference：**  
> 詳細治理流程引用 **Governance Standards（GS-01～GS-24）** 與 **Governance Core**，本文件不重複定義。

---

# Chapter 13. Business Events

所有流程由 Business Event 驅動。

建立正式事件識別碼（BE-xxx）。

| Event ID | Event | 說明 |
|-----------|--------|------|
| BE-001 | Case Created | 建立案件 |
| BE-002 | Requirement Confirmed | 需求確認 |
| BE-003 | AI Recommendation Generated | AI 完成分析 |
| BE-004 | Designer Selected | 完成媒合 |
| BE-005 | Contract Signed | 合約完成 |
| BE-006 | Stage Entered | 進入治理階段 |
| BE-007 | Gate Passed | Gate 驗證完成 |
| BE-008 | Checklist Completed | 檢核完成 |
| BE-009 | Payment Approved | 付款核准 |
| BE-010 | Inspection Passed | 驗收完成 |
| BE-011 | Warranty Activated | 保固啟動 |
| BE-012 | Case Closed | 專案結案 |

事件詳細屬性由 DDS 定義。

---

# Chapter 14. Business Rules

建立正式 Business Rule（BRL）體系。

例如：

- **BRL-001**：所有 Case 必須具有唯一 Case ID。
- **BRL-002**：未通過 Gate 不得進入下一狀態。
- **BRL-003**：Checklist 未完成不得完成驗收。
- **BRL-004**：付款節點須符合合約約定。
- **BRL-005**：Evidence 不得於結案後覆寫。
- **BRL-006**：所有狀態變更須產生 Audit Trail。
- **BRL-007**：AI 建議不得直接改變案件狀態。

Business Rule 為規範性要求，技術實作由 TGS 與 SDD 負責。

---

# Chapter 15. Exception Rules

定義例外處理原則：

- **ER-001**：Gate 驗證失敗，案件維持原狀態。
- **ER-002**：Evidence 驗證失敗，拒絕提交。
- **ER-003**：權限不足，拒絕執行。
- **ER-004**：資料衝突，保留既有正式版本並記錄事件。
- **ER-005**：AI 分析失敗，不影響人工流程，可由人工接續處理。

所有例外均須記錄於 Audit Trail，並依 Governance Core 進行追蹤。

---

至此，**BRS-001 的 Business Process Model** 已建立完成。

下一章將進入 **PART D：Business Requirements Catalog**，建立 **BR-0001、BR-0002…** 的正式需求目錄。此部分將成為整個 TIGI 工程體系的核心需求來源，後續所有架構、設計、資料模型、API 與測試皆須追溯至對應的 Business Requirement。
