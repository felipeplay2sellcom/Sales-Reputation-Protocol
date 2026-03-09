import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import {
  buildAchievementCredential,
  generateCredentialId,
} from "sales-reputation-protocol";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const credentials = new Hono<AppEnv>();

// POST /credentials/issue — Issue a credential
credentials.post("/issue", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const {
    subjectDid,
    achievementName,
    achievementDescription,
    salesCategory,
    criteria,
    industry,
    evidence,
    validUntil,
  } = body;

  if (!subjectDid || !achievementName || !achievementDescription || !salesCategory) {
    return problemResponse(
      c,
      422,
      "Missing required fields: subjectDid, achievementName, achievementDescription, salesCategory.",
    );
  }

  if (!subjectDid.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid subjectDid '${subjectDid}'.`);
  }

  const issuerDid = c.get("issuerDid");
  const issuer = store.issuers.get(issuerDid);
  const issuerName = issuer?.name ?? issuerDid;

  const credentialId = generateCredentialId();
  const now = new Date().toISOString();

  const vc = buildAchievementCredential({
    id: credentialId,
    issuer: {
      id: issuerDid,
      name: issuerName,
    },
    subjectDid,
    achievement: {
      type: "SalesAchievement",
      name: achievementName,
      description: achievementDescription,
      criteria: criteria ? { narrative: criteria } : undefined,
      salesCategory,
      industry,
    },
    evidence,
    validFrom: now,
    validUntil,
  });

  store.credentials.set(credentialId, {
    id: credentialId,
    credential: vc as unknown as Record<string, unknown>,
    issuerDid,
    subjectDid,
    status: "active",
    issuedAt: now,
  });

  // Update issuer stats
  if (issuer) {
    issuer.credentialsIssued++;
  }

  // Update agent stats
  const agent = store.agents.get(subjectDid);
  if (agent) {
    agent.credentialCount++;
  } else {
    store.agents.set(subjectDid, {
      did: subjectDid,
      industries: industry ? [industry] : [],
      credentialCount: 1,
      memberSince: now,
    });
  }

  return c.json(vc, 201);
});

// GET /credentials — List credentials
credentials.get("/", (c) => {
  const subjectDid = c.req.query("subjectDid");
  const issuerDid = c.req.query("issuerDid");
  const limit = Math.min(parseInt(c.req.query("limit") ?? "25", 10), 100);
  const cursor = c.req.query("cursor");

  let results = Array.from(store.credentials.values());

  if (subjectDid) results = results.filter((cr) => cr.subjectDid === subjectDid);
  if (issuerDid) results = results.filter((cr) => cr.issuerDid === issuerDid);

  results.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  let startIndex = 0;
  if (cursor) {
    const idx = results.findIndex((cr) => cr.id === cursor);
    if (idx >= 0) startIndex = idx + 1;
  }

  const page = results.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < results.length;

  return c.json({
    data: page.map((cr) => cr.credential),
    pagination: {
      cursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  });
});

// GET /credentials/:credentialId — Get credential
credentials.get("/:credentialId", (c) => {
  const id = c.req.param("credentialId");

  // Try direct lookup, then search by URN
  let stored = store.credentials.get(id);
  if (!stored) {
    stored = store.credentials.get(`urn:uuid:${id}`);
  }
  if (!stored) {
    for (const cr of store.credentials.values()) {
      if (cr.id === id || cr.id.endsWith(id)) {
        stored = cr;
        break;
      }
    }
  }

  if (!stored) return problemResponse(c, 404, `Credential '${id}' not found.`);
  return c.json(stored.credential);
});

// POST /credentials/status — Update credential status
credentials.post("/status", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { credentialId, status, reason } = body;

  if (!credentialId || !status) {
    return problemResponse(c, 422, "Missing required fields: credentialId, status.");
  }

  if (!["active", "revoked", "suspended"].includes(status)) {
    return problemResponse(c, 422, `Invalid status '${status}'. Must be active, revoked, or suspended.`);
  }

  const stored = store.credentials.get(credentialId);
  if (!stored) return problemResponse(c, 404, `Credential '${credentialId}' not found.`);

  const issuerDid = c.get("issuerDid");
  if (stored.issuerDid !== issuerDid) {
    return problemResponse(c, 403, "Only the issuer can update credential status.");
  }

  stored.status = status;

  return c.json({
    credentialId,
    status,
    reason: reason ?? null,
    updatedAt: new Date().toISOString(),
  });
});

export default credentials;
