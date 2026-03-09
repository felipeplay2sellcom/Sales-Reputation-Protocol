# Use Cases

This document describes real-world scenarios where the Sales Reputation Protocol provides value.

## 1. Recruiting & Hiring

### Problem
A hiring manager at TechCorp is evaluating two candidates for a Senior AE role. Both claim "120%+ quota attainment" and "President's Club winner." There is no way to verify these claims without calling references and hoping they're honest.

### With SRP
```
Candidate A presents a Verifiable Presentation:

✓ SalesReputationCredential: "President's Club 2025"
  Issuer: did:web:previous-employer.com (Platform-Verified)
  Verified: Signature valid, not revoked, issuer trusted

✓ SalesScoreCredential: Score 782 (Exceptional)
  Calculated: 2026-02-15
  Based on: 34 verified credentials

✓ Zero-Knowledge Proof: "quota_attainment >= 1.15"
  Result: TRUE (actual value not disclosed)
```

The hiring manager verifies all claims cryptographically in seconds, without contacting the previous employer.

### Value
- **For the employer**: Eliminates résumé fraud. Data-driven hiring decisions.
- **For the candidate**: Portable proof of performance. Stand out with verified credentials.

---

## 2. Real Estate Agent Portability

### Problem
A top-performing real estate agent with 200+ transactions wants to move to a new brokerage. Their track record is scattered across MLS systems and the previous brokerage's CRM. The new brokerage has no reliable way to verify their claims.

### With SRP
```
Agent presents credentials:

✓ 47 "sale_completed" events (2024-2026)
  Total verified volume: $28M+
  Average days on market: 21 (ZK proof: "< 30 days")

✓ "Top Producer 2025" credential
  Issuer: did:web:regional-realtors-association.org (Audited)
  Rank: 3rd / 1,200 agents

✓ Sales Reputation Score: 798 (Exceptional)
```

### Value
- **For the agent**: Reputation travels with them. No starting from zero at a new brokerage.
- **For the brokerage**: Hire proven performers with confidence.

---

## 3. Sales Incentive Programs

### Problem
A company runs a President's Club trip for top performers across 50 offices. Currently, each office self-reports their winners, leading to inconsistent criteria and occasional disputes.

### With SRP
```
Eligibility rule (programmatic):
  IF agent.score >= 750
  AND agent.credentials.contains("quota_attainment >= 1.20", period="2026")
  AND agent.credentials.issuer.trustLevel >= "platform_verified"
  THEN eligible = true
```

Eligibility is determined automatically from verified credentials. No self-reporting. No disputes.

### Value
- **For the company**: Fair, transparent, auditable incentive programs.
- **For the salespeople**: Clear criteria based on verified performance.

---

## 4. Sales Training & Certification

### Problem
A salesperson completes a $5,000 enterprise selling course. They receive a PDF certificate. Six months later, they can't find it. Two years later, they claim the certification on their résumé but no one can verify it.

### With SRP
```
Training provider issues:

✓ SalesReputationCredential: "Enterprise Selling Certification"
  Type: certification_earned
  Provider: did:web:sales-academy.com (Domain-Verified)
  Score: 92/100
  Valid until: 2028-03-09

Stored in the salesperson's digital wallet.
Verifiable by anyone, forever (or until expiration).
```

### Value
- **For the training provider**: Credentials carry their brand permanently.
- **For the salesperson**: Certifications are always accessible and verifiable.
- **For employers**: Verify training claims instantly.

---

## 5. Talent Marketplaces

### Problem
A freelance sales consultant wants to offer their services on a marketplace. They need to prove they can sell, not just claim it.

### With SRP
```
Marketplace profile shows verified data:

Felipe Santos
Sales Reputation Score: 742 (Very Good)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verified Achievements:
  ◆ 218 sales completed (5 issuers)
  ◆ 3× Top Performer
  ◆ Enterprise Sales Certified
  ◆ Client Retention: > 90% (ZK proof)

All claims cryptographically verified.
```

### Value
- **For the marketplace**: Higher-quality supply. Trust-based matching.
- **For the consultant**: Differentiation through verified reputation.
- **For the buyer**: Hire with confidence.

---

## 6. Insurance Agent Compliance

### Problem
An insurance carrier wants to verify that agents selling their products meet minimum performance and training standards. Currently, this requires manual audits.

### With SRP
```
Agent presents:

✓ Active insurance license (state-verified credential)
✓ Carrier product training (certification_earned)
✓ Loss ratio < 65% (ZK range proof)
✓ Policy retention > 85% (ZK range proof)
✓ Sales Reputation Score >= 650

Carrier's system automatically approves the agent
to sell new product lines.
```

### Value
- **For the carrier**: Automated compliance. Reduced risk.
- **For the agent**: Faster onboarding. Portable credentials across carriers.

---

## 7. Industry Benchmarking

### Problem
A sales VP wants to know: "How does my team's performance compare to the industry?" Current benchmarks are based on surveys with self-reported data.

### With SRP
```
Aggregated, anonymized data from verified credentials:

SaaS Enterprise Sales Benchmarks (Q1 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Median SRS:           648
Mean Win Rate:        32%
Mean Deal Size:       $47,200
Mean Sales Cycle:     84 days
Top Quartile SRS:     ≥ 738

Your Team Average:    712 (Top 30%)
```

### Value
- **For sales leaders**: Benchmarks based on verified data, not surveys.
- **For the industry**: More accurate market intelligence.

---

## 8. Cross-Border Sales Mobility

### Problem
A sales professional relocating from Brazil to the US needs to prove their track record to American employers. Foreign credentials are hard to verify, and there's no shared standard.

### With SRP
```
Professional presents credentials issued in Brazil:

✓ 150 sales completed @ did:web:empresa-brasileira.com.br
✓ Top Performer Nacional 2025
✓ Score: 761 (Very Good)

American employer verifies:
  - Same protocol, same verification process
  - Issuer DID resolves to a Brazilian company (did:web)
  - Issuer is Platform-Verified in the SRP Registry
  - All cryptographic checks pass

Result: VERIFIED ✓
```

### Value
- **For the professional**: Global portability of reputation.
- **For the employer**: Verify international candidates with the same confidence as domestic ones.
