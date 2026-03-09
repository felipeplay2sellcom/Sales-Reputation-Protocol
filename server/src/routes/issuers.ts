import { Hono } from "hono";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const issuers = new Hono();

// POST /issuers — Register issuer
issuers.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { did, name, website, industry, description } = body;

  if (!did || !name) {
    return problemResponse(c, 422, "Missing required fields: did, name.");
  }

  if (!did.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid DID format: '${did}'.`);
  }

  if (store.issuers.has(did)) {
    return problemResponse(c, 409, `Issuer '${did}' is already registered.`);
  }

  const issuer = {
    did,
    name,
    website,
    industry,
    description,
    trustLevel: did.startsWith("did:web:") ? "domain_verified" : "self_declared",
    registeredAt: new Date().toISOString(),
    credentialsIssued: 0,
  };

  store.issuers.set(did, issuer);

  return c.json(issuer, 201);
});

// GET /issuers — List issuers
issuers.get("/", (c) => {
  const trustLevel = c.req.query("trustLevel");
  const limit = Math.min(parseInt(c.req.query("limit") ?? "25", 10), 100);
  const cursor = c.req.query("cursor");

  let results = Array.from(store.issuers.values());

  if (trustLevel) results = results.filter((i) => i.trustLevel === trustLevel);

  results.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

  let startIndex = 0;
  if (cursor) {
    const idx = results.findIndex((i) => i.did === cursor);
    if (idx >= 0) startIndex = idx + 1;
  }

  const page = results.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < results.length;

  return c.json({
    data: page,
    pagination: {
      cursor: hasMore ? page[page.length - 1]?.did ?? null : null,
      hasMore,
      limit,
    },
  });
});

// GET /issuers/:issuerDid — Get issuer details
issuers.get("/:issuerDid", (c) => {
  const did = c.req.param("issuerDid");
  const issuer = store.issuers.get(did);
  if (!issuer) return problemResponse(c, 404, `Issuer '${did}' not found.`);
  return c.json(issuer);
});

export default issuers;
