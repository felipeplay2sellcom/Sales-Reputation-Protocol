# Sales Reputation Protocol — Overview

**Version**: 0.1.0-draft
**Status**: Draft
**Authors**: Felipe Santos
**Created**: 2026-03-09

---

## Abstract

The Sales Reputation Protocol (SRP) is an open standard for recording, issuing, and verifying professional sales performance credentials. It enables sales professionals to build a portable, cryptographically verifiable reputation that is owned by the professional and recognized across organizations, platforms, and borders.

## 1. Introduction

### 1.1 Problem Statement

The sales profession suffers from a fundamental trust deficit:

- **Information asymmetry**: Employers cannot reliably verify a candidate's sales track record. Résumés are self-reported and frequently inflated.
- **Data silos**: Performance data is locked inside CRM systems (Salesforce, HubSpot, Pipedrive) that the professional loses access to when they change jobs.
- **Credential fragmentation**: Training certifications (Sandler, SPIN, MEDDIC) prove knowledge but not performance. No standard connects "completed a course" to "closed $2M in revenue."
- **No universal benchmark**: Unlike credit scores (FICO), there is no standardized, cross-organization measure of sales ability.

### 1.2 Vision

SRP creates a world where:

1. A salesperson's track record is **verifiable** — backed by cryptographic proof, not just a LinkedIn endorsement.
2. Performance data is **portable** — it belongs to the professional, not the CRM.
3. Reputation is **privacy-preserving** — professionals choose what to share and with whom.
4. The standard is **open** — any platform can issue, hold, or verify SRP credentials.

### 1.3 Design Principles

| Principle | Description |
|-----------|-------------|
| **Open & Vendor-Neutral** | No single company controls the protocol. Any platform can implement it. |
| **Standards-Based** | Built on W3C Verifiable Credentials 2.0, DIDs, and Open Badges 3.0. |
| **Privacy by Design** | Minimum disclosure by default. Zero-knowledge proofs for sensitive data. |
| **Progressive Trust** | Start simple (signed credentials), add trust layers over time (on-chain anchoring, peer endorsements). |
| **Industry Agnostic** | Core protocol works for SaaS, real estate, insurance, retail, and any sales vertical. |
| **Practical First** | Optimize for real-world adoption over theoretical purity. |

## 2. Architecture

### 2.1 Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: APPLICATION                                        │
│  CRMs, Sales Platforms, HR Systems, Wallets, Marketplaces   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: PROTOCOL                                           │
│  Event Model · Credential Format · Scoring · Verification   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: IDENTITY                                           │
│  Decentralized Identifiers (DIDs) · Key Management          │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: TRUST                                              │
│  Cryptographic Proofs · On-Chain Anchoring · Issuer Registry │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Roles

The protocol defines three roles, following the W3C Verifiable Credentials model:

**Issuer**
An organization that validates sales events and issues credentials. Typically: employers, CRM platforms, sales enablement tools, training providers.

**Holder**
A sales professional who receives, stores, and controls their credentials. They decide when and with whom to share.

**Verifier**
An entity that checks the authenticity of a credential. Typically: hiring managers, recruiting platforms, incentive programs, clients.

### 2.3 Core Flow

```
 ┌─────────┐          ┌─────────┐          ┌──────────┐
 │  EVENT   │          │CREDENTIAL│         │VERIFICATION│
 │  SOURCE  │          │ ISSUANCE │          │           │
 └────┬─────┘          └────┬─────┘          └─────┬─────┘
      │                     │                      │
      │  1. Sales event     │                      │
      │     occurs in CRM   │                      │
      │─────────────────────>                      │
      │                     │                      │
      │  2. Platform        │                      │
      │     validates event │                      │
      │     against evidence│                      │
      │                     │                      │
      │  3. Credential      │                      │
      │     is issued       │                      │
      │     & signed        │                      │
      │                     │──────────────────────>│
      │                     │  4. Holder presents  │
      │                     │     credential       │
      │                     │                      │
      │                     │  5. Verifier checks  │
      │                     │     signature,       │
      │                     │     issuer trust,    │
      │                     │     revocation status│
      │                     │                      │
```

## 3. Data Model

### 3.1 Sales Events

The atomic unit of the protocol. A sales event is a recorded, validated occurrence of professional performance.

See [Events Specification](events.md) for the full taxonomy and schema.

### 3.2 Credentials

