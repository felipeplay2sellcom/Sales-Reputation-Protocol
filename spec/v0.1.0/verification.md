# Sales Reputation Protocol — Verification Specification

**Version**: 0.1.0-draft
**Status**: Draft

---

## 1. Overview

Verification is the process by which a **Verifier** establishes the authenticity, integrity, and trustworthiness of an SRP credential. The protocol defines a multi-layered verification model that combines cryptographic proof, issuer trust, and optional on-chain anchoring.

## 2. Verification Layers

```
┌─────────────────────────────────────────┐
│  LAYER 3: TRUST ASSESSMENT              │
│  Is the issuer trusted? What level?     │
├─────────────────────────────────────────┤
│  LAYER 2: STATUS CHECK                  │
│  Is the credential still valid?         │
├─────────────────────────────────────────┤
│  LAYER 1: CRYPTOGRAPHIC VERIFICATION    │
│  Is the signature valid?                │
└─────────────────────────────────────────┘
```

All three layers MUST pass for a credential to be considered verified.

## 3. Layer 1: Cryptographic Verification

### 3.1 Process

1. **Resolve the issuer's DID** to obtain the DID Document.
2. **Extract the verification method** referenced in the credential's `proof.verificationMethod`.
3. **Verify the cryptographic signature** against the credential content.
4. **Confirm proof purpose** matches `assertionMethod` (for issuance) or `authentication` (for presentations).

### 3.2 Data Integrity Proofs

For credentials using Data Integrity proofs:

1. Canonicalize the credential using the appropriate algorithm (RDFC 1.0 for `*-rdfc-*` cryptosuites).
2. Hash the canonicalized form.
3. Verify the signature in `proofValue` against the hash using the issuer's public key.

### 3.3 JWT Proofs

For JWT-secured credentials:

1. Decode the JWT header to identify the algorithm and key.
2. Resolve the issuer's DID to find the signing key.
3. Verify the JWT signature.
4. Validate standard JWT claims (`iss`, `nbf`, `exp`).

## 4. Layer 2: Status Check

### 4.1 Revocation Check

If the credential includes a `credentialStatus` field, the verifier MUST check whether the credential has been revoked or suspended.

**Bitstring Status List** (recommended):

1. Fetch the status list credential from the URL in `credentialStatus.statusListCredential`.
2. Verify the status list credential's signature.
3. Check the bit at `statusListIndex` — if set to `1`, the credential is revoked/suspended.

### 4.2 Expiration Check

If the credential includes a `validUntil` field, verify that the current time is before the expiration.

### 4.3 Validity Period

If the credential includes a `validFrom` field, verify that the current time is after the start date.

## 5. Layer 3: Trust Assessment

### 5.1 Issuer Registry

The protocol maintains a public **Issuer Registry** — a list of organizations registered to issue SRP credentials.

Verification of the issuer:

1. **Resolve** the issuer's DID.
2. **Look up** the issuer in the SRP Issuer Registry.
3. **Determine** the issuer's trust level.

### 5.2 Trust Levels

| Level | Verification Method | Trust Score |
|-------|-------------------|-------------|
| **Self-Declared** | DID exists, metadata provided | 0.25 |
| **Domain-Verified** | `did:web` resolves to the issuer's domain | 0.50 |
| **Platform-Verified** | Issuer has demonstrated CRM/platform integration | 0.85 |
| **Audited** | Independent third-party audit of issuer processes | 1.00 |

### 5.3 Domain Verification (did:web)

For `did:web` issuers:

1. Resolve `did:web:example.com` to `https://example.com/.well-known/did.json`.
2. Verify the DID Document is served over HTTPS with a valid certificate.
3. Confirm the domain matches the issuer's claimed organization.

### 5.4 Platform Verification

Issuers can prove CRM integration by:

1. Demonstrating API connectivity to a recognized CRM (Salesforce, HubSpot, Pipedrive, etc.).
2. Submitting sample event data that is cross-referenced with the CRM.
3. Passing an automated integration test defined by the SRP Registry.

