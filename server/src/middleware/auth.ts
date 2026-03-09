import type { Context, Next } from "hono";
import { problemResponse } from "./error.js";

/**
 * Simple API key authentication middleware.
 * In production, replace with JWT/DID-based auth.
 *
 * Accepted formats:
 *   Authorization: Bearer <token>
 *   X-API-Key: <key>
 *
 * For the reference implementation, any key starting with "srp_" is valid.
 * The issuer DID is derived from the key or set to a default.
 */

const API_KEYS: Record<string, string> = {
  srp_test_key: "did:web:test-issuer.example.com",
  srp_demo_key: "did:web:demo-company.example.com",
};

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header("Authorization");
  const apiKeyHeader = c.req.header("X-API-Key");

  let apiKey: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.slice(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  if (!apiKey) {
    return problemResponse(c, 401, "Missing authentication. Provide Authorization: Bearer <token> or X-API-Key header.");
  }

  // In reference implementation, accept any srp_ prefixed key
  const issuerDid = API_KEYS[apiKey] ?? (apiKey.startsWith("srp_") ? `did:web:${apiKey.slice(4)}.example.com` : undefined);

  if (!issuerDid) {
    return problemResponse(c, 401, "Invalid API key. Keys must start with 'srp_'.");
  }

  c.set("issuerDid", issuerDid);
  c.set("apiKey", apiKey);

  await next();
}