A verifiable credential wrapping one or more sales events or achievements. Follows the W3C VC 2.0 data model with SRP-specific extensions.

See [Credentials Specification](credentials.md) for the full format.

### 3.3 Sales Reputation Score

A composite numerical score (300–850) derived from verified credentials. Designed to provide a standardized benchmark of sales ability.

See [Scoring Specification](scoring.md) for the calculation model.

## 4. Identity

### 4.1 Decentralized Identifiers (DIDs)

All entities in the protocol are identified by DIDs:

| Entity | Recommended DID Method | Example |
|--------|----------------------|---------|
| Companies (Issuers) | `did:web` | `did:web:acme-corp.com` |
| Professionals (Holders) | `did:key` | `did:key:z6Mkh...` |
| Platforms | `did:web` | `did:web:platform.example.com` |

`did:web` is recommended for issuers because it leverages existing DNS infrastructure — a company proves ownership of its DID by hosting a DID Document at its domain.

`did:key` is recommended for individuals because it requires no infrastructure — the DID is derived entirely from a public key.

### 4.2 Key Management

Issuers MUST maintain at least one signing key pair. Key rotation SHOULD be supported. Compromised keys MUST be revoked, and credentials signed with compromised keys SHOULD be re-issued.

## 5. Trust Model

### 5.1 Issuer Registry

Not all issuers are equally trustworthy. The protocol defines an **Issuer Registry** — a public list of verified organizations authorized to issue SRP credentials.

Issuer verification levels:

| Level | Requirements | Trust Signal |
|-------|-------------|-------------|
| **Self-Declared** | DID + metadata | Minimal — anyone can register |
| **Domain-Verified** | DID + DNS proof via `did:web` | Moderate — proves domain ownership |
| **Platform-Verified** | DID + CRM integration proof | High — proves access to sales data |
| **Audited** | DID + third-party audit | Highest — independent verification |

### 5.2 On-Chain Anchoring

Credential integrity MAY be anchored on a public blockchain for additional tamper-evidence. The protocol recommends:

- **Ethereum Attestation Service (EAS)** on Optimism or Base L2
- Schema registration on-chain, individual attestations off-chain with optional anchoring
- Content-addressable storage (IPFS) for credential metadata

On-chain anchoring is OPTIONAL. The protocol works without it — cryptographic signatures provide the primary trust mechanism.

## 6. Privacy

The protocol is designed with privacy as a first-class concern:

- **Selective disclosure**: Share only specific claims from a credential using BBS+ signatures.
- **Zero-knowledge proofs**: Prove range claims ("revenue > $1M") without revealing exact values.
- **Consent-based sharing**: The holder controls who sees their credentials.
- **Right to erasure**: Credentials can be revoked, and personal data can be deleted.
- **GDPR/LGPD compliant**: The protocol's privacy model is designed for compliance with international data protection regulations.

See [Privacy Specification](privacy.md) for details.

## 7. Interoperability

SRP is designed for maximum interoperability with existing standards:

| Standard | Relationship |
|----------|-------------|
| W3C Verifiable Credentials 2.0 | SRP credentials ARE Verifiable Credentials |
| W3C Decentralized Identifiers 1.1 | SRP uses DIDs for all entity identification |
| Open Badges 3.0 | SRP achievement credentials are compatible with OBv3 |
| JSON Schema 2020-12 | SRP schemas use JSON Schema for validation |
| OpenAPI 3.1 | SRP API is defined in OpenAPI format |

## 8. Conformance

An implementation is **SRP-conformant** if it:

1. Supports at least one role (Issuer, Holder, or Verifier).
2. Uses the SRP event taxonomy for event classification.
3. Issues/accepts credentials in the SRP credential format (W3C VC 2.0 + SRP context).
4. Implements the required API endpoints for its role.
5. Validates credentials against the SRP JSON Schemas.

## 9. References

- [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- [W3C Decentralized Identifiers 1.1](https://www.w3.org/TR/did-core/)
- [Open Badges 3.0](https://www.imsglobal.org/spec/ob/v3p0)
- [BBS+ Signatures (IETF Draft)](https://identity.foundation/bbs-signature/draft-irtf-cfrg-bbs-signatures.html)
- [Ethereum Attestation Service](https://attest.org/)
- [RFC 2119 — Key Words](https://www.rfc-editor.org/rfc/rfc2119)
