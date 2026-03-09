# sales-reputation-protocol

Official TypeScript SDK for the [Sales Reputation Protocol](https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol).

## Installation

```bash
npm install sales-reputation-protocol
```

## Quick Start

### API Client

```typescript
import { SRPClient } from "sales-reputation-protocol";

const client = new SRPClient({
  baseUrl: "https://api.example.com/v1",
  apiKey: "srp_live_...",
});

// Submit a sales event
const event = await client.events.create({
  type: "sale_completed",
  category: "performance",
  subjectDid: "did:key:z6Mkh...",
  occurredAt: "2026-03-08T15:30:00Z",
  industry: "saas",
  data: {
    dealValue: 75000,
    currency: "USD",
    dealType: "new_business",
  },
  evidence: [
    { type: "CRMRecord", source: "salesforce" },
  ],
});

// Get a reputation score
const score = await client.scores.get("did:key:z6Mkh...");
console.log(`Score: ${score.score.value} (${score.score.tier})`);

// Verify a credential
const result = await client.verify.credential(credential);
console.log(`Verified: ${result.verified}`);
```

### Building Credentials

```typescript
import {
  buildAchievementCredential,
  generateCredentialId,
} from "sales-reputation-protocol";

const credential = buildAchievementCredential({
  id: generateCredentialId(),
  issuer: {
    id: "did:web:your-company.com",
    name: "Your Company",
  },
  subjectDid: "did:key:z6Mkh...",
  achievement: {
    type: "SalesAchievement",
    name: "Enterprise Deal Closer",
    description: "Closed 10+ enterprise deals exceeding $50K each",
    criteria: {
      narrative: "Close 10+ deals >= $50K in a single quarter",
    },
    salesCategory: "deal_milestone",
    industry: "saas",
  },
  evidence: [
    { type: "CRMRecord", source: "salesforce" },
  ],
});

// Sign the credential with your DID key (bring your own signer)
// const signed = await sign(credential, privateKey);
```

### Score Calculation

```typescript
import { calculateScore, getScoreTier, wilsonScore } from "sales-reputation-protocol";

// Calculate a composite score
const score = calculateScore({
  performance: 0.85,
  reliability: 0.78,
  clientImpact: 0.72,
  professionalGrowth: 0.65,
  peerTrust: 0.60,
});

console.log(score);            // 713
console.log(getScoreTier(713)); // "good"

// Adjust for sample size
const adjusted = wilsonScore(8, 10);  // 80% with 10 observations
console.log(adjusted);                 // ~0.49 (lower bound)
```

### Webhook Verification

```typescript
import { verifyWebhookSignature, parseWebhookEvent } from "sales-reputation-protocol";

// In your webhook handler
const isValid = await verifyWebhookSignature(
  rawBody,
  request.headers["x-signature-256"],
  process.env.WEBHOOK_SECRET!
);

if (isValid) {
  const event = parseWebhookEvent(rawBody);
  console.log(`Received: ${event.type}`);
}
```

## API Reference

### `SRPClient`

| Method | Description |
|--------|-------------|
| `client.events.create(input)` | Submit a sales event |
| `client.events.get(id)` | Get event details |
| `client.events.list(params?)` | List events (paginated) |
| `client.credentials.issue(params)` | Issue a credential |
| `client.credentials.get(id)` | Get a credential |
| `client.credentials.list(params?)` | List credentials |
| `client.credentials.updateStatus(params)` | Revoke/suspend a credential |
| `client.verify.credential(vc)` | Verify a credential |
| `client.verify.presentation(vp)` | Verify a presentation |
| `client.scores.get(did)` | Get reputation score |
| `client.scores.history(did, params?)` | Get score history |
| `client.issuers.register(params)` | Register as an issuer |
| `client.issuers.get(did)` | Get issuer details |
| `client.issuers.list(params?)` | List issuers |

### Scoring Functions

| Function | Description |
|----------|-------------|
| `calculateScore(dimensions)` | Calculate SRS from normalized dimensions |
| `getScoreTier(score)` | Get tier label for a score |
| `wilsonScore(positive, total)` | Wilson score lower bound |
| `ewma(current, previous, lambda?)` | Exponentially weighted moving average |
| `applyDailyCap(previous, new, max?)` | Apply daily score change cap |
| `normalize(value, min, max)` | Min-max normalization to [0, 1] |
| `timeDecayWeight(days, halfLife?)` | Calculate time decay weight |

### Credential Builders

| Function | Description |
|----------|-------------|
| `buildAchievementCredential(params)` | Build a SalesReputationCredential |
| `buildScoreCredential(params)` | Build a SalesScoreCredential |
| `buildEndorsementCredential(params)` | Build a SalesEndorsementCredential |
| `generateCredentialId()` | Generate a URN UUID |

## License

Apache-2.0
