/** W3C Verifiable Credentials v2 context URI */
export const VC_CONTEXT_V2 = "https://www.w3.org/ns/credentials/v2";

/** SRP context URI */
export const SRP_CONTEXT_V1 = "https://salesreputationprotocol.org/context/v1";

/** Default contexts for SRP credentials */
export const SRP_CREDENTIAL_CONTEXTS = [VC_CONTEXT_V2, SRP_CONTEXT_V1] as const;

/** Score boundaries */
export const SCORE_MIN = 300;
export const SCORE_MAX = 850;
export const SCORE_RANGE = SCORE_MAX - SCORE_MIN;

/** Score dimension weights */
export const DIMENSION_WEIGHTS = {
  performance: 0.30,
  reliability: 0.25,
  clientImpact: 0.20,
  professionalGrowth: 0.15,
  peerTrust: 0.10,
} as const;

/** EWMA decay factor */
export const EWMA_LAMBDA = 0.15;

/** Primary scoring window in days */
export const SCORING_WINDOW_DAYS = 90;

/** Maximum daily score change */
export const MAX_DAILY_SCORE_CHANGE = 15;

/** Issuer trust level weights */
export const TRUST_LEVEL_WEIGHTS = {
  self_declared: 0.25,
  domain_verified: 0.50,
  platform_verified: 0.85,
  audited: 1.00,
} as const;

/** Velocity limits per event type (per day per subject) */
export const VELOCITY_LIMITS = {
  sale_completed: 50,
  top_performer: 5,
  certification_earned: 5,
  mission_completed: 20,
  ranking_achieved: 5,
  training_completed: 10,
} as const;

/** API defaults */
export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

/** Credential type strings */
export const CREDENTIAL_TYPES = {
  SALES_REPUTATION: "SalesReputationCredential",
  SALES_SCORE: "SalesScoreCredential",
  SALES_ENDORSEMENT: "SalesEndorsementCredential",
} as const;
