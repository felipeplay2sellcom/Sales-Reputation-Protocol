# Sales Reputation Protocol — Events Specification

**Version**: 0.1.0-draft
**Status**: Draft

---

## 1. Overview

A **Sales Event** is the atomic unit of the Sales Reputation Protocol. It represents a single, validated occurrence of professional sales performance that can be used as evidence for credential issuance and score calculation.

Events are recorded by **Issuers** (employers, platforms, CRMs) and serve as the raw input from which credentials and scores are derived.

## 2. Event Taxonomy

The protocol defines six core event categories. Implementations MAY extend these with custom subtypes but MUST map to one of the core categories.

### 2.1 Core Event Types

| Type | Category | Description |
|------|----------|-------------|
| `sale_completed` | Performance | A deal was closed and revenue recognized |
| `top_performer` | Recognition | Agent achieved top ranking in a defined period |
| `certification_earned` | Development | Agent completed a training or certification program |
| `mission_completed` | Achievement | Agent completed a gamification mission or challenge |
| `ranking_achieved` | Recognition | Agent achieved a specific position in a leaderboard |
| `training_completed` | Development | Agent completed a learning module or course |

### 2.2 Extended Event Types

Implementations MAY define additional event types within these categories:

| Category | Example Extended Types |
|----------|----------------------|
| Performance | `quota_attained`, `pipeline_generated`, `upsell_completed`, `renewal_closed` |
| Recognition | `award_received`, `presidents_club`, `rookie_of_the_year` |
| Development | `skill_assessment_passed`, `product_certification`, `coaching_completed` |
| Achievement | `streak_completed`, `milestone_reached`, `challenge_won` |
| Client Impact | `nps_score_received`, `referral_generated`, `case_study_published` |
| Peer Trust | `endorsement_received`, `mentorship_completed`, `team_lead_appointed` |

Custom event types MUST use a namespaced format: `{vendor}:{event_type}` (e.g., `salesforce:opportunity_closed`).

## 3. Event Data Model

### 3.1 Required Fields

Every event MUST include these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Unique identifier for this event |
| `type` | `string` | Event type from the taxonomy |
| `category` | `string` | One of: `performance`, `recognition`, `development`, `achievement`, `client_impact`, `peer_trust` |
| `issuerDid` | `string` (DID) | DID of the issuing organization |
| `subjectDid` | `string` (DID) | DID of the sales professional |
| `occurredAt` | `string` (ISO 8601) | When the event occurred |
| `recordedAt` | `string` (ISO 8601) | When the event was recorded in the protocol |

### 3.2 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | `object` | Event-specific payload (see section 4) |
| `evidence` | `array` | References to supporting evidence |
| `industry` | `string` | Industry vertical (see section 5) |
| `metadata` | `object` | Additional non-verified metadata |
| `expiresAt` | `string` (ISO 8601) | When this event should no longer contribute to scoring |

### 3.3 Evidence

Evidence objects provide verifiable references to the source of truth for an event:

```json
{
  "type": "CRMRecord",
  "source": "salesforce",
  "ref": "https://acme.my.salesforce.com/006xx000001abc",
  "verifiedAt": "2026-03-08T23:59:59Z",
  "verifiedBy": "did:web:acme-corp.com"
}
```

Supported evidence types:

| Type | Description |
|------|-------------|
| `CRMRecord` | Reference to a CRM opportunity/deal record |
| `PaymentConfirmation` | Payment or commission confirmation |
| `PlatformRecord` | Record from a sales platform or gamification system |
| `TrainingRecord` | Completion record from a training provider |
| `ThirdPartyAttestation` | Independent verification by an auditor |
| `ClientTestimonial` | Verified client feedback or testimonial |

## 4. Event-Specific Data

### 4.1 sale_completed

