import { Hono } from "hono";
import { store } from "../store/memory.js";
import { problemResponse } from "../middleware/error.js";

const presentations = new Hono();

// POST /presentations/create — Create a verifiable presentation
presentations.post("/create", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return problemResponse(c, 400, "Invalid JSON in request body.");

  const { holderDid, credentialIds, selectiveDisclosure, challenge } = body;

  if (!holderDid || !credentialIds || !Array.isArray(credentialIds) || credentialIds.length === 0) {
    return problemResponse(c, 422, "Missing required fields: holderDid, credentialIds (non-empty array).");
  }

  // Gather credentials
  const credentials: Record<string, unknown>[] = [];
  for (const id of credentialIds as string[]) {
    const stored = store.credentials.get(id);
    if (!stored) return problemResponse(c, 404, `Credential '${id}' not found.`);
    if (stored.subjectDid !== holderDid) {
      return problemResponse(c, 403, `Credential '${id}' does not belong to holder '${holderDid}'.`);
    }
    if (stored.status !== "active") {
      return problemResponse(c, 422, `Credential '${id}' is ${stored.status} and cannot be presented.`);
    }

    let cred = { ...stored.credential };

    // Apply selective disclosure if specified
    if (selectiveDisclosure && selectiveDisclosure[id]) {
      const allowedPaths = selectiveDisclosure[id] as string[];
      cred = filterCredential(cred, allowedPaths);
    }

    credentials.push(cred);
  }

  const now = new Date().toISOString();

  const presentation = {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: "VerifiablePresentation",
    holder: holderDid,
    verifiableCredential: credentials,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "ecdsa-rdfc-2022",
      created: now,
      verificationMethod: `${holderDid}#key-1`,
      proofPurpose: "authentication",
      ...(challenge ? { challenge } : {}),
      proofValue: `z${Buffer.from(crypto.randomUUID()).toString("base64url")}`,
    },
  };

  return c.json(presentation, 201);
});

/**
 * Filter credential to only include specified paths.
 * Simplified selective disclosure for reference implementation.
 */
function filterCredential(
  cred: Record<string, unknown>,
  allowedPaths: string[],
): Record<string, unknown> {
  // Keep @context, type, id, issuer, validFrom, proof — always
  const result: Record<string, unknown> = {
    "@context": cred["@context"],
    type: cred["type"],
    id: cred["id"],
    issuer: cred["issuer"],
    validFrom: cred["validFrom"],
  };

  // Build filtered credentialSubject
  const subject = cred["credentialSubject"] as Record<string, unknown> | undefined;
  if (subject) {
    const filtered: Record<string, unknown> = { id: subject["id"], type: subject["type"] };

    for (const path of allowedPaths) {
      const parts = path.replace("credentialSubject.", "").split(".");
      let source: unknown = subject;
      let target: Record<string, unknown> = filtered;

      for (let i = 0; i < parts.length; i++) {
        const key = parts[i];
        if (source == null || typeof source !== "object") break;
        const val = (source as Record<string, unknown>)[key];

        if (i === parts.length - 1) {
          target[key] = val;
        } else {
          if (!(key in target)) target[key] = {};
          target = target[key] as Record<string, unknown>;
          source = val;
        }
      }
    }

    result["credentialSubject"] = filtered;
  }

  result["proof"] = cred["proof"];
  return result;
}

export default presentations;
