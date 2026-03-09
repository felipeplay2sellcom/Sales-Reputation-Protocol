import { SRP_CREDENTIAL_CONTEXTS, CREDENTIAL_TYPES } from "./constants.js";
import type {
  Achievement,
  VerifiableCredential,
  Issuer,
  Evidence,
  CredentialStatus,
} from "./types.js";

/**
 * Build a SalesReputationCredential (unsigned).
 *
 * This creates the credential structure without a proof.
 * Signing must be done by the issuer using their DID key.
 */
export function buildAchievementCredential(params: {
  id: string;
  issuer: string | Issuer;
  subjectDid: string;
  achievement: Achievement;
  evidence?: Evidence[];
  validFrom?: string;
  validUntil?: string;
  credentialStatus?: CredentialStatus;
}): VerifiableCredential {
  const now = new Date().toISOString();

  return {
    "@context": [...SRP_CREDENTIAL_CONTEXTS],
    id: params.id,
    type: ["VerifiableCredential", CREDENTIAL_TYPES.SALES_REPUTATION],
    issuer: params.issuer,
    validFrom: params.validFrom ?? now,
    ...(params.validUntil && { validUntil: params.validUntil }),
    credentialSubject: {
      id: params.subjectDid,
      type: "SalesAchievementSubject",
      achievement: params.achievement,
      ...(params.evidence && { evidence: params.evidence }),
    },
    ...(params.credentialStatus && {
      credentialStatus: params.credentialStatus,
    }),
  };
}

/**
 * Build a SalesScoreCredential (unsigned).
 */
export function buildScoreCredential(params: {
  id: string;
  issuer: string | Issuer;
  subjectDid: string;
  score: {
    value: number;
    dimensions: {
      performance: number;
      reliability: number;
      clientImpact: number;
      professionalGrowth: number;
      peerTrust: number;
    };
    credentialCount: number;
    window?: string;
  };
  validFrom?: string;
  validUntil?: string;
}): VerifiableCredential {
  const now = new Date().toISOString();
  const { getScoreTier } = await_import();

  return {
    "@context": [...SRP_CREDENTIAL_CONTEXTS],
    id: params.id,
    type: ["VerifiableCredential", CREDENTIAL_TYPES.SALES_SCORE],
    issuer: params.issuer,
    validFrom: params.validFrom ?? now,
    ...(params.validUntil && { validUntil: params.validUntil }),
    credentialSubject: {
      id: params.subjectDid,
      type: "SalesScoreSubject",
      score: {
        value: params.score.value,
        range: { min: 300, max: 850 },
        tier: getScoreTier(params.score.value),
        calculatedAt: now,
        dimensions: params.score.dimensions,
        credentialCount: params.score.credentialCount,
        window: params.score.window ?? "90d",
      },
    },
  };
}

/**
 * Build a SalesEndorsementCredential (unsigned).
 */
export function buildEndorsementCredential(params: {
  id: string;
  issuer: string | Issuer;
  subjectDid: string;
  skills: string[];
  relationship: "direct_manager" | "peer" | "client" | "mentor" | "other";
  narrative?: string;
  duration?: string;
  validFrom?: string;
}): VerifiableCredential {
  const now = new Date().toISOString();

  return {
    "@context": [...SRP_CREDENTIAL_CONTEXTS],
    id: params.id,
    type: ["VerifiableCredential", CREDENTIAL_TYPES.SALES_ENDORSEMENT],
    issuer: params.issuer,
    validFrom: params.validFrom ?? now,
    credentialSubject: {
      id: params.subjectDid,
      type: "SalesEndorsementSubject",
      endorsement: {
        type: "SkillEndorsement",
        skills: params.skills,
        relationship: params.relationship,
        ...(params.duration && { duration: params.duration }),
        ...(params.narrative && { narrative: params.narrative }),
      },
    },
  };
}

/**
 * Generate a URN UUID for credential IDs.
 */
export function generateCredentialId(): string {
  return `urn:uuid:${crypto.randomUUID()}`;
}

// Helper to avoid circular imports
function await_import() {
  // Inline the tier logic to avoid circular dependency
  return {
    getScoreTier(score: number) {
      if (score < 500) return "poor" as const;
      if (score < 650) return "below_average" as const;
      if (score < 720) return "good" as const;
      if (score < 780) return "very_good" as const;
      return "exceptional" as const;
    },
  };
}
