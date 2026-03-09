import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const VALID_WEBHOOK_EVENTS = [
  "credential.issued", "credential.revoked", "credential.suspended",
  "score.updated", "event.submitted", "event.validated", "issuer.registered",
];

const webhooks = new Hono<AppEnv>();

// POST /webhooks — Register webhook
webhooks.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { url, events, secret } = body;

  if (!url || !events || !Array.isArray(events) || events.length === 0 || !secret) {
    return problemResponse(c, 422, "Missing required fields: url, events (non-empty array), secret.");
  }

  for (const evt of events as string[]) {
    if (!VALID_WEBHOOK_EVENTS.includes(evt)) {
      return problemResponse(c, 422, `Invalid webhook event '${evt}'. Valid: ${VALID_WEBHOOK_EVENTS.join(", ")}.`);
    }
  }

  const ownerDid = c.get("issuerDid");
  const id = `webhook-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const webhook = {
    id,
    url,
    events,
    secret,
    active: true,
    ownerDid,
    createdAt: now,
  };

  store.webhooks.set(id, webhook);

  // Don't return the secret
  return c.json({
    id,
    url,
    events,
    active: true,
    createdAt: now,
  }, 201);
});

// GET /webhooks — List webhooks
webhooks.get("/", (c) => {
  const ownerDid = c.get("issuerDid");

  const results = Array.from(store.webhooks.values())
    .filter((w) => w.ownerDid === ownerDid)
    .map(({ secret: _s, ownerDid: _o, ...rest }) => rest);

  return c.json({ data: results });
});

// DELETE /webhooks/:webhookId — Delete webhook
webhooks.delete("/:webhookId", (c) => {
  const id = c.req.param("webhookId");
  const webhook = store.webhooks.get(id);

  if (!webhook) return problemResponse(c, 404, `Webhook '${id}' not found.`);

  const ownerDid = c.get("issuerDid");
  if (webhook.ownerDid !== ownerDid) {
    return problemResponse(c, 403, "You can only delete your own webhooks.");
  }

  store.webhooks.delete(id);
  return c.body(null, 204);
});

export default webhooks;
