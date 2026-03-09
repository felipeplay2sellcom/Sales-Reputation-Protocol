// Sales Reputation Protocol - TypeScript SDK
// https://github.com/felipeplay2sellcom/Sales-Reputation-Protocol

export { SRPClient, SRPApiError } from "./client/index.js";
export type { SRPClientConfig } from "./client/index.js";

export {
  calculateScore,
  getScoreTier,
  wilsonScore,
  ewma,
  applyDailyCap,
  normalize,
  timeDecayWeight,
} from "./core/scoring.js";

export {
  buildAchievementCredential,
  buildScoreCredential,
  buildEndorsementCredential,
  generateCredentialId,
} from "./core/credentials.js";

export {
  verifyWebhookSignature,
  parseWebhookEvent,
} from "./webhooks/index.js";

export * from "./core/types.js";
export * from "./core/constants.js";
