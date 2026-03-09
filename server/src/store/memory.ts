/**
 * In-memory store for the reference implementation.
 * Replace with a real database in production.
 */

export interface StoredEvent {
  id: string;
  type: string;
  category: string;
  issuerDid: string;
  subjectDid: string;
  occurredAt: string;
  recordedAt: string;
  status: string;
  industry?: string;
  data?: Record<string, unknown>;
  evidence?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

export interface StoredCredential {
  id: string;
  credential: Record<string, unknown>;
  issuerDid: string;
  subjectDid: string;
  status: "active" | "revoked" | "suspended";
  issuedAt: string;
}

export interface StoredIssuer {
  did: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  trustLevel: string;
  registeredAt: string;
  credentialsIssued: number;
}

export interface StoredAgent {
  did: string;
  displayName?: string;
  industries: string[];
  credentialCount: number;
  memberSince: string;
}

export interface StoredWebhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  ownerDid: string;
  createdAt: string;
}

export interface ScoreSnapshot {
  value: number;
  calculatedAt: string;
}

class MemoryStore {
  events = new Map<string, StoredEvent>();
  credentials = new Map<string, StoredCredential>();
  issuers = new Map<string, StoredIssuer>();
  agents = new Map<string, StoredAgent>();
  webhooks = new Map<string, StoredWebhook>();
  scoreHistory = new Map<string, ScoreSnapshot[]>();

  clear(): void {
    this.events.clear();
    this.credentials.clear();
    this.issuers.clear();
    this.agents.clear();
    this.webhooks.clear();
    this.scoreHistory.clear();
  }
}

export const store = new MemoryStore();
