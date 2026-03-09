import { Hono } from "hono";
import { calculateScore, getScoreTier } from "sales-reputation-protocol";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const agents = new Hono();

// GET /agents/:agentDid — Get agent public profile
agents.get("/:agentDid", (c) => {
  const did = c.req.param("agentDid");

  if (!did.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid DID format: '${did}'.`);
  }

  const agent = store.agents.get(did);
  if (!agent) return problemResponse(c, 404, `Agent '${did}' not found.`);

  // Compute current score
  const activeCredentials = Array.from(store.credentials.values()).filter(
    (cr) => cr.subjectDid === did && cr.status === "active",
  );
  const total = activeCredentials.length;
  const base = Math.min(total / 50, 1);
  const scoreValue = calculateScore({
    performance: base * 0.85,
    reliability: base * 0.78,
    clientImpact: base * 0.72,
    professionalGrowth: base * 0.65,
    peerTrust: base * 0.60,
  });

  return c.json({
    did: agent.did,
    displayName: agent.displayName,
    industries: agent.industries,
    score: {
      value: scoreValue,
      tier: getScoreTier(scoreValue),
    },
    credentialCount: agent.credentialCount,
    memberSince: agent.memberSince,
  });
});

// GET /agents/:agentDid/credentials — List agent's credentials
agents.get("/:agentDid/credentials", (c) => {
  const did = c.req.param("agentDid");
  const limit = Math.min(parseInt(c.req.query("limit") ?? "25", 10), 100);
  const cursor = c.req.query("cursor");

  if (!did.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid DID format: '${did}'.`);
  }

  let results = Array.from(store.credentials.values()).filter(
    (cr) => cr.subjectDid === did && cr.status === "active",
  );

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

export default agents;
