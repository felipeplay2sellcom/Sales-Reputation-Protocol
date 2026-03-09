import { Hono } from "hono";
import { calculateScore, getScoreTier } from "sales-reputation-protocol";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const scores = new Hono();

/**
 * Compute a score for an agent based on their credentials and events.
 * In the reference implementation, we use a simplified model.
 */
function computeScore(agentDid: string) {
  const agentCredentials = Array.from(store.credentials.values()).filter(
    (cr) => cr.subjectDid === agentDid && cr.status === "active",
  );
  const agentEvents = Array.from(store.events.values()).filter(
    (e) => e.subjectDid === agentDid,
  );

  // Count events by category
  const categoryCounts: Record<string, number> = {};
  for (const e of agentEvents) {
    categoryCounts[e.category] = (categoryCounts[e.category] ?? 0) + 1;
  }

  // Derive dimension scores from credential/event density (simplified)
  const total = agentCredentials.length + agentEvents.length;
  const base = Math.min(total / 50, 1); // normalize to ~50 items for full score

  const dimensions = {
    performance: Math.min((categoryCounts["performance"] ?? 0) / 10 + base * 0.3, 1),
    reliability: Math.min((categoryCounts["achievement"] ?? 0) / 8 + base * 0.25, 1),
    clientImpact: Math.min((categoryCounts["client_impact"] ?? 0) / 5 + base * 0.2, 1),
    professionalGrowth: Math.min((categoryCounts["development"] ?? 0) / 5 + base * 0.15, 1),
    peerTrust: Math.min((categoryCounts["peer_trust"] ?? 0) / 3 + base * 0.1, 1),
  };

  const scoreValue = calculateScore(dimensions);
  const tier = getScoreTier(scoreValue);
  const now = new Date().toISOString();

  // Store snapshot
  const history = store.scoreHistory.get(agentDid) ?? [];
  history.push({ value: scoreValue, calculatedAt: now });
  store.scoreHistory.set(agentDid, history);

  return {
    subjectDid: agentDid,
    score: {
      value: scoreValue,
      tier,
      range: { min: 300, max: 850 },
    },
    dimensions: {
      performance: {
        normalized: Math.round(dimensions.performance * 100) / 100,
        weight: 0.30,
        contribution: Math.round(dimensions.performance * 0.30 * 1000) / 1000,
        credentialCount: categoryCounts["performance"] ?? 0,
      },
      reliability: {
        normalized: Math.round(dimensions.reliability * 100) / 100,
        weight: 0.25,
        contribution: Math.round(dimensions.reliability * 0.25 * 1000) / 1000,
        credentialCount: categoryCounts["achievement"] ?? 0,
      },
      clientImpact: {
        normalized: Math.round(dimensions.clientImpact * 100) / 100,
        weight: 0.20,
        contribution: Math.round(dimensions.clientImpact * 0.20 * 1000) / 1000,
        credentialCount: categoryCounts["client_impact"] ?? 0,
      },
      professionalGrowth: {
        normalized: Math.round(dimensions.professionalGrowth * 100) / 100,
        weight: 0.15,
        contribution: Math.round(dimensions.professionalGrowth * 0.15 * 1000) / 1000,
        credentialCount: categoryCounts["development"] ?? 0,
      },
      peerTrust: {
        normalized: Math.round(dimensions.peerTrust * 100) / 100,
        weight: 0.10,
        contribution: Math.round(dimensions.peerTrust * 0.10 * 1000) / 1000,
        credentialCount: categoryCounts["peer_trust"] ?? 0,
      },
    },
    calculatedAt: now,
    window: "90d",
    totalCredentials: agentCredentials.length,
  };
}

// GET /scores/:agentDid — Get reputation score
scores.get("/:agentDid", (c) => {
  const agentDid = c.req.param("agentDid");

  if (!agentDid.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid DID format: '${agentDid}'.`);
  }

  const result = computeScore(agentDid);
  return c.json(result);
});

// GET /scores/:agentDid/history — Get score history
scores.get("/:agentDid/history", (c) => {
  const agentDid = c.req.param("agentDid");
  const since = c.req.query("since");
  const limit = Math.min(parseInt(c.req.query("limit") ?? "25", 10), 100);

  if (!agentDid.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid DID format: '${agentDid}'.`);
  }

  let history = store.scoreHistory.get(agentDid) ?? [];

  if (since) {
    const sinceDate = new Date(since);
    history = history.filter((h) => new Date(h.calculatedAt) >= sinceDate);
  }

  history.sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt));
  const page = history.slice(0, limit);

  return c.json({
    subjectDid: agentDid,
    history: page,
  });
});

export default scores;