```json
{
  "type": "sale_completed",
  "data": {
    "dealValue": 75000,
    "currency": "USD",
    "productCategory": "enterprise_software",
    "dealType": "new_business",
    "salesCycle": {
      "startedAt": "2025-12-01T00:00:00Z",
      "closedAt": "2026-03-08T00:00:00Z",
      "durationDays": 97
    },
    "quotaContribution": 0.15
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dealValue` | `number` | RECOMMENDED | Monetary value of the deal |
| `currency` | `string` | RECOMMENDED | ISO 4217 currency code |
| `productCategory` | `string` | OPTIONAL | Category of product/service sold |
| `dealType` | `string` | OPTIONAL | `new_business`, `expansion`, `renewal`, `upsell` |
| `salesCycle` | `object` | OPTIONAL | Start, close dates, and duration |
| `quotaContribution` | `number` | OPTIONAL | Fraction of quota this deal represents (0.0–1.0+) |

### 4.2 top_performer

```json
{
  "type": "top_performer",
  "data": {
    "period": "2026-Q1",
    "rank": 1,
    "totalParticipants": 150,
    "percentile": 99,
    "metric": "revenue",
    "scope": "national"
  }
}
```

### 4.3 certification_earned

```json
{
  "type": "certification_earned",
  "data": {
    "certificationName": "Enterprise Sales Professional",
    "certificationId": "CESP-2026-0042",
    "provider": "Sales Academy International",
    "level": "advanced",
    "validUntil": "2028-03-09T00:00:00Z",
    "score": 92,
    "maxScore": 100
  }
}
```

### 4.4 mission_completed

```json
{
  "type": "mission_completed",
  "data": {
    "missionName": "Q1 Pipeline Blitz",
    "missionType": "pipeline_generation",
    "target": 500000,
    "achieved": 620000,
    "currency": "USD",
    "completionRate": 1.24,
    "difficulty": "hard"
  }
}
```

### 4.5 ranking_achieved

```json
{
  "type": "ranking_achieved",
  "data": {
    "rankingName": "National Sales Ranking 2025",
    "position": 3,
    "totalParticipants": 1200,
    "percentile": 99.75,
    "category": "overall_revenue",
    "period": "2025"
  }
}
```

### 4.6 training_completed

```json
{
  "type": "training_completed",
  "data": {
    "courseName": "Consultative Selling Masterclass",
    "provider": "SalesForce Academy",
    "hoursCompleted": 40,
    "format": "online",
    "assessmentPassed": true,
    "skills": ["consultative_selling", "needs_analysis", "solution_design"]
  }
}
```

## 5. Industry Codes

Events MAY specify an industry to enable vertical-specific scoring and benchmarking:

| Code | Industry |
|------|----------|
| `saas` | SaaS / Software |
| `real_estate` | Real Estate |
| `insurance` | Insurance |
| `financial_services` | Financial Services |
| `automotive` | Automotive |
| `retail` | Retail |
| `healthcare` | Healthcare |
| `manufacturing` | Manufacturing |
| `telecommunications` | Telecommunications |
| `hospitality` | Hospitality |
| `education` | Education |
| `other` | Other / General |

## 6. Event Lifecycle

```
  SUBMITTED ──> VALIDATED ──> ACTIVE ──> EXPIRED
                    │                      │
                    └──> REJECTED           └──> REVOKED
```

| Status | Description |
|--------|-------------|
| `submitted` | Event received, pending validation |
| `validated` | Event verified against evidence |
| `active` | Event is contributing to credentials and scores |
| `expired` | Event has passed its expiration date |
| `rejected` | Event failed validation |
| `revoked` | Event was retroactively invalidated |

## 7. Validation Rules

Issuers MUST validate events before they transition to `validated` status:

1. **Identity verification**: The `subjectDid` MUST correspond to a real individual with a verified identity.
2. **Evidence check**: At least one evidence source MUST be provided and MUST be verifiable.
3. **Temporal consistency**: The `occurredAt` timestamp MUST be in the past and MUST be within a reasonable timeframe (not older than 10 years).
4. **Value plausibility**: For `sale_completed` events, deal values SHOULD be checked against industry norms for anomaly detection.
5. **Uniqueness**: Duplicate events (same subject, same deal, same timestamp) MUST be rejected.

## 8. Schema

The canonical JSON Schema for events is defined in [`schema/v0.1.0/event.schema.json`](../../schema/v0.1.0/event.schema.json).
