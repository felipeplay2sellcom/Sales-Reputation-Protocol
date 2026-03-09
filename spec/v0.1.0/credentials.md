# Sales Reputation Protocol — Credentials Specification

**Version**: 0.1.0-draft
**Status**: Draft

---

## 1. Overview

An **SRP Credential** is a digitally signed, tamper-proof record that attests to a sales professional's performance, achievement, or qualification. SRP Credentials conform to the [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) and are compatible with [Open Badges 3.0](https://www.imsglobal.org/spec/ob/v3p0).

## 2. Credential Types

### 2.1 SalesReputationCredential

The primary credential type. Attests to a specific sales achievement or performance metric.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://salesreputationprotocol.org/context/v1"
  ],
  "id": "urn:uuid:b4c7e3f2-8a91-4d5e-b6c3-2f1e0d9a8b7c",
  "type": ["VerifiableCredential", "SalesReputationCredential"],
  "issuer": {
    "id": "did:web:acme-corp.com",
    "type": "Organization",
    "name": "Acme Corporation",
    "industry": "saas"
  },
  "validFrom": "2026-03-09T00:00:00Z",
  "validUntil": "2027-03-09T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "SalesAchievementSubject",
    "achievement": {
      "type": "SalesAchievement",
      "name": "Enterprise Deal Closer",
      "description": "Closed 10+ enterprise deals exceeding $50K each in a single quarter",
      "criteria": {
        "narrative": "Close 10 or more deals with individual value >= $50,000 USD within a single fiscal quarter, as verified by CRM records."
      },
      "salesCategory": "deal_milestone",
      "industry": "saas",
      "image": {
        "id": "https://badges.example.com/images/enterprise-closer.png",
        "type": "Image"
      }
    },
    "evidence": [
      {
        "type": "CRMRecord",
        "source": "salesforce",
        "verifiedAt": "2026-03-08T23:59:59Z"
      }
    ]
  },
  "credentialStatus": {
    "id": "https://reputation.acme-corp.com/status/3#1234",
    "type": "BitstringStatusListEntry",
    "statusPurpose": "revocation",
    "statusListIndex": "1234",
    "statusListCredential": "https://reputation.acme-corp.com/status/3"
  }
}
```

### 2.2 SalesScoreCredential

Attests to a professional's Sales Reputation Score at a point in time.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://salesreputationprotocol.org/context/v1"
  ],
  "id": "urn:uuid:c5d8f4a3-9b02-5e6f-c7d4-3a2f1e0b9c8d",
  "type": ["VerifiableCredential", "SalesScoreCredential"],
  "issuer": {
    "id": "did:web:salesreputationprotocol.org",
    "type": "Organization",
    "name": "SRP Score Authority"
  },
  "validFrom": "2026-03-09T00:00:00Z",
  "validUntil": "2026-06-09T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "SalesScoreSubject",
    "score": {
      "value": 742,
      "range": { "min": 300, "max": 850 },
      "tier": "excellent",
      "calculatedAt": "2026-03-09T00:00:00Z",
      "dimensions": {
        "performance": 0.85,
        "reliability": 0.78,
        "clientImpact": 0.72,
        "professionalGrowth": 0.65,
        "peerTrust": 0.60
      },
      "credentialCount": 47,
      "window": "90d"
    }
  }
}
```

### 2.3 SalesEndorsementCredential

A third-party endorsement of a professional's abilities.

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://salesreputationprotocol.org/context/v1"
  ],
  "id": "urn:uuid:d6e9a5b4-0c13-6f7a-d8e5-4b3a2f1c0d9e",
  "type": ["VerifiableCredential", "SalesEndorsementCredential"],
  "issuer": {
    "id": "did:key:z6MkqR3N8A5B7C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4",
    "type": "Person",
    "name": "Jane Rodriguez",
    "role": "VP of Sales, TechCorp"
  },
  "validFrom": "2026-03-09T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "SalesEndorsementSubject",
    "endorsement": {
      "type": "SkillEndorsement",
      "skills": ["enterprise_sales", "consultative_selling", "negotiation"],
      "relationship": "direct_manager",
      "duration": "2_years",
      "narrative": "Consistently exceeded quota, excellent at navigating complex enterprise deals."
    }
  }
}
```

## 3. Credential Lifecycle

```
  ISSUED ──> ACTIVE ──> EXPIRED
               │
               └──> SUSPENDED ──> ACTIVE (reinstated)
               │
               └──> REVOKED (permanent)
```

### 3.1 Issuance

1. Issuer validates one or more sales events.
2. Issuer constructs the credential document.
3. Issuer signs the credential using their DID's private key.
4. Credential is delivered to the holder.
5. (Optional) Credential hash is anchored on-chain.

### 3.2 Revocation

Issuers MUST support credential revocation using the [W3C Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/) mechanism.

Reasons for revocation:
- Fraudulent evidence discovered
- Issuer key compromised
- Data correction required
- Holder requests removal (right to erasure)

### 3.3 Expiration

Credentials MAY have a `validUntil` date. Score credentials SHOULD expire after 90 days to ensure freshness. Achievement credentials MAY be permanent.

## 4. Proof Formats

SRP credentials MUST be secured using one of these proof formats:

### 4.1 Data Integrity Proof (Recommended)

```json
{
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "ecdsa-rdfc-2022",
    "created": "2026-03-09T12:00:00Z",
    "verificationMethod": "did:web:acme-corp.com#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z58DAdFfa9SkqZMVPxAQpic7ndneZHKE8jGwS..."
  }
}
```

Supported cryptosuites:

| Cryptosuite | Use Case |
|-------------|----------|
| `ecdsa-rdfc-2022` | General-purpose signing |
| `eddsa-rdfc-2022` | High-performance signing |
| `ecdsa-sd-2023` | Selective disclosure (ECDSA-based) |
| `bbs-2023` | Zero-knowledge selective disclosure |

### 4.2 JWT (VC-JOSE-COSE)

For environments where JWT is preferred (existing OAuth/OIDC infrastructure):

```
eyJhbGciOiJFUzI1NiIsInR5cCI6InZjK3NkLWp3dCJ9.eyJAY29udGV4dCI6Wy...
```

## 5. Verifiable Presentations

Holders share credentials through **Verifiable Presentations** — signed wrappers that prove the holder controls the credentials:

```json
{
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  "type": "VerifiablePresentation",
  "holder": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "verifiableCredential": [
    { /* SalesReputationCredential */ },
    { /* SalesScoreCredential */ }
  ],
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "ecdsa-rdfc-2022",
    "created": "2026-03-09T14:00:00Z",
    "verificationMethod": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
    "proofPurpose": "authentication",
    "challenge": "abc123",
    "proofValue": "z3FXQjecWufY46..."
  }
}
```

## 6. OBv3 Compatibility

SRP achievement credentials are designed to be compatible with Open Badges 3.0. An SRP credential with type `["VerifiableCredential", "SalesReputationCredential"]` can also include `"OpenBadgeCredential"` in its type array to signal OBv3 compatibility:

```json
{
  "type": ["VerifiableCredential", "OpenBadgeCredential", "SalesReputationCredential"],
  ...
}
```

This enables SRP credentials to be displayed in any OBv3-compatible badge platform (Credly, Badgr, etc.).

## 7. Schema

The canonical JSON Schema for credentials is defined in [`schema/v0.1.0/credential.schema.json`](../../schema/v0.1.0/credential.schema.json).
