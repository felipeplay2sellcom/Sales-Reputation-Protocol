# Sales Reputation Protocol — Privacy Specification

**Version**: 0.1.0-draft
**Status**: Draft

---

## 1. Overview

Privacy is a first-class concern of the Sales Reputation Protocol. Sales performance data is sensitive — it can affect hiring decisions, compensation negotiations, and professional relationships. The protocol ensures that professionals maintain full control over their data.

## 2. Core Privacy Principles

| Principle | Description |
|-----------|-------------|
| **Holder Control** | The professional decides what to share, with whom, and for how long. |
| **Minimum Disclosure** | Share only the minimum information necessary for the verifier's purpose. |
| **Consent-Based** | All data sharing requires explicit, revocable consent. |
| **Right to Erasure** | Professionals can request deletion of their data. |
| **Transparency** | Professionals can see all credentials issued about them and who has verified them. |

## 3. Selective Disclosure

### 3.1 What Is Selective Disclosure?

Selective disclosure allows a holder to reveal only specific claims from a credential without exposing the entire credential.

**Example**: A credential contains:
- Name: "Felipe Santos"
- Total Revenue: $1,437,892
- Deals Closed: 47
- Win Rate: 68%
- Company: Acme Corp

With selective disclosure, the holder can share only:
- Deals Closed: 47
- Win Rate: 68%

The verifier can confirm these claims are authentic (signed by the issuer) without learning the holder's name, revenue, or employer.

### 3.2 BBS+ Signatures

The recommended mechanism for selective disclosure is **BBS+ signatures** (`bbs-2023` cryptosuite):

1. **Issuance**: The issuer signs all claims in the credential with a single BBS+ signature.
2. **Derivation**: The holder generates a **derived proof** that reveals only selected claims.
3. **Verification**: The verifier checks the derived proof — it confirms the undisclosed claims exist and were signed by the issuer, without revealing them.

```json
{
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "bbs-2023",
    "created": "2026-03-09T12:00:00Z",
    "verificationMethod": "did:web:acme-corp.com#bbs-key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "u2V0BhVhAk3..."
  }
}
```

### 3.3 SD-JWT (Alternative)

For environments where JWT is preferred, **SD-JWT** provides selective disclosure:

1. Each claim is individually salted and hashed.
2. The holder reveals specific claims by providing the corresponding salt.
3. Simpler than BBS+ but does not support zero-knowledge range proofs.

## 4. Zero-Knowledge Proofs

### 4.1 Range Proofs

Zero-knowledge range proofs allow proving a value falls within a range without revealing the exact number.

**Use cases:**

| Claim | ZK Proof | What Verifier Learns |
|-------|----------|---------------------|
| Annual revenue: $1,437,892 | "revenue >= $1,000,000" | Revenue is at least $1M |
| Win rate: 68% | "win_rate >= 60%" | Win rate is above 60% |
| Deals closed: 47 | "deals >= 25" | At least 25 deals closed |
| Score: 742 | "score >= 700" | Score is in the "Very Good" tier or above |

### 4.2 Predicate Proofs

BBS+ supports predicate proofs natively:

```json
{
  "type": "VerifiablePresentation",
  "holder": "did:key:z6Mkh...",
  "verifiableCredential": [{
    "@context": ["https://www.w3.org/ns/credentials/v2", "https://salesreputationprotocol.org/context/v1"],
    "type": ["VerifiableCredential", "SalesReputationCredential"],
    "credentialSubject": {
      "type": "SalesAchievementSubject",
      "achievement": {
        "name": "Revenue Milestone"
      }
    },
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "bbs-2023",
      "proofValue": "..."
    }
  }],
  "derivedProofs": [{
    "predicate": "credentialSubject.achievement.data.totalRevenue >= 1000000",
    "result": true
  }]
}
```

The verifier sees: "This professional has achieved a revenue milestone, and their total revenue is at least $1,000,000." They do not see the exact revenue, the employer name, or any other details.

## 5. Consent Management

### 5.1 Consent Model

