<p align="center">
  <h1 align="center">Sales Reputation Protocol (SRP)</h1>
  <p align="center">
    An open standard for verifiable sales performance credentials.
    <br />
    <a href="https://salesreputationprotocol.org"><strong>Website »</strong></a>
    ·
    <a href="spec/v0.1.0/overview.md"><strong>Read the Spec »</strong></a>
    ·
    <a href="api/openapi.yaml"><strong>API Reference »</strong></a>
    ·
    <a href="examples/"><strong>Examples »</strong></a>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sales-reputation-protocol"><img src="https://img.shields.io/npm/v/sales-reputation-protocol.svg?color=cc3534" alt="npm"></a>
  <a href="https://salesreputationprotocol.org"><img src="https://img.shields.io/badge/website-salesreputationprotocol.org-6366f1.svg" alt="Website"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License"></a>
  <a href="spec/v0.1.0/overview.md"><img src="https://img.shields.io/badge/spec-v0.1.0--draft-orange.svg" alt="Spec Version"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## The Problem

Professional reputation in sales is broken.

- Résumés are inflated. **78% of candidates misrepresent themselves** on applications.
- Certifications prove knowledge, **not performance**. A Salesforce certification doesn't tell you if someone can actually close deals.
- Performance data is siloed. When a top performer leaves a company, their track record stays behind — locked in a CRM they no longer have access to.
- Verification is manual and slow. Hiring managers rely on reference calls and self-reported numbers with no way to independently verify.

There is no **credit score for sales professionals** — no universal, verifiable, portable measure of sales ability.

## The Solution

The **Sales Reputation Protocol (SRP)** is an open standard that enables organizations to issue, and professionals to hold, **cryptographically verifiable credentials** about sales performance.

Think of it as **FICO for sales** — but open, portable, and privacy-preserving.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ISSUER     │     │   HOLDER     │     │   VERIFIER   │
│              │     │              │     │              │
│  CRM/Company │────>│  Salesperson │────>│  Employer/   │
│  issues      │     │  holds       │     │  Recruiter   │
│  credential  │     │  credentials │     │  verifies    │
│              │     │  in wallet   │     │  claims      │
└──────────────┘     └──────────────┘     └──────────────┘
```

### How It Works

1. **A sales event occurs** — a deal closes, a quota is met, a ranking is achieved.
2. **The employer/platform validates the event** against CRM data, payment records, or other evidence.
3. **A verifiable credential is issued** — a digitally signed, tamper-proof record of the achievement.
4. **The professional holds and controls their credentials** — sharing them selectively with prospective employers, clients, or partners.
5. **Anyone can verify the credential** — cryptographically, without contacting the issuer.

### Key Properties

| Property | Description |
|----------|-------------|
| **Verifiable** | Every credential is cryptographically signed. Tampering is detectable. |
| **Portable** | Credentials belong to the professional, not the platform. They work across jobs, companies, and countries. |
| **Privacy-Preserving** | Prove "I exceeded $1M in annual sales" without revealing the exact number. Zero-knowledge selective disclosure. |
| **Interoperable** | Built on [W3C Verifiable Credentials 2.0](https://www.w3.org/TR/vc-data-model-2.0/) and compatible with [Open Badges 3.0](https://www.imsglobal.org/spec/ob/v3p0). |
| **Open** | No vendor lock-in. Any platform can issue, hold, or verify SRP credentials. |
| **Decentralized** | No single authority controls the protocol. Credential integrity is anchored on-chain. |

## Quick Example

A company issues a credential after a salesperson closes their 100th deal:

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://salesreputationprotocol.org/context/v1"
  ],
  "id": "urn:uuid:a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "type": ["VerifiableCredential", "SalesReputationCredential"],
  "issuer": {
    "id": "did:web:acme-corp.com",
    "name": "Acme Corporation"
  },
  "validFrom": "2026-03-09T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "SalesAchievementSubject",
    "achievement": {
      "type": "SalesAchievement",
      "name": "Century Club",
      "description": "Closed 100+ verified deals",
      "criteria": {
        "narrative": "Complete 100 or more CRM-verified closed-won deals"
      },
      "salesCategory": "deal_milestone",
      "industry": "saas"
    },
    "evidence": [{
      "type": "CRMRecord",
      "source": "salesforce",
      "verifiedAt": "2026-03-08T23:59:59Z"
    }]
  }
}
```

## Sales Reputation Score

The protocol defines a composite **Sales Reputation Score (SRS)** — a standardized measure of sales ability based on verified credentials.

```
Score Range: 300 – 850

┌─────────────────────────────────────┐
│  PERFORMANCE          30%           │  Quota attainment, win rate, deal volume
│  RELIABILITY          25%           │  Forecast accuracy, follow-through, consistency
│  CLIENT IMPACT        20%           │  Retention, NPS, referrals
│  PROFESSIONAL GROWTH  15%           │  Certifications, training, skill development
│  PEER TRUST           10%           │  Endorsements, collaboration, mentoring
└─────────────────────────────────────┘
```

The score uses:
- **Time-windowed calculation** — 90-day primary window with exponential decay on historical data
- **Wilson score correction** — prevents small sample sizes from inflating scores
- **Anti-gaming mechanisms** — daily caps, anomaly detection, multi-source validation

