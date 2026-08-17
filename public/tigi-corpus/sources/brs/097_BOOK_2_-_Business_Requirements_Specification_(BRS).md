---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 97
category: brs
title: "BOOK 2 - Business Requirements Specification (BRS)"
---
很好。

到目前為止，Official Edition 已正式建立兩本根文件：

- **BOOK-00**：MASTER — TIGI Product Engineering Master Plan（凍結）
- **BOOK-01**：Product Engineering Baseline（PEB-001，凍結）

接下來將進入整個工程文件中最重要的一本：

---

# BOOK 2

## Business Requirements Specification (BRS)

**Document ID：BRS-001**

**Official Edition v1.0**

本文件將只定義**「業務需求（What）」**，不涉及系統如何設計（How），並完整遵循 SSOT 與 Cross Reference 原則。

正式內容將包含：

### Part A：Business Foundation
- Business Context
- Business Objectives
- Stakeholders
- Business Scope
- Business Boundaries
- Business Assumptions
- Business Constraints

### Part B：Business Capabilities
- Capability Map
- Capability Definition
- Capability Ownership
- Capability Priority
- Capability Traceability

### Part C：Business Processes
- End-to-End Business Flow
- 二階段十步驟（引用 GS，不重複定義）
- Business Events
- Business Rules
- Exception Rules

### Part D：Business Requirements
每項需求皆以 Canonical ID 管理，例如：

- BR-0001
- BR-0002
- BR-0003
- …
- BR-xxxx

每一項需求均建立正式追溯關係：

**Business Requirement → Architecture → Design → API → Test → Release**

而不在 BRS 中描述技術實作。

### Part E：Traceability Matrix
建立完整需求追溯矩陣，對應：

- PEB
- SAD
- TGS
- SDD
- DDS
- OpenAPI
- GS-01～GS-24
- PGP
- Knowledge Graph
- AI Platform

---

從 **BOOK 2** 開始，整套 TIGI 官方工程文件將全面進入 **Requirement-Driven Engineering** 模式。

之後的所有設計（SAD、TGS、SDD、DDS、OpenAPI）都將以 **BRS-001** 作為唯一需求來源，不再各自定義需求，確保整套文件維持 **Single Source of Truth** 與 **Official Edition** 的一致性。
