---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 76
category: dds
title: "BOOK 06 - Data Design Specification（DDS）"
---
收到。

正式進入 **BOOK-06**，以下開始 **Official Edition** 正式內容。

---

# BOOK 06

# Data Design Specification（DDS）

**Official Edition v1.0**

**Document ID：DDS-001**

**Status：Released**

**Architecture Source：SAD-001**

**Software Source：SDD-001**

**Requirement Source：BRS-001**

---

# PART A — Data Architecture Foundation

## Chapter 1. Purpose

本文件定義 TIGI 的正式資料設計規格（Data Design Specification）。

DDS 為 TIGI Canonical Data Model 的唯一正式來源，定義：

- 核心資料實體
- 聚合（Aggregate）
- 值物件（Value Object）
- 關聯模型
- 資料生命週期
- 資料治理
- 資料一致性
- 版本管理

本文件不定義 API（OpenAPI）、程式設計（SDD）或業務需求（BRS）。

---

# Chapter 2. Data Design Principles

所有資料設計均應遵循：

### DDP-01 Single Source of Truth

每一項核心資料僅有一個正式主資料來源。

---

### DDP-02 Canonical Data Model

跨平台（StyleMatch AI、TWCID、iSAFE 2.0）共用統一 Canonical Data Model。

---

### DDP-03 Data Ownership

每一資料實體均指定唯一 Owner。

---

### DDP-04 Traceability

所有重要資料均應可追溯至：

- Case
- User
- Organization
- Workflow
- Audit

---

### DDP-05 Immutable Evidence

Evidence 類資料建立後不得直接覆寫。

---

### DDP-06 Version Controlled

正式資料應具備版本控制能力。

---

# PART B — Canonical Data Model

## Chapter 3. Core Entities

正式核心資料實體如下：

| Entity ID | Entity Name | Owner |
|-----------|-------------|-------|
| EN-001 | Case | iSAFE 2.0 |
| EN-002 | User | TWCID |
| EN-003 | Organization | TWCID |
| EN-004 | Project | iSAFE 2.0 |
| EN-005 | Workflow | Governance Core |
| EN-006 | State | Governance Core |
| EN-007 | Gate | Governance Core |
| EN-008 | Checklist | Governance Core |
| EN-009 | Evidence | Governance Core |
| EN-010 | Contract | iSAFE 2.0 |
| EN-011 | Payment | iSAFE 2.0 |
| EN-012 | Inspection | iSAFE 2.0 |
| EN-013 | Warranty | iSAFE 2.0 |
| EN-014 | Risk | Governance Core |
| EN-015 | Audit | Governance Core |
| EN-016 | Notification | Shared Service |
| EN-017 | PGP | Governance Core |
| EN-018 | Knowledge Entity | AI Platform |
| EN-019 | AI Task | AI Platform |
| EN-020 | Integration Record | Platform Service |

---

# Chapter 4. Aggregate Design

正式 Aggregate Root：

### AG-001 Case Aggregate

包含：

- Case
- Workflow
- State
- Gate
- Checklist
- Evidence
- Audit

Case 為治理核心 Aggregate。

---

### AG-002 Project Aggregate

包含：

- Project
- Contract
- Payment
- Inspection
- Warranty

---

### AG-003 Identity Aggregate

包含：

- User
- Organization
- Role
- Permission

---

### AG-004 AI Aggregate

包含：

- AI Task
- AI Result
- Knowledge Entity

---

# Chapter 5. Value Objects

正式 Value Object：

- Address
- Contact
- Money
- Period
- Location
- Coordinate
- Version
- Risk Score
- Style Profile
- Space Profile

Value Object 不具獨立生命週期。

---

# Chapter 6. Entity Relationships

核心關聯：

- User → Organization
- Organization → Project
- Project → Case
- Case → Workflow
- Workflow → State
- State → Gate
- Gate → Checklist
- Checklist → Evidence
- Case → Audit
- Case → PGP
- AI Task → Knowledge Entity

關聯詳細欄位將於後續章節定義。

---

# Chapter 7. Canonical Identifiers

所有資料皆須具有永久唯一識別碼：

- Case ID
- User ID
- Organization ID
- Project ID
- Workflow ID
- State ID
- Evidence ID
- Audit ID
- PGP ID
- AI Task ID

Canonical ID 一經建立不得重新使用。

---

## DDS-001（目前完成）

已完成：

- **PART A：Data Architecture Foundation**
- **PART B：Canonical Data Model（基線）**

下一階段將接續正式出版：

**PART C — Entity Specification**

逐一定義每個 Entity 的：

- Canonical Schema
- Mandatory Attributes
- Business Constraints
- Lifecycle
- Relationships
- Ownership
- Version Policy

作為 **資料庫設計、OpenAPI、Knowledge Graph 與 AI Platform** 的唯一正式資料模型來源。
