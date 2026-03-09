# SRP Reference Server

Reference implementation of the [Sales Reputation Protocol](https://salesreputationprotocol.org) REST API.

> **Note**: This is a reference implementation with an in-memory store. Not intended for production use.

## Quick Start

```bash
npm install
npm run dev
```

The server starts at `http://localhost:3000`.

## Authentication

All `/v1/*` endpoints require authentication via:

```bash
# API Key header
curl -H "X-API-Key: srp_test_key" http://localhost:3000/v1/events

# Bearer token
curl -H "Authorization: Bearer srp_test_key" http://localhost:3000/v1/events
```

Pre-configured keys:
- `srp_test_key` → `did:web:test-issuer.example.com`
- `srp_demo_key` → `did:web:demo-company.example.com`

Any key prefixed with `srp_` is accepted in the reference implementation.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/v1` | API info |
| `POST` | `/v1/events` | Submit a sales event |
| `GET` | `/v1/events` | List events |
| `GET` | `/v1/events/:id` | Get event |
| `POST` | `/v1/credentials/issue` | Issue a credential |
| `GET` | `/v1/credentials` | List credentials |
| `GET` | `/v1/credentials/:id` | Get credential |
| `POST` | `/v1/credentials/status` | Revoke/suspend credential |
| `POST` | `/v1/verify/credential` | Verify a credential |
| `POST` | `/v1/verify/presentation` | Verify a presentation |
| `GET` | `/v1/scores/:did` | Get reputation score |
| `GET` | `/v1/scores/:did/history` | Get score history |
| `POST` | `/v1/issuers` | Register issuer |
| `GET` | `/v1/issuers` | List issuers |
| `GET` | `/v1/issuers/:did` | Get issuer |
| `GET` | `/v1/agents/:did` | Get agent profile |
| `GET` | `/v1/agents/:did/credentials` | List agent credentials |
| `POST` | `/v1/presentations/create` | Create presentation |
| `POST` | `/v1/webhooks` | Register webhook |
| `GET` | `/v1/webhooks` | List webhooks |
| `DELETE` | `/v1/webhooks/:id` | Delete webhook |

## Example Workflow

```bash
API="http://localhost:3000/v1"
AUTH="-H 'X-API-Key: srp_test_key'"

# 1. Register as an issuer
curl -X POST $API/issuers $AUTH \
  -H "Content-Type: application/json" \
  -d '{"did":"did:web:acme-corp.com","name":"Acme Corporation","industry":"saas"}'

# 2. Submit a sales event
curl -X POST $API/events $AUTH \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sale_completed",
    "category": "performance",
    "subjectDid": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "occurredAt": "2026-03-08T15:30:00Z",
    "industry": "saas",
    "data": {"dealValue": 75000, "currency": "USD"}
  }'

# 3. Issue a credential
curl -X POST $API/credentials/issue $AUTH \
  -H "Content-Type: application/json" \
  -d '{
    "subjectDid": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "achievementName": "Enterprise Deal Closer",
    "achievementDescription": "Closed 10+ enterprise deals exceeding $50K",
    "salesCategory": "deal_milestone",
    "industry": "saas"
  }'

# 4. Get reputation score
curl $API/scores/did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK $AUTH
```

## Testing

```bash
npm test
```

## Tech Stack

- [Hono](https://hono.dev) — Lightweight web framework
- [sales-reputation-protocol](https://www.npmjs.com/package/sales-reputation-protocol) — SRP TypeScript SDK
- [Vitest](https://vitest.dev) — Test runner

## License

Apache-2.0
