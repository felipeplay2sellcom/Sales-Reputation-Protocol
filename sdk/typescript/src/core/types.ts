// ── Event Types ──────────────────────────────────────────────

export const EVENT_TYPES = [
  "sale_completed",
  "top_performer",
  "certification_earned",
  "mission_completed",
  "ranking_achieved",
  "training_completed",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_CATEGORIES = [
  "performance",
  "recognition",
  "development",
  "achievement",
  "client_impact",
  "peer_trust",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_STATUSES = [
  "submitted",
  "validated",
  "active",
  "expired",
  "rejected",
  "revoked",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const INDUSTRIES = [
  "saas",
  "real_estate",
  "insurance",
  "financial_services",
  "automotive",
  "retail",
  "healthcare",
  "manufacturing",
  "telecommunications",
  "hospitality",
  "education",
  "other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

// ── Evidence ─────────────────────────────────────────────────

export const EVIDENCE_TYPES = [
  "CRMRecord",
  "PaymentConfirmation",
  "PlatformRecord",
  "TrainingRecord",
  "ThirdPartyAttestation",
  "ClientTestimonial",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface Evidence {
  type: EvidenceType;
  source?: string;
  ref?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

// ── Event Data ───────────────────────────────────────────────

export interface SaleCompletedData {
  dealValue?: number;
  currency?: string;
  productCategory?: string;
  dealType?: "new_business" | "expansion" | "renewal" | "upsell";
  salesCycle?: {
    startedAt?: string;
    closedAt?: string;
    durationDays?: number;
  };
  quotaContribution?: number;
}

export interface TopPerformerData {
  period?: string;
  rank?: number;
  totalParticipants?: number;
  percentile?: number;
  metric?: string;
  scope?: "team" | "office" | "regional" | "national" | "global";
}

export interface CertificationEarnedData {
  certificationName?: string;
  certificationId?: string;
  provider?: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  validUntil?: string;
  score?: number;
  maxScore?: number;
}

export interface MissionCompletedData {
  missionName?: string;
  missionType?: string;
  target?: number;
  achieved?: number;
  currency?: string;
  completionRate?: number;
  difficulty?: "easy" | "medium" | "hard" | "extreme";
}

export interface RankingAchievedData {
  rankingName?: string;
  position?: number;
  totalParticipants?: number;
  percentile?: number;
  category?: string;
  period?: string;
}

export interface TrainingCompletedData {
  courseName?: string;
  provider?: string;
  hoursCompleted?: number;
  format?: "online" | "in_person" | "hybrid";
  assessmentPassed?: boolean;
  skills?: string[];
}

export type EventData =
  | SaleCompletedData
  | TopPerformerData
  | CertificationEarnedData
  | MissionCompletedData
  | RankingAchievedData
  | TrainingCompletedData;

// ── Sales Event ──────────────────────────────────────────────

export interface SalesEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  issuerDid: string;
  subjectDid: string;
  occurredAt: string;
  recordedAt: string;
  status?: EventStatus;
  industry?: Industry;
  data?: EventData;
  evidence?: Evidence[];
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}

export interface EventInput {
  type: EventType;
  category: EventCategory;
  subjectDid: string;
  occurredAt: string;
  industry?: Industry;
  data?: EventData;
  evidence?: Evidence[];
  metadata?: Record<string, unknown>;
}

// ── Credentials ──────────────────────────────────────────────

export interface Issuer {
  id: string;
  type?: string;
  name?: string;
  industry?: string;
}

export interface Achievement {
  type: "SalesAchievement";
  name: string;
  description?: string;
  criteria?: { narrative: string };
  salesCategory?: string;
  industry?: string;
  image?: { id: string; type: "Image" };
}

export interface SalesAchievementSubject {
  id: string;
  type: "SalesAchievementSubject";
  achievement: Achievement;
  evidence?: Evidence[];
}

export interface ScoreDimensions {
  performance: number;
  reliability: number;
  clientImpact: number;
  professionalGrowth: number;
  peerTrust: number;
}

export interface ScoreData {
  value: number;
  range: { min: 300; max: 850 };
  tier: ScoreTier;
  calculatedAt: string;
  dimensions: ScoreDimensions;
  credentialCount: number;
  window: string;
}

export interface SalesScoreSubject {
  id: string;
  type: "SalesScoreSubject";
  score: ScoreData;
}

export interface EndorsementData {
  type: "SkillEndorsement";
  skills: string[];
  relationship: "direct_manager" | "peer" | "client" | "mentor" | "other";
  duration?: string;
  narrative?: string;
}

export interface SalesEndorsementSubject {
  id: string;
  type: "SalesEndorsementSubject";
  endorsement: EndorsementData;
}

export type CredentialSubject =
  | SalesAchievementSubject
  | SalesScoreSubject
  | SalesEndorsementSubject;

export interface CredentialStatus {
  id: string;
  type: "BitstringStatusListEntry";
  statusPurpose: "revocation" | "suspension";
  statusListIndex: string;
  statusListCredential: string;
}

export interface Proof {
  type: string;
  cryptosuite?: string;
  created: string;
  verificationMethod: string;
  proofPurpose: "assertionMethod" | "authentication";
  proofValue: string;
  challenge?: string;
  domain?: string;
}

export interface VerifiableCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string | Issuer;
  validFrom: string;
  validUntil?: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: CredentialStatus;
  proof?: Proof | Proof[];
}

export interface VerifiablePresentation {
  "@context": string[];
  type: "VerifiablePresentation";
  holder: string;
  verifiableCredential: VerifiableCredential[];
  proof?: Proof;
}

// ── Score ─────────────────────────────────────────────────────

export const SCORE_TIERS = [
  "poor",
  "below_average",
  "good",
  "very_good",
  "exceptional",
] as const;

export type ScoreTier = (typeof SCORE_TIERS)[number];

export interface DimensionBreakdown {
  normalized: number;
  weight: number;
  contribution: number;
  credentialCount: number;
}

export interface ScoreResponse {
  subjectDid: string;
  score: {
    value: number;
    tier: ScoreTier;
    range: { min: number; max: number };
  };
  dimensions: {
    performance: DimensionBreakdown;
    reliability: DimensionBreakdown;
    clientImpact: DimensionBreakdown;
    professionalGrowth: DimensionBreakdown;
    peerTrust: DimensionBreakdown;
  };
  calculatedAt: string;
  window: string;
  totalCredentials: number;
  history?: Array<{ value: number; calculatedAt: string }>;
}

// ── Verification ─────────────────────────────────────────────

export interface VerificationCheck {
  passed: boolean;
  [key: string]: unknown;
}

export interface VerificationResult {
  verified: boolean;
  credential: {
    id: string;
    type: string;
    issuer: string;
  };
  checks: {
    signature: VerificationCheck;
    status: VerificationCheck;
    expiration: VerificationCheck;
    issuerTrust: VerificationCheck;
    onChainAnchor?: VerificationCheck;
  };
  verifiedAt: string;
}

// ── Issuer Registry ──────────────────────────────────────────

export const TRUST_LEVELS = [
  "self_declared",
  "domain_verified",
  "platform_verified",
  "audited",
] as const;

export type TrustLevel = (typeof TRUST_LEVELS)[number];

export interface RegisteredIssuer {
  did: string;
  name: string;
  website?: string;
  industry?: string;
  trustLevel: TrustLevel;
  registeredAt: string;
  credentialsIssued: number;
}

// ── API ──────────────────────────────────────────────────────

export interface Pagination {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

// ── Webhooks ─────────────────────────────────────────────────

export const WEBHOOK_EVENT_TYPES = [
  "credential.issued",
  "credential.revoked",
  "credential.suspended",
  "score.updated",
  "event.submitted",
  "event.validated",
  "issuer.registered",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}