All data sharing is governed by explicit consent:

```json
{
  "consentId": "consent-abc123",
  "subjectDid": "did:key:z6Mkh...",
  "grantedTo": "did:web:recruiter.example.com",
  "scopes": [
    "reputation:score:read",
    "reputation:credentials:list",
    "reputation:presentation:verify"
  ],
  "grantedAt": "2026-03-09T14:00:00Z",
  "expiresAt": "2026-06-09T14:00:00Z",
  "legalBasis": "consent",
  "revocable": true
}
```

### 5.2 Consent Scopes

| Scope | Description |
|-------|-------------|
| `reputation:score:read` | View the professional's SRS |
| `reputation:score:breakdown` | View score breakdown by dimension |
| `reputation:credentials:list` | List credential types (not content) |
| `reputation:credentials:read` | Read full credential content |
| `reputation:presentation:verify` | Verify a presentation shared by the holder |
| `reputation:events:read` | Read raw event history |

### 5.3 Consent Revocation

Consent can be revoked at any time:

```
DELETE /v1/consents/{consentId}
```

After revocation, the grantee MUST stop accessing the professional's data. Previously verified credentials remain valid (the proof is self-contained) but no new data access is permitted.

## 6. Data Protection Compliance

### 6.1 GDPR (EU)

| GDPR Right | SRP Implementation |
|------------|-------------------|
| Right to access (Art. 15) | `GET /v1/agents/{did}/data` returns all stored data |
| Right to rectification (Art. 16) | Credential re-issuance with corrected data |
| Right to erasure (Art. 17) | `DELETE /v1/agents/{did}` cascades to all data |
| Right to portability (Art. 20) | `GET /v1/agents/{did}/export` returns data in JSON |
| Right to object (Art. 21) | Consent revocation mechanism |
| Automated decision-making (Art. 22) | Score algorithm is transparent; breakdown available |

### 6.2 LGPD (Brazil)

The LGPD mirrors GDPR with additional requirements:

- **Legal basis** MUST be recorded for all data processing (`consent`, `legitimate_interest`, `contract_execution`).
- **Data Protection Officer (DPO)** contact information MUST be published by issuers processing Brazilian professionals' data.

### 6.3 Data Minimization

- Credentials SHOULD contain the minimum data necessary to prove the claim.
- Verifiers SHOULD request only the scopes they need.
- Score calculations SHOULD use aggregated data rather than raw events when possible.

## 7. Audit Trail

### 7.1 Verification Log

Each verification event is logged (visible to the holder):

```json
{
  "verificationId": "ver-xyz789",
  "credentialId": "urn:uuid:b4c7e3f2-...",
  "verifierDid": "did:web:recruiter.example.com",
  "verifiedAt": "2026-03-09T14:30:00Z",
  "claimsAccessed": ["achievement.name", "achievement.salesCategory"],
  "result": "verified"
}
```

Holders can review who has verified their credentials:

```
GET /v1/agents/{did}/audit-log
```

### 7.2 Consent Log

All consent grants and revocations are logged and available to the holder.

## 8. Data Retention

| Data Type | Retention Period | After Expiry |
|-----------|-----------------|-------------|
| Active credentials | While valid | Archived |
| Revoked credentials | 7 years | Deleted |
| Verification logs | 2 years | Anonymized |
| Consent records | 5 years after revocation | Deleted |
| Raw events | While active + 1 year | Anonymized |

## 9. Cryptographic Privacy Summary

| Mechanism | Privacy Guarantee | Standard |
|-----------|------------------|----------|
| BBS+ Signatures | Selective disclosure, ZK proofs | W3C `bbs-2023` |
| SD-JWT | Selective disclosure (claim-level) | IETF SD-JWT |
| Data Integrity Proofs | Tamper-evidence | W3C VC Data Integrity 1.1 |
| DID-based Identity | Pseudonymous identification | W3C DID 1.1 |
| Bitstring Status List | Privacy-preserving revocation | W3C Bitstring Status List |
