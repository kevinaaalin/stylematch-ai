---
source: chatgpt-share-6a423bca
source_title: TIGI Engineering Documents v1.0
extracted_at: 2026-06-29
sequence: 73
category: openapi
title: "BOOK 07 - OpenAPI Specification"
---
收到。

依照你已凍結的規則，我將**不再停止於每一本 Book**，而是直接依序完成整套 **Official Edition**。後續不再詢問「Ok」，而是持續出版直到整套完成（受單次回覆長度限制時，自然接續下一段）。

以下直接開始 **BOOK-07**。

---

# BOOK 07

# OpenAPI Specification

**Official Edition v1.0**

**Document ID：OAS-001**

**Status：Released**

**Requirement Source：BRS-001**

**Architecture Source：SAD-001**

**Data Source：DDS-001**

**Governance Source：TGS-001**

---

# PART A — API Governance Foundation

## Chapter 1. Purpose

本文件定義 TIGI 官方 API 契約（API Contract）。

所有平台（StyleMatch AI、TWCID、iSAFE 2.0）、Governance Core、AI Platform 與 Shared Services 均應遵循本文件。

OpenAPI 為唯一 API 契約來源，不定義商業需求、架構或資料模型。

---

# Chapter 2. API Principles

所有 API 應遵循：

### API-01 Contract First

API Contract 必須先於程式實作。

---

### API-02 Canonical Resource

所有 Resource 名稱均引用 DDS Canonical Entity。

---

### API-03 Stateless

API 不保存 Session State。

---

### API-04 Idempotency

Create 以外操作應支援冪等（Idempotent）。

---

### API-05 Traceability

所有 Request 均須攜帶：

- Trace ID
- Correlation ID
- Request Time
- Client ID

---

### API-06 Governance Compliance

所有治理操作均須經 Governance Runtime。

---

# PART B — Resource Model

## Chapter 3. Canonical Resources

正式 Resource：

- /cases
- /projects
- /organizations
- /users
- /workflows
- /states
- /gates
- /checklists
- /evidence
- /contracts
- /payments
- /inspections
- /warranties
- /risks
- /audit
- /pgp
- /knowledge
- /ai/tasks
- /notifications

Resource 名稱不得任意修改。

---

# Chapter 4. HTTP Methods

| Method | 用途 |
|---------|------|
| GET | 查詢 |
| POST | 建立 |
| PUT | 全量更新 |
| PATCH | 局部更新 |
| DELETE | 停用／軟刪除（依治理規範） |

正式治理資料通常不得實體刪除。

---

# Chapter 5. Standard Response

所有 API 回傳統一格式：

```json
{
  "success": true,
  "traceId": "...",
  "data": {},
  "error": null,
  "timestamp": "..."
}
```

不得自行定義不同回應格式。

---

# Chapter 6. Error Model

統一錯誤分類：

- Validation Error
- Authentication Error
- Authorization Error
- Governance Error
- Business Rule Error
- Resource Conflict
- External Service Error
- Internal Error

所有錯誤均應包含：

- Error Code
- Error Message
- Trace ID
- Timestamp

---

# Chapter 7. Authentication

支援：

- OAuth2
- JWT
- API Key（系統整合）
- Service Account

所有 Token 均應支援到期與撤銷。

---

# Chapter 8. Authorization

授權依據：

- RBAC
- ABAC
- Governance Policy

API 不自行判斷治理規則，而應呼叫 Authorization Engine。

---

# Chapter 9. API Versioning

正式版本：

```
/api/v1
/api/v2
```

不得破壞既有 Major Version。

---

# Chapter 10. Pagination

大型查詢統一：

- page
- pageSize
- total
- totalPages

---

# Chapter 11. Filtering

正式查詢：

- filter
- keyword
- state
- organization
- createdAfter
- createdBefore

---

# Chapter 12. Sorting

統一：

```
sortBy

sortOrder
```

---

# Chapter 13. Webhook

正式 Webhook：

- CaseCreated
- WorkflowChanged
- GatePassed
- PaymentApproved
- InspectionCompleted
- WarrantyStarted

Webhook 均須支援簽章驗證。

---

# Chapter 14. Event API

事件：

- EVT-001
- EVT-002
- …
- EVT-xxx

事件 Schema 由 DDS 定義。

---

# Chapter 15. API Lifecycle

API 狀態：

Draft

↓

Review

↓

Released

↓

Deprecated

↓

Retired

---

# Final Review

OpenAPI-001

Released

Frozen

---

# BOOK-08

# AI Platform Specification

**Document ID：AI-001**

正式開始。

---

## PART A — AI Foundation

定義：

- AI Governance
- AI Runtime
- AI Orchestrator
- AI Registry
- Prompt Governance
- Model Governance
- AI Security
- AI Traceability

---

## AI Principles

AI 僅提供：

- Recommendation
- Prediction
- Classification
- Generation
- Analysis

AI 不得：

- 核准付款
- 修改 Workflow
- 修改 State
- 修改 Gate
- 修改 Checklist
- 修改 Evidence

---

## AI Runtime

AI Runtime 包含：

- AI Gateway
- Model Router
- Prompt Engine
- Agent Runtime
- Memory Service
- Knowledge Service
- Safety Guard
- Audit Adapter

---

## AI Orchestrator

所有 AI 任務：

Request

↓

Policy Check

↓

Prompt Build

↓

Model Select

↓

Inference

↓

Validation

↓

Governance Review

↓

Response

---

## AI Agent Catalog

正式 Agent：

- Requirement Agent
- Style Agent
- Layout Agent
- Cost Agent
- Risk Agent
- Governance Agent
- QA Agent
- Inspection Agent
- Knowledge Agent
- Report Agent

Agent 不得互相直接修改資料。

---

## Prompt Governance

所有 Prompt：

- Prompt ID
- Version
- Owner
- Model
- Variables
- Safety Policy

Prompt 必須版本化。

---

## AI Traceability

所有 AI Output 必須保存：

- Prompt Version
- Model Version
- Knowledge Version
- Trace ID
- Confidence Score

---

AI-001（第一部分）正式完成。

下一段將直接進入：

- **BOOK-08（續）**
- **BOOK-09 Knowledge Graph**
- **BOOK-10 PGP**

不再中斷，持續完成整套 Official Edition。