[Read the full scoring specification →](spec/v0.1.0/scoring.md)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  CRMs · Sales Platforms · HR Systems · Recruiting Tools     │
├─────────────────────────────────────────────────────────────┤
│                    PROTOCOL LAYER (SRP)                      │
│  Events · Credentials · Scoring · Verification · Privacy    │
├─────────────────────────────────────────────────────────────┤
│                    IDENTITY LAYER                            │
│  DIDs (did:web, did:key) · W3C Verifiable Credentials 2.0   │
├─────────────────────────────────────────────────────────────┤
│                    TRUST LAYER                               │
│  On-chain anchoring (EAS) · IPFS · Issuer Registry          │
└─────────────────────────────────────────────────────────────┘
```

## Specification

The protocol is defined across these documents:

| Document | Description |
|----------|-------------|
| [Overview](spec/v0.1.0/overview.md) | Protocol vision, principles, and architecture |
| [Events](spec/v0.1.0/events.md) | Sales event taxonomy and data model |
| [Credentials](spec/v0.1.0/credentials.md) | Credential format, issuance, and lifecycle |
| [Scoring](spec/v0.1.0/scoring.md) | Sales Reputation Score calculation model |
| [Verification](spec/v0.1.0/verification.md) | Cryptographic verification and trust model |
| [Privacy](spec/v0.1.0/privacy.md) | Selective disclosure and data protection |

## API

The protocol defines a standard [REST API](api/openapi.yaml) that any implementation MUST support:

```
POST   /v1/events                    Submit a sales event
POST   /v1/credentials/issue         Issue a reputation credential
POST   /v1/credentials/verify        Verify a credential
GET    /v1/scores/{agentDid}         Get a reputation score
GET    /v1/issuers/{issuerDid}       Look up a registered issuer
POST   /v1/presentations/create      Create a verifiable presentation
```

[Full API Reference →](api/openapi.yaml)

## Use Cases

### Recruiting & Hiring
> "Show me candidates with a verified SRS above 700 who have closed enterprise SaaS deals."

### Talent Marketplaces
> "I'm a real estate agent with 200+ verified transactions. Here's my portable reputation."

### Incentive Programs
> "Only agents with verified top-performer credentials qualify for the President's Club trip."

### Professional Certification
> "This training completion is a verifiable credential — not just a PDF certificate."

### Industry Benchmarking
> "What's the average SRS for insurance agents in the Southeast region?"

## Industry Coverage

The protocol is designed to work across all sales verticals:

| Industry | Key Metrics | Current Gap |
|----------|-------------|-------------|
| **SaaS / B2B** | ARR, quota attainment, win rate | Data locked in CRM silos |
| **Real Estate** | Transactions, volume, days-on-market | Fragmented across 500+ MLSs |
| **Insurance** | Policies written, retention, loss ratio | Carrier-specific, not portable |
| **Financial Services** | AUM, client retention | FINRA BrokerCheck covers compliance, not performance |
| **Automotive** | Units sold, CSI scores, F&I | Dealership-specific tracking |
| **Retail** | Sales/hour, upsell rate, basket size | POS-locked, high turnover |

## Standards Alignment

SRP builds on established open standards rather than reinventing the wheel:

| Standard | How SRP Uses It |
|----------|----------------|
| [W3C Verifiable Credentials 2.0](https://www.w3.org/TR/vc-data-model-2.0/) | Core credential data model |
| [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/) | Identity layer for issuers and holders |
| [Open Badges 3.0](https://www.imsglobal.org/spec/ob/v3p0) | Achievement credential compatibility |
| [BBS+ Signatures](https://identity.foundation/bbs-signature/draft-irtf-cfrg-bbs-signatures.html) | Zero-knowledge selective disclosure |
| [Ethereum Attestation Service](https://attest.org/) | On-chain credential anchoring |
| [JSON Schema 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) | Event and credential validation |

## Roadmap

- [x] **v0.1.0** — Protocol specification draft
- [x] **v0.2.0** — Reference implementation (TypeScript SDK + API server)
- [ ] **v0.3.0** — Issuer registry and trust framework
- [ ] **v0.4.0** — On-chain anchoring (EAS on Optimism/Base)
- [ ] **v0.5.0** — Zero-knowledge selective disclosure (BBS+)
- [ ] **v1.0.0** — Stable release with conformance test suite

## Contributing

We welcome contributions from the sales tech community, credential experts, and protocol designers.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, and [GOVERNANCE.md](GOVERNANCE.md) for how decisions are made.

To propose a significant change, submit an [RFC](rfcs/RFC-TEMPLATE.md).

## Community

- **Website**: [salesreputationprotocol.org](https://salesreputationprotocol.org)
- **Discussions**: [GitHub Discussions](https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol/discussions)
- **Issues**: [GitHub Issues](https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol/issues)
- **RFCs**: [rfcs/](rfcs/)

## License

This specification is licensed under [Apache License 2.0](LICENSE).

Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Authors

- **Felipe Santos** — Creator — [@felipeplay2sellcom](https://github.com/felipeplay2sellcom)

---

<p align="center">
  <strong>Professional reputation should be earned, verified, and owned by the professional.</strong>
  <br />
  <sub>Built with conviction that sales professionals deserve better than unverifiable résumés.</sub>
</p>
