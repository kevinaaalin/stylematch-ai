---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 98
category: openapi
title: "BOOK 1 - Product Engineering Baseline (PEB)"
---
收到。

正式進入 **BOOK 1**。

---

# BOOK 1

# Product Engineering Baseline (PEB)

**Official Edition v1.0**

**Document ID：PEB-001**

**Status：Released**

**Baseline：Product Engineering Baseline v1.0**

---

# Chapter 1. Purpose

本文件定義 TIGI（Taiwan Interior Governance Infrastructure）產品工程基線（Product Engineering Baseline）。

本文件為所有產品規格的唯一基線（Single Source of Truth），用於統一三大平台（StyleMatch AI、TWCID、iSAFE 2.0）的產品定義、能力邊界與工程原則。

本文件不描述系統設計、技術架構、資料模型或 API，相關內容分別由 SAD、SDD、DDS、OpenAPI 等文件負責。

---

# Chapter 2. Product Definition

## Product Name

TIGI（Taiwan Interior Governance Infrastructure）

## Product Type

AI-Driven Governance Infrastructure Platform

## Product Positioning

TIGI 為室內裝修設計工程產業的數位治理基礎建設（Governance Infrastructure），提供從需求、設計、施工到交付的全生命週期治理能力。

---

# Chapter 3. Product Mission

建立可追溯（Traceable）、可治理（Governable）、可驗證（Verifiable）、可擴充（Scalable）的產業級治理平台。

---

# Chapter 4. Product Vision

打造室內裝修設計工程產業共同遵循的數位治理標準，使每一個專案均具備：

- 可追溯流程
- 可驗證證據
- 可量測品質
- 可管理風險
- 可持續演進

---

# Chapter 5. Product Scope

TIGI 產品範圍包括：

- AI 需求分析
- 空間風格推薦
- 設計媒合
- 專案治理
- 工程監管
- 文件管理
- 電子簽核
- 金流節點管理
- Evidence 管理
- PGP 專案治理封包
- Knowledge Graph
- AI Decision Support

---

# Chapter 6. Product Boundary

TIGI 不直接提供：

- 建築 CAD 繪圖
- BIM 建模工具
- ERP 財務系統
- 一般 CRM
- 即時通訊平台
- 第三方支付核心系統

上述能力以整合方式提供，不屬於產品核心。

---

# Chapter 7. Core Product Principles

## PP-01 Governance First

治理優先於功能。

---

## PP-02 Evidence First

所有治理決策均須有證據支持。

---

## PP-03 State Driven

所有流程均以狀態機驅動。

---

## PP-04 AI Assisted

AI 提供輔助決策，不取代最終責任。

---

## PP-05 Traceability

所有資料、文件、照片、簽核、付款均須具備完整追溯能力。

---

## PP-06 Open Integration

所有模組皆採標準介面，可與第三方系統整合。

---

# Chapter 8. Product Capability Baseline

產品核心能力包含：

- Governance Workflow
- Case Management
- State Machine
- Gate Engine
- Checklist Engine
- Risk Engine
- Evidence Vault
- PGP Engine
- Knowledge Graph
- AI Platform
- Notification Center
- Audit Trail
- Role-Based Access Control（RBAC）
- Attribute-Based Access Control（ABAC）

---

# Chapter 9. Product Constraints

產品需遵循：

- Product Engineering Baseline v1.0
- Governance Standards GS-01～GS-24
- Governance Core
- Canonical ID
- Single Source of Truth
- Cross Reference
- Official Edition Policy

---

# Chapter 10. Product Assumptions

產品基於以下假設：

- 專案皆以 Case 為治理單位。
- 流程皆由狀態機管理。
- 每個 Gate 均具備可驗證條件。
- 所有 Evidence 可追溯且不可任意覆寫。
- AI 僅提供輔助分析與建議。

---

# Chapter 11. Product Components

TIGI 由三大核心平台組成：

1. **StyleMatch AI**：需求入口與 AI 設計顧問。
2. **TWCID**：會員、媒合與產業服務平台。
3. **iSAFE 2.0**：工程治理與專案監管平台。

三平台共享治理核心、知識圖譜、AI 平台與資料治理規範。

---

# Chapter 12. Canonical Product Model

產品正典模型由下列核心實體組成：

- Case
- User
- Organization
- Project
- Workflow
- State
- Gate
- Checklist
- Evidence
- Document
- Contract
- Payment
- Risk
- Notification
- Knowledge Entity
- AI Agent
- PGP Package

詳細資料結構由 DDS（Data Design Specification）定義。

---

# Chapter 13. Cross References

本文件與其他正式工程文件建立唯一交叉引用：

- MASTER（BOOK-00）
- Business Requirements Specification（BRS）
- Solution Architecture Document（SAD）
- Technical Governance Specification（TGS）
- Software Design Document（SDD）
- Data Design Specification（DDS）
- OpenAPI Specification
- Governance Standards（GS-01～GS-24）
- Governance Core
- Knowledge Graph
- AI Platform

---

# Chapter 14. Baseline Statement

本文件定義 TIGI 官方產品工程基線。

所有後續需求、架構、設計、開發、測試與部署，均應以本文件為唯一產品基線，不得重複定義或偏離本文件所規範之產品定位與原則。

---

**BOOK 1：Product Engineering Baseline（PEB-001）Official Edition v1.0** 至此完成並凍結。

下一步將進入 **BOOK 2：Business Requirements Specification（BRS）**，正式展開需求規格文件，並依 Canonical ID 與 Cross Reference 與 BOOK 0、BOOK 1 建立關聯，不重複任何已定義內容。
