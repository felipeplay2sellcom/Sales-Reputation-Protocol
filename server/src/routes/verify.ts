import { Hono } from "hono";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const verify = new Hono();

// POST /verify/credential — Verify a credential
verify.post("/credential", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { credential } = body;
  if (!credential) {
    return problemResponse(c, 422, "Missing required field: credential.");
  }

  const credId = credential.id as string | undefined;
  const issuer = credential.issuer as { id?: string } | string | undefined;
  const issuerDid = typeof issuer === "string" ? issuer : issuer?.id;
  const validUntil = credential.validUntil as string | undefined;

  // Check if credential exists in store (for status check)
  let statusCheck = { passed: true, method: "BitstringStatusList" };
  if (credId) {
    const stored = store.credentials.get(credId);
    if (stored) {
      if (stored.status === "revoked") {
        statusCheck = { passed: false, method: "BitstringStatusList" };
        return c.json({
          verified: false,
          credential: { id: credId, type: credential.type?.[1] ?? "VerifiableCredential", issuer: issuerDid },
          checks: {
            signature: { passed: true },
            status: { passed: false, method: "BitstringStatusList" },
            expiration: { passed: true },
            issuerTrust: { passed: true, level: "self_declared", score: 0.25 },
          },
          errors: [{ code: "CREDENTIAL_REVOKED", message: "Credential has been revoked." }],
          verifiedAt: new Date().toISOString(),
        });
      }
      if (stored.status === "suspended") {
        return c.json({
          verified: false,
          credential: { id: credId, type: credential.type?.[1] ?? "VerifiableCredential", issuer: issuerDid },
          checks: {
            signature: { passed: true },
            status: { passed: false, method: "BitstringStatusList" },
            expiration: { passed: true },
            issuerTrust: { passed: true, level: "self_declared", score: 0.25 },
          },
          errors: [{ code: "CREDENTIAL_SUSPENDED", message: "Credential is suspended." }],
          verifiedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Check expiration
  let expirationCheck = { passed: true, validUntil: validUntil ?? null };
  if (validUntil && new Date(validUntil) < new Date()) {
    expirationCheck = { passed: false, validUntil };
    return c.json({
      verified: false,
      credential: { id: credId, type: credential.type?.[1] ?? "VerifiableCredential", issuer: issuerDid },
      checks: {
        signature: { passed: true },
        status: statusCheck,
        expiration: expirationCheck,
        issuerTrust: { passed: true, level: "self_declared", score: 0.25 },
      },
      errors: [{ code: "CREDENTIAL_EXPIRED", message: "Credential has expired." }],
      verifiedAt: new Date().toISOString(),
    });
  }

  // Check issuer trust
  const storedIssuer = issuerDid ? store.issuers.get(issuerDid) : undefined;
  const trustLevel = storedIssuer?.trustLevel ?? "self_declared";
  const trustScores: Record<string, number> = {
    self_declared: 0.25,
    domain_verified: 0.50,
    platform_verified: 0.85,
    audited: 1.0,
  };

  // In reference impl, signature always passes (no real crypto verification)
  return c.json({
    verified: true,
    credential: {
      id: credId,
      type: credential.type?.[1] ?? "VerifiableCredential",
      issuer: issuerDid,
    },
    checks: {
      signature: { passed: true },
      status: statusCheck,
      expiration: expirationCheck,
      issuerTrust: {
        passed: true,
        level: trustLevel,
        score: trustScores[trustLevel] ?? 0.25,
      },
    },
    verifiedAt: new Date().toISOString(),
  });
});

// POST /verify/presentation — Verify a presentation
verify.post("/presentation", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { presentation } = body;
  if (!presentation) {
    return problemResponse(c, 422, "Missing required field: presentation.");
  }

  const holder = presentation.holder as string | undefined;

  return c.json({
    verified: true,
    presentation: {
      holder,
      credentialCount: (presentation.verifiableCredential as unknown[])?.length ?? 0,
    },
    checks: {
      signature: { passed: true },
      holder: { passed: true },
      credentials: { passed: true, count: (presentation.verifiableCredential as unknown[])?.length ?? 0 },
    },
    verifiedAt: new Date().toISOString(),
  });
});

export default verify;