## 6. On-Chain Anchoring

### 6.1 Purpose

On-chain anchoring provides an additional layer of tamper-evidence. It is OPTIONAL but RECOMMENDED for high-value credentials.

### 6.2 Ethereum Attestation Service (EAS)

The protocol uses [EAS](https://attest.org/) for on-chain attestations:

**Schema Registration** (one-time per credential type):

```solidity
// Example schema for SalesReputationCredential
bytes32 schemaUID = schemaRegistry.register(
    "bytes32 credentialHash, address issuer, address subject, string credentialType, uint64 issuedAt",
    ISchemaResolver(address(0)),
    true  // revocable
);
```

**Attestation** (per credential):

```solidity
bytes32 attestationUID = eas.attest(
    AttestationRequest({
        schema: schemaUID,
        data: AttestationRequestData({
            recipient: subjectAddress,
            expirationTime: validUntil,
            revocable: true,
            data: abi.encode(credentialHash, issuerAddress, subjectAddress, "SalesReputationCredential", issuedAt)
        })
    })
);
```

### 6.3 Recommended Chains

| Chain | Use Case | Cost per Attestation |
|-------|----------|---------------------|
| **Optimism** | Default for SRP attestations | ~$0.01–0.05 |
| **Base** | Consumer-facing credentials | ~$0.01–0.05 |
| **Ethereum L1** | Schema registration only | ~$5–20 |

### 6.4 Verification with On-Chain Anchor

When a credential has an on-chain anchor:

1. Compute the credential hash (SHA-256 of the canonicalized credential).
2. Look up the attestation on-chain using the credential hash.
3. Verify the attestation exists, is not revoked, and was created by the expected issuer.
4. This provides an additional trust signal beyond the cryptographic signature.

## 7. Verification Response

The result of verification SHOULD follow this structure:

```json
{
  "verified": true,
  "credential": {
    "id": "urn:uuid:b4c7e3f2-8a91-4d5e-b6c3-2f1e0d9a8b7c",
    "type": "SalesReputationCredential",
    "issuer": "did:web:acme-corp.com"
  },
  "checks": {
    "signature": { "passed": true },
    "status": { "passed": true, "method": "BitstringStatusList" },
    "expiration": { "passed": true, "validUntil": "2027-03-09T00:00:00Z" },
    "issuerTrust": { "passed": true, "level": "platform_verified", "score": 0.85 },
    "onChainAnchor": { "passed": true, "chain": "optimism", "txHash": "0x..." }
  },
  "verifiedAt": "2026-03-09T14:30:00Z"
}
```

## 8. Batch Verification

Verifiable Presentations may contain multiple credentials. Each credential MUST be verified independently. The presentation itself MUST also have its proof verified to confirm the holder's identity.

## 9. Offline Verification

Credentials signed with Data Integrity proofs can be verified offline (without network access) if:

1. The issuer's DID Document (with public key) is cached.
2. The credential does not require a status check (no `credentialStatus` field).

This enables verification in low-connectivity environments.

## 10. Error Codes

| Code | Meaning |
|------|---------|
| `SIGNATURE_INVALID` | Cryptographic signature verification failed |
| `ISSUER_NOT_FOUND` | Issuer's DID could not be resolved |
| `ISSUER_UNTRUSTED` | Issuer not found in the SRP Issuer Registry |
| `CREDENTIAL_REVOKED` | Credential has been revoked by the issuer |
| `CREDENTIAL_SUSPENDED` | Credential has been temporarily suspended |
| `CREDENTIAL_EXPIRED` | Credential's `validUntil` date has passed |
| `CREDENTIAL_NOT_YET_VALID` | Current time is before `validFrom` |
| `SCHEMA_INVALID` | Credential does not conform to the SRP schema |
| `ANCHOR_MISMATCH` | On-chain anchor does not match the credential hash |
| `ANCHOR_NOT_FOUND` | Expected on-chain anchor was not found |
