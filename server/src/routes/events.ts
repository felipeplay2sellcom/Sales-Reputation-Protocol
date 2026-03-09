import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const VALID_EVENT_TYPES = [
  "sale_completed", "top_performer", "certification_earned",
  "mission_completed", "ranking_achieved", "training_completed",
];

const VALID_CATEGORIES = [
  "performance", "recognition", "development",
  "achievement", "client_impact", "peer_trust",
];

const events = new Hono<AppEnv>();

// POST /events — Submit a sales event
events.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { type, category, subjectDid, occurredAt, industry, data, evidence, metadata } = body;

  if (!type || !category || !subjectDid || !occurredAt) {
    return problemResponse(c, 422, "Missing required fields: type, category, subjectDid, occurredAt.");
  }

  if (!VALID_EVENT_TYPES.includes(type)) {
    return problemResponse(c, 422, `Invalid event type '${type}'. Must be one of: ${VALID_EVENT_TYPES.join(", ")}.`);
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return problemResponse(c, 422, `Invalid category '${category}'. Must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  if (!subjectDid.startsWith("did:")) {
    return problemResponse(c, 422, `Invalid subjectDid '${subjectDid}'. Must be a valid DID.`);
  }

  const eventDate = new Date(occurredAt);
  if (isNaN(eventDate.getTime())) {
    return problemResponse(c, 422, "Invalid occurredAt. Must be ISO 8601 format.");
  }

  if (eventDate > new Date()) {
    return problemResponse(c, 422, "occurredAt cannot be in the future.");
  }

  const issuerDid = c.get("issuerDid");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const event = {
    id,
    type,
    category,
    issuerDid,
    subjectDid,
    occurredAt,
    recordedAt: now,
    status: "submitted",
    industry,
    data,
    evidence,
    metadata,
  };

  store.events.set(id, event);

  // Ensure agent exists
  if (!store.agents.has(subjectDid)) {
    store.agents.set(subjectDid, {
      did: subjectDid,
      industries: industry ? [industry] : [],
      credentialCount: 0,
      memberSince: now,
    });
  }

  return c.json(event, 201);
});

// GET /events — List events
events.get("/", (c) => {
  const subjectDid = c.req.query("subjectDid");
  const type = c.req.query("type");
  const status = c.req.query("status");
  const limit = Math.min(parseInt(c.req.query("limit") ?? "25", 10), 100);
  const cursor = c.req.query("cursor");

  let results = Array.from(store.events.values());

  if (subjectDid) results = results.filter((e) => e.subjectDid === subjectDid);
  if (type) results = results.filter((e) => e.type === type);
  if (status) results = results.filter((e) => e.status === status);

  // Sort by recordedAt descending
  results.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  // Cursor-based pagination
  let startIndex = 0;
  if (cursor) {
    const idx = results.findIndex((e) => e.id === cursor);
    if (idx >= 0) startIndex = idx + 1;
  }

  const page = results.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < results.length;

  return c.json({
    data: page,
    pagination: {
      cursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      hasMore,
      limit,
    },
  });
});

// GET /events/:eventId — Get event details
events.get("/:eventId", (c) => {
  const event = store.events.get(c.req.param("eventId"));
  if (!event) return problemResponse(c, 404, `Event '${c.req.param("eventId")}' not found.`);
  return c.json(event);
});

export default events;
