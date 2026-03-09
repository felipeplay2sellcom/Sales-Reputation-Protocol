# Sales Reputation Protocol — Scoring Specification

**Version**: 0.1.0-draft
**Status**: Draft

---

## 1. Overview

The **Sales Reputation Score (SRS)** is a composite numerical measure of a sales professional's verified performance. It provides a standardized benchmark — similar to a credit score for sales ability — that is portable across organizations and industries.

## 2. Score Range

```
300 ─────── 500 ─────── 650 ─────── 750 ─────── 850
 │           │           │           │           │
 Poor      Below       Good      Very Good   Exceptional
           Average
```

| Range | Tier | Description |
|-------|------|-------------|
| 300–499 | Poor | Limited verified credentials, low performance indicators |
| 500–649 | Below Average | Some verified credentials, inconsistent performance |
| 650–719 | Good | Solid verified track record, consistent performance |
| 720–779 | Very Good | Strong verified performance across multiple dimensions |
| 780–850 | Exceptional | Top-tier verified performance with extensive credential history |

The 300–850 range is intentionally chosen (following the FICO precedent) to avoid misinterpretation as a percentage.

**Starting Score**: A new professional with zero credentials starts at **300**. Score increases as credentials are issued and verified.

## 3. Score Dimensions

The SRS is composed of five weighted dimensions:

| Dimension | Weight | Measures |
|-----------|--------|----------|
| **Performance** | 30% | Quota attainment, win rate, deal volume, revenue |
| **Reliability** | 25% | Consistency, forecast accuracy, follow-through rate |
| **Client Impact** | 20% | Customer retention, NPS, referrals, satisfaction |
| **Professional Growth** | 15% | Certifications, training, skill development |
| **Peer Trust** | 10% | Endorsements, collaboration, mentoring |

### 3.1 Performance (30%)

The core measure of sales output. Derived from `sale_completed`, `quota_attained`, and `top_performer` events.

**Input metrics:**

| Metric | Source Event | Weight within Dimension |
|--------|-------------|------------------------|
| Quota attainment rate | `sale_completed` (aggregated) | 35% |
| Win rate | `sale_completed` / total opportunities | 25% |
| Average deal size (normalized) | `sale_completed.data.dealValue` | 20% |
| Deal volume | Count of `sale_completed` events | 20% |

### 3.2 Reliability (25%)

Measures consistency and predictability. A reliable salesperson performs well repeatedly, not just in bursts.

**Input metrics:**

| Metric | Derivation | Weight within Dimension |
|--------|-----------|------------------------|
| Consistency score | Standard deviation of quarterly performance | 40% |
| Streak factor | Consecutive periods above threshold | 30% |
| Forecast accuracy | Predicted vs. actual results | 30% |

### 3.3 Client Impact (20%)

Measures the quality of client relationships and outcomes beyond the initial sale.

**Input metrics:**

| Metric | Source | Weight within Dimension |
|--------|--------|------------------------|
| Client retention rate | `renewal_closed` / total clients | 40% |
| NPS / satisfaction | `nps_score_received` events | 30% |
| Referrals generated | `referral_generated` events | 30% |

### 3.4 Professional Growth (15%)

Measures investment in skills and continuous learning.

**Input metrics:**

| Metric | Source | Weight within Dimension |
|--------|--------|------------------------|
| Certifications earned | `certification_earned` events | 50% |
| Training hours completed | `training_completed` events | 30% |
| Skill breadth | Unique skills across credentials | 20% |

### 3.5 Peer Trust (10%)

Measures social proof and professional reputation among peers.

**Input metrics:**

| Metric | Source | Weight within Dimension |
|--------|--------|------------------------|
| Endorsement count (weighted) | `SalesEndorsementCredential` | 50% |
| Endorser quality | Endorser's own SRS | 30% |
| Mentoring contributions | Mentoring-related events | 20% |

## 4. Calculation Method

### 4.1 Normalization

Each raw metric is normalized to a [0, 1] scale using min-max normalization relative to the population:

```
normalized_value = (value - population_min) / (population_max - population_min)
```

When population data is insufficient (new protocol, small pool), use industry benchmarks as defaults.

### 4.2 Small-Sample Correction

To prevent a professional with 2 deals and 100% win rate from outscoring one with 200 deals and 60% win rate, apply the **Wilson Score Lower Bound**:

```
wilson_score = (p + z²/2n - z * sqrt((p(1-p) + z²/4n) / n)) / (1 + z²/n)

where:
  p = success ratio
  n = total observations
  z = 1.96 (95% confidence interval)
```

This naturally discounts scores with low sample sizes.

### 4.3 Time Decay

Recent performance matters more than historical data. Apply **Exponentially Weighted Moving Average (EWMA)**:

```
S_t = λ * x_t + (1 - λ) * S_{t-1}

where:
  λ = 0.15 (decay factor)
  x_t = current period value
  S_{t-1} = previous period smoothed value
```

**Primary Window**: 90 days (most recent, full weight)
**Historical Modifier**: Events older than 90 days decay with half-life of approximately 200 days.

### 4.4 Dimension Aggregation

Each dimension score D_i is calculated, then the composite score is:

```
raw_score = Σ (weight_i × dimension_score_i)    for i in [1..5]

SRS = 300 + (raw_score × 550)
```

This maps the [0, 1] raw score to the [300, 850] range.

### 4.5 Complete Formula

```
SRS = 300 + 550 × (
    0.30 × Performance_normalized +
    0.25 × Reliability_normalized +
    0.20 × ClientImpact_normalized +
    0.15 × ProfessionalGrowth_normalized +
    0.10 × PeerTrust_normalized
)
```

## 5. Anti-Gaming Mechanisms

### 5.1 Daily Score Change Cap

Maximum score change per day: **±15 points**. This prevents manipulation through burst activity.

### 5.2 Multi-Source Validation

Each credential is weighted by the trust level of its issuer (see [Verification](verification.md)):

| Issuer Trust Level | Credential Weight Multiplier |
|--------------------|-----------------------------|
| Self-Declared | 0.25× |
| Domain-Verified | 0.50× |
| Platform-Verified | 0.85× |
| Audited | 1.00× |

### 5.3 Anomaly Detection

Flag and investigate:
- Score changes exceeding 3 standard deviations from the professional's mean
- Burst issuance (>10 credentials in 24 hours from the same issuer)
- Identical credentials issued to many professionals simultaneously
- Deal values significantly above industry medians

### 5.4 Endorsement Quality Weighting

Endorsements from high-SRS professionals carry more weight (PageRank-style):

```
endorsement_weight = endorser_SRS / 850
```

This prevents Sybil attacks where fake profiles endorse each other.

### 5.5 Velocity Limits

| Event Type | Maximum Frequency |
|------------|------------------|
| `sale_completed` | 50 per day per subject |
| `certification_earned` | 5 per day per subject |
| `endorsement_received` | 10 per day per subject |

Events exceeding velocity limits are queued for manual review.

## 6. Score Transparency

Unlike proprietary scoring models (FICO), SRP scoring is **open and transparent**:

1. The algorithm is published in this specification.
2. Score breakdowns by dimension are available to the holder.
3. Each input credential contributing to the score is traceable.
4. Changes to the scoring algorithm are versioned and documented.

Professionals MUST be able to understand why their score is what it is.

## 7. Industry Normalization

Scores are normalized within industry verticals when the `industry` field is present on events. A score of 700 in `real_estate` represents equivalent relative performance to a score of 700 in `saas`.

Cross-industry comparisons use a universal normalization baseline.

## 8. Score Update Frequency

Scores SHOULD be recalculated:
- When a new credential is issued to the subject
- When an existing credential is revoked
- At minimum, once per 24 hours for active professionals

Score credentials (SalesScoreCredential) SHOULD be re-issued every 90 days.

## 9. Schema

The canonical JSON Schema for score objects is defined in [`schema/v0.1.0/score.schema.json`](../../schema/v0.1.0/score.schema.json).
