# Architecture Guide

This document provides a detailed technical overview of the Sales Reputation Protocol architecture for implementers.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   CRM    │  │  Sales   │  │    HR    │  │  Wallet  │            │
│  │ Platform │  │ Platform │  │  System  │  │   App    │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │              │              │              │                  │
├───────┼──────────────┼──────────────┼──────────────┼──────────────────┤
│       ▼              ▼              ▼              ▼                  │
│                    SRP API (REST + Webhooks)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    PROTOCOL LAYER                             │    │
│  │                                                               │    │
│  │  ┌─────────┐  ┌────────────┐  ┌─────────┐  ┌─────────────┐  │    │
│  │  │  Event  │  │ Credential │  │ Scoring │  │ Verification│  │    │
│  │  │ Engine  │  │   Engine   │  │ Engine  │  │   Engine    │  │    │
│  │  └────┬────┘  └─────┬──────┘  └────┬────┘  └──────┬──────┘  │    │
│  │       │              │              │               │         │    │
│  └───────┼──────────────┼──────────────┼───────────────┼─────────┘    │
│          │              │              │               │              │
├──────────┼──────────────┼──────────────┼───────────────┼──────────────┤
│          ▼              ▼              ▼               ▼              │
│                    IDENTITY LAYER                                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐       │
│  │ DID Resolver │  │ Key Manager  │  │ Issuer Registry      │       │
│  │              │  │              │  │                       │       │
│  │ did:web      │  │ Ed25519      │  │ Trust levels          │       │
│  │ did:key      │  │ P-256        │  │ Domain verification   │       │
│  │ did:ethr     │  │ BBS+         │  │ Platform verification │       │
│  └──────────────┘  └──────────────┘  └──────────────────────┘       │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                      TRUST LAYER                                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐       │
│  │  On-Chain    │  │    IPFS      │  │ Status Lists         │       │
│  │  Anchoring   │  │              │  │                       │       │
│  │              │  │ Credential   │  │ Bitstring Status      │       │
│  │  EAS on L2   │  │ metadata     │  │ List for revocation   │       │
│  │  (Optimism)  │  │ storage      │  │ and suspension        │       │
│  └──────────────┘  └──────────────┘  └──────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Event Engine

Responsible for:
- Receiving and validating sales events
- Checking evidence against sources
- Managing event lifecycle (submitted → validated → active → expired)
- Enforcing velocity limits and anomaly detection

### Credential Engine

Responsible for:
- Constructing W3C VC 2.0 credentials from validated events
- Signing credentials with the issuer's key
- Managing credential lifecycle (issuance, suspension, revocation)
- Generating verifiable presentations for holders

### Scoring Engine

Responsible for:
- Calculating the Sales Reputation Score from verified credentials
- Applying time decay (EWMA) and small-sample correction (Wilson score)
- Enforcing anti-gaming mechanisms (daily caps, anomaly detection)
- Generating SalesScoreCredentials

### Verification Engine

Responsible for:
- Cryptographic signature verification
- DID resolution and key extraction
- Revocation/suspension status checks
- Issuer trust level assessment
- On-chain anchor verification (when present)

## Data Flow

### Credential Issuance Flow

```
  Issuer CRM                SRP API              Blockchain
      │                        │                      │
      │  1. POST /v1/events    │                      │
      │───────────────────────>│                      │
      │                        │                      │
      │  2. Validate event     │                      │
      │    against evidence    │                      │
      │                        │                      │
      │  3. POST /v1/          │                      │
      │    credentials/issue   │                      │
      │───────────────────────>│                      │
      │                        │                      │
      │  4. Sign credential    │                      │
      │    with issuer DID key │                      │
      │                        │                      │
      │                        │  5. Anchor hash      │
      │                        │───────────────────── >│
      │                        │                      │
      │  6. Return signed      │                      │
      │    credential          │                      │
      │<───────────────────────│                      │
      │                        │                      │
      │  7. Deliver to holder  │                      │
      │                        │                      │
```

### Verification Flow

```
  Verifier App              SRP API              Blockchain
      │                        │                      │
      │  1. POST /v1/verify/   │                      │
      │    credential          │                      │
      │───────────────────────>│                      │
      │                        │                      │
      │  2. Resolve issuer DID │                      │
      │    → get public key    │                      │
      │                        │                      │
      │  3. Verify signature   │                      │
      │                        │                      │
      │  4. Check revocation   │                      │
      │    status list         │                      │
      │                        │                      │
      │  5. Check issuer trust │                      │
      │    level in registry   │                      │
      │                        │                      │
      │                        │  6. Verify on-chain  │
      │                        │    anchor (optional)  │
      │                        │───────────────────── >│
      │                        │                      │
      │  7. Return result      │                      │
      │<───────────────────────│                      │
```

## Deployment Patterns

### Centralized (Simplest)

A single organization runs the full SRP stack:
- Best for: Getting started, single-company deployments
- Trade-off: Relies on one party's infrastructure

### Federated

Multiple organizations run their own SRP instances that interoperate:
- Best for: Industry consortiums, multi-company ecosystems
- Trade-off: Requires coordination on issuer registry

### Decentralized

Each role (issuer, holder, verifier) runs independently:
- Best for: Maximum resilience and censorship resistance
- Trade-off: More complex infrastructure

## Technology Choices

| Component | Recommended Technology | Rationale |
|-----------|----------------------|-----------|
| API Framework | Express/Fastify (Node.js) or Axum (Rust) | Broad ecosystem, good VC library support |
| DID Resolution | `did-resolver` (JS) or Universal Resolver | Multi-method support |
| VC Signing | `@digitalbazaar/vc` or `SpruceID/ssi` | W3C VC 2.0 compliant |
| BBS+ | `@mattrglobal/bbs-signatures` | Most mature BBS+ library |
| Key Storage | AWS KMS, HashiCorp Vault, or local | HSM-backed for production |
| Database | PostgreSQL | Reliable, supports JSONB for credentials |
| Cache | Redis | Score caching, rate limiting |
| Blockchain | EAS SDK (@ethereum-attestation-service/eas-sdk) | Official EAS tooling |
| IPFS | Pinata or web3.storage | Managed pinning |
