import type { WebhookEvent } from "../core/types.js";

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * @param payload - The raw request body (string)
 * @param signature - The value of the X-Signature-256 header
 * @param secret - Your webhook secret
 * @returns true if the signature is valid
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedSignature = `sha256=${bufferToHex(sig)}`;

  return timingSafeEqual(expectedSignature, signature);
}

/**
 * Parse a webhook event from a request body.
 *
 * @param body - The raw request body (string or object)
 * @returns Parsed WebhookEvent
 */
export function parseWebhookEvent(body: string | Record<string, unknown>): WebhookEvent {
  const parsed = typeof body === "string" ? JSON.parse(body) : body;

  if (!parsed.id || !parsed.type || !parsed.timestamp) {
    throw new Error("Invalid webhook event: missing required fields (id, type, timestamp)");
  }

  return parsed as WebhookEvent;
}

// ── Helpers ──────────────────────────────────────────────────

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
