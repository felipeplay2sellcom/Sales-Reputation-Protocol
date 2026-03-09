import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index.js";
import { store } from "../src/store/memory.js";

const BASE = "http://localhost";
const AUTH = { "X-API-Key": "srp_test_key" };

function req(method: string, path: string, body?: unknown) {
  const init: RequestInit = {
    method,
    headers: { ...AUTH, "Content-Type": "application/json" },
  };
  if (body) init.body = JSON.stringify(body);
  return app.request(`${BASE}/v1${path}`, init);
}

describe("Health & Info", () => {
  it("GET /health returns ok", async () => {
    const res = await app.request(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("GET /v1 returns API info", async () => {
    const res = await app.request(`${BASE}/v1`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Sales Reputation Protocol API");
  });
});

describe("Authentication", () => {
  it("rejects requests without auth", async () => {
    const res = await app.request(`${BASE}/v1/events`, { method: "GET" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid API keys", async () => {
    const res = await app.request(`${BASE}/v1/events`, {
      method: "GET",
      headers: { "X-API-Key": "invalid_key" },
    });
    expect(res.status).toBe(401);
  });

  it("accepts srp_ prefixed keys", async () => {
    const res = await app.request(`${BASE}/v1/events`, {
      method: "GET",
      headers: { "X-API-Key": "srp_custom_key" },
    });
    expect(res.status).toBe(200);
  });
});

describe("Events API", () => {
  beforeEach(() => store.clear());

  const validEvent = {
    type: "sale_completed",
    category: "performance",
    subjectDid: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    occurredAt: "2026-03-08T15:30:00Z",
    industry: "saas",
    data: { dealValue: 75000, currency: "USD" },
  };

  it("POST /events creates an event", async () => {
    const res = await req("POST", "/events", validEvent);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.type).toBe("sale_completed");
    expect(body.status).toBe("submitted");
    expect(body.issuerDid).toBe("did:web:test-issuer.example.com");
  });

  it("POST /events rejects invalid event type", async () => {
    const res = await req("POST", "/events", { ...validEvent, type: "invalid" });
    expect(res.status).toBe(422);
  });

  it("POST /events rejects future dates", async () => {
    const res = await req("POST", "/events", { ...validEvent, occurredAt: "2030-01-01T00:00:00Z" });
    expect(res.status).toBe(422);
  });

  it("POST /events rejects invalid DID", async () => {
    const res = await req("POST", "/events", { ...validEvent, subjectDid: "not-a-did" });
    expect(res.status).toBe(422);
  });

  it("GET /events lists events", async () => {
    await req("POST", "/events", validEvent);
    await req("POST", "/events", { ...validEvent, type: "certification_earned", category: "development" });

    const res = await req("GET", "/events");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.pagination).toBeDefined();
  });

  it("GET /events filters by type", async () => {
    await req("POST", "/events", validEvent);
    await req("POST", "/events", { ...validEvent, type: "certification_earned", category: "development" });

    const res = await req("GET", "/events?type=sale_completed");
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].type).toBe("sale_completed");
  });

  it("GET /events/:id returns specific event", async () => {
    const created = await req("POST", "/events", validEvent);
    const { id } = await created.json();

    const res = await req("GET", `/events/${id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(id);
  });

  it("GET /events/:id returns 404 for missing", async () => {
    const res = await req("GET", "/events/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("Credentials API", () => {
  beforeEach(() => store.clear());

  const issueParams = {
    subjectDid: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    achievementName: "Enterprise Deal Closer",
    achievementDescription: "Closed 10+ enterprise deals exceeding $50K each",
    salesCategory: "deal_milestone",
    industry: "saas",
  };

  it("POST /credentials/issue creates a credential", async () => {
    const res = await req("POST", "/credentials/issue", issueParams);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body["@context"]).toBeDefined();
    expect(body.type).toContain("VerifiableCredential");
    expect(body.id).toMatch(/^urn:uuid:/);
    expect(body.credentialSubject.achievement.name).toBe("Enterprise Deal Closer");
  });

  it("GET /credentials lists credentials", async () => {
    await req("POST", "/credentials/issue", issueParams);
    const res = await req("GET", "/credentials");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("POST /credentials/status revokes a credential", async () => {
    const created = await req("POST", "/credentials/issue", issueParams);
    const vc = await created.json();

    const res = await req("POST", "/credentials/status", {
      credentialId: vc.id,
      status: "revoked",
      reason: "Test revocation",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("revoked");
  });
});

describe("Verification API", () => {
  beforeEach(() => store.clear());

  it("POST /verify/credential verifies a valid credential", async () => {
    const created = await req("POST", "/credentials/issue", {
      subjectDid: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      achievementName: "Test",
      achievementDescription: "Test achievement",
      salesCategory: "deal_milestone",
    });
    const vc = await created.json();

    const res = await req("POST", "/verify/credential", { credential: vc });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.verified).toBe(true);
    expect(body.checks.signature.passed).toBe(true);
  });

  it("POST /verify/credential detects revoked credentials", async () => {
    const created = await req("POST", "/credentials/issue", {
      subjectDid: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      achievementName: "Test",
      achievementDescription: "Test",
      salesCategory: "deal_milestone",
    });
    const vc = await created.json();

    await req("POST", "/credentials/status", { credentialId: vc.id, status: "revoked" });

    const res = await req("POST", "/verify/credential", { credential: vc });
    const body = await res.json();
    expect(body.verified).toBe(false);
    expect(body.errors[0].code).toBe("CREDENTIAL_REVOKED");
  });
});

describe("Scores API", () => {
  beforeEach(() => store.clear());

  it("GET /scores/:did returns a score", async () => {
    const res = await req("GET", "/scores/did:key:z6Mktest");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.score.value).toBeGreaterThanOrEqual(300);
    expect(body.score.value).toBeLessThanOrEqual(850);
    expect(body.score.tier).toBeDefined();
    expect(body.dimensions).toBeDefined();
  });

  it("GET /scores/:did/history returns history", async () => {
    // Generate a score first
    await req("GET", "/scores/did:key:z6Mktest");

    const res = await req("GET", "/scores/did:key:z6Mktest/history");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.history.length).toBeGreaterThan(0);
  });
});

describe("Issuers API", () => {
  beforeEach(() => store.clear());

  it("POST /issuers registers an issuer", async () => {
    const res = await req("POST", "/issuers", {
      did: "did:web:acme-corp.com",
      name: "Acme Corporation",
      website: "https://acme.com",
      industry: "saas",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.did).toBe("did:web:acme-corp.com");
    expect(body.trustLevel).toBe("domain_verified");
  });

  it("POST /issuers rejects duplicate registration", async () => {
    await req("POST", "/issuers", { did: "did:web:acme.com", name: "Acme" });
    const res = await req("POST", "/issuers", { did: "did:web:acme.com", name: "Acme 2" });
    expect(res.status).toBe(409);
  });

  it("GET /issuers lists issuers", async () => {
    await req("POST", "/issuers", { did: "did:web:a.com", name: "A" });
    await req("POST", "/issuers", { did: "did:web:b.com", name: "B" });

    const res = await req("GET", "/issuers");
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });
});

describe("Webhooks API", () => {
  beforeEach(() => store.clear());

  it("POST /webhooks registers a webhook", async () => {
    const res = await req("POST", "/webhooks", {
      url: "https://example.com/hook",
      events: ["credential.issued", "score.updated"],
      secret: "my-secret",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.events).toHaveLength(2);
    // Secret should not be returned
    expect(body.secret).toBeUndefined();
  });

  it("DELETE /webhooks/:id deletes a webhook", async () => {
    const created = await req("POST", "/webhooks", {
      url: "https://example.com/hook",
      events: ["credential.issued"],
      secret: "s",
    });
    const { id } = await created.json();

    const res = await req("DELETE", `/webhooks/${id}`);
    expect(res.status).toBe(204);
  });

  it("DELETE /webhooks/:id returns 404 for missing", async () => {
    const res = await req("DELETE", "/webhooks/nonexistent");
    expect(res.status).toBe(404);
  });
});
