import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth.js";
import { problemResponse } from "./middleware/error.js";
import events from "./routes/events.js";
import credentials from "./routes/credentials.js";
import verify from "./routes/verify.js";
import scores from "./routes/scores.js";
import issuers from "./routes/issuers.js";
import agents from "./routes/agents.js";
import presentations from "./routes/presentations.js";
import webhooks from "./routes/webhooks.js";

const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", logger());

// Health check (no auth)
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

// API info (no auth)
app.get("/v1", (c) =>
  c.json({
    name: "Sales Reputation Protocol API",
    version: "0.1.0",
    spec: "https://salesreputationprotocol.org",
    docs: "https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol/blob/main/api/openapi.yaml",
    endpoints: {
      events: "/v1/events",
      credentials: "/v1/credentials",
      verify: "/v1/verify",
      scores: "/v1/scores",
      issuers: "/v1/issuers",
      agents: "/v1/agents",
      presentations: "/v1/presentations",
      webhooks: "/v1/webhooks",
    },
  }),
);

// Apply auth to all /v1/* routes
const api = new Hono();
api.use("*", authMiddleware);

// Mount routes
api.route("/events", events);
api.route("/credentials", credentials);
api.route("/verify", verify);
api.route("/scores", scores);
api.route("/issuers", issuers);
api.route("/agents", agents);
api.route("/presentations", presentations);
api.route("/webhooks", webhooks);

app.route("/v1", api);

// 404 fallback
app.notFound((c) => problemResponse(c, 404, `Route '${c.req.method} ${c.req.path}' not found.`));

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return problemResponse(c, 500, "Internal server error.");
});

// Export for testing
export default app;

// Start server
const port = parseInt(process.env.PORT ?? "3000", 10);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`
  ┌─────────────────────────────────────────────┐
  │  Sales Reputation Protocol — Reference API  │
  │  Version: 0.1.0                             │
  │  Running: http://localhost:${info.port}              │
  │                                             │
  │  Try: curl http://localhost:${info.port}/v1          │
  └─────────────────────────────────────────────┘
  `);
});
