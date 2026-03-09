# Glossary

Key terms used throughout the Sales Reputation Protocol specification.

## Protocol Terms

**Sales Reputation Protocol (SRP)**
An open standard for recording, issuing, and verifying professional sales performance credentials.

**Sales Reputation Score (SRS)**
A composite numerical measure (300–850) of a sales professional's verified performance, derived from verified credentials.

**Sales Event**
The atomic unit of the protocol. A recorded, validated occurrence of professional sales performance (e.g., a deal closing, a certification earned).

**SRP Credential**
A digitally signed, tamper-proof record attesting to a sales professional's performance, achievement, or qualification. Conforms to W3C Verifiable Credentials 2.0.

## Roles

**Issuer**
An organization that validates sales events and issues credentials. Examples: employers, CRM platforms, training providers.

**Holder**
A sales professional who receives, stores, and controls their credentials.

**Verifier**
An entity that checks the authenticity of a credential. Examples: hiring managers, recruiting platforms, incentive programs.

## Credential Terms

**Verifiable Credential (VC)**
A tamper-evident credential that is cryptographically signed by its issuer, following the W3C VC Data Model 2.0.

**Verifiable Presentation (VP)**
A signed wrapper that allows a holder to present one or more credentials to a verifier, proving they control the credentials.

**Selective Disclosure**
The ability to reveal only specific claims from a credential without exposing the entire credential.

**Zero-Knowledge Proof (ZKP)**
A cryptographic method that allows proving a statement is true without revealing the underlying data.

**BBS+ Signatures**
A cryptographic signature scheme that enables efficient selective disclosure and zero-knowledge proofs within verifiable credentials.

## Identity Terms

**Decentralized Identifier (DID)**
A globally unique identifier that the subject creates and controls, independent of any centralized authority. Format: `did:method:specific-id`.

**DID Document**
A document containing public keys and service endpoints associated with a DID.

**did:web**
A DID method that uses DNS and HTTPS for resolution. Recommended for organizational issuers.

**did:key**
A DID method where the identifier itself encodes a public key. Recommended for individual holders.

## Trust Terms

**Issuer Registry**
A public list of verified organizations registered to issue SRP credentials.

**Trust Level**
A measure of an issuer's verified trustworthiness: Self-Declared, Domain-Verified, Platform-Verified, or Audited.

**On-Chain Anchoring**
Recording a credential's hash on a public blockchain for additional tamper-evidence.

**Ethereum Attestation Service (EAS)**
An open-source, tokenless protocol for making on-chain and off-chain attestations on Ethereum and L2 networks.

## Scoring Terms

**Dimension**
One of five weighted categories in the SRS: Performance, Reliability, Client Impact, Professional Growth, Peer Trust.

**Time Decay**
A mechanism that gives more weight to recent performance data than historical data. Implemented using Exponentially Weighted Moving Average (EWMA).

**Wilson Score Lower Bound**
A statistical method that adjusts scores based on sample size, preventing small samples from producing misleadingly high scores.

**Anti-Gaming**
Mechanisms that prevent manipulation of the scoring system, including daily caps, velocity limits, and anomaly detection.

## Standards

**W3C VC 2.0**
The W3C Verifiable Credentials Data Model 2.0, the foundational standard for verifiable credentials.

**Open Badges 3.0 (OBv3)**
A specification by 1EdTech for digital achievement credentials, built on W3C VCs.

**JSON Schema 2020-12**
The latest version of JSON Schema, used for validating SRP data structures.

**OpenAPI 3.1**
A specification for describing RESTful APIs, used for the SRP API definition.

**RFC 9457**
Problem Details for HTTP APIs, used for error responses in the SRP API.
