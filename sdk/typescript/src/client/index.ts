import type {
  EventInput,
  SalesEvent,
  VerifiableCredential,
  VerificationResult,
  ScoreResponse,
  RegisteredIssuer,
  PaginatedResponse,
  ProblemDetail,
} from "../core/types.js";
import { DEFAULT_PAGE_LIMIT } from "../core/constants.js";

// ── Client Configuration ─────────────────────────────────────

export interface SRPClientConfig {
  /** Base URL of the SRP API (e.g., "https://api.example.com/v1") */
  baseUrl: string;
  /** API key for authentication */
  apiKey?: string;
  /** Bearer token for authentication */
  bearerToken?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom fetch implementation (default: global fetch) */
  fetch?: typeof fetch;
}

// ── API Error ────────────────────────────────────────────────

export class SRPApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail
  ) {
    super(problem.detail ?? problem.title);
    this.name = "SRPApiError";
  }
}

// ── Client ───────────────────────────────────────────────────

export class SRPClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeout: number;
  private readonly _fetch: typeof fetch;

  public readonly events: EventsAPI;
  public readonly credentials: CredentialsAPI;
  public readonly verify: VerifyAPI;
  public readonly scores: ScoresAPI;
  public readonly issuers: IssuersAPI;

  constructor(config: SRPClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeout = config.timeout ?? 30_000;
    this._fetch = config.fetch ?? globalThis.fetch;

    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (config.apiKey) {
      this.headers["X-API-Key"] = config.apiKey;
    } else if (config.bearerToken) {
      this.headers["Authorization"] = `Bearer ${config.bearerToken}`;
    }

    this.events = new EventsAPI(this);
    this.credentials = new CredentialsAPI(this);
    this.verify = new VerifyAPI(this);
    this.scores = new ScoresAPI(this);
    this.issuers = new IssuersAPI(this);
  }

  /** @internal */
  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this._fetch(url.toString(), {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const problem = (await response.json()) as ProblemDetail;
        throw new SRPApiError(response.status, problem);
      }

      if (response.status === 204) return undefined as T;

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ── Events API ───────────────────────────────────────────────

class EventsAPI {
  constructor(private readonly client: SRPClient) {}

  async create(input: EventInput): Promise<SalesEvent> {
    return this.client.request<SalesEvent>("POST", "/v1/events", input);
  }

  async get(eventId: string): Promise<SalesEvent> {
    return this.client.request<SalesEvent>("GET", `/v1/events/${eventId}`);
  }

  async list(params?: {
    subjectDid?: string;
    type?: string;
    status?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<SalesEvent>> {
    return this.client.request<PaginatedResponse<SalesEvent>>(
      "GET",
      "/v1/events",
      undefined,
      { limit: DEFAULT_PAGE_LIMIT, ...params }
    );
  }
}

// ── Credentials API ──────────────────────────────────────────

class CredentialsAPI {
  constructor(private readonly client: SRPClient) {}

  async issue(params: {
    subjectDid: string;
    achievementName: string;
    achievementDescription: string;
    salesCategory: string;
    criteria?: string;
    industry?: string;
    evidence?: Array<Record<string, unknown>>;
    validUntil?: string;
  }): Promise<VerifiableCredential> {
    return this.client.request<VerifiableCredential>(
      "POST",
      "/v1/credentials/issue",
      params
    );
  }

  async get(credentialId: string): Promise<VerifiableCredential> {
    return this.client.request<VerifiableCredential>(
      "GET",
      `/v1/credentials/${credentialId}`
    );
  }

  async list(params?: {
    subjectDid?: string;
    issuerDid?: string;
    type?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<VerifiableCredential>> {
    return this.client.request<PaginatedResponse<VerifiableCredential>>(
      "GET",
      "/v1/credentials",
      undefined,
      { limit: DEFAULT_PAGE_LIMIT, ...params }
    );
  }

  async updateStatus(params: {
    credentialId: string;
    status: "revoked" | "suspended" | "active";
    reason: string;
  }): Promise<void> {
    await this.client.request("POST", "/v1/credentials/status", params);
  }
}

// ── Verify API ───────────────────────────────────────────────

class VerifyAPI {
  constructor(private readonly client: SRPClient) {}

  async credential(
    credential: VerifiableCredential
  ): Promise<VerificationResult> {
    return this.client.request<VerificationResult>(
      "POST",
      "/v1/verify/credential",
      { credential }
    );
  }

  async presentation(
    presentation: unknown,
    challenge?: string
  ): Promise<VerificationResult> {
    return this.client.request<VerificationResult>(
      "POST",
      "/v1/verify/presentation",
      { presentation, challenge }
    );
  }
}

// ── Scores API ───────────────────────────────────────────────

class ScoresAPI {
  constructor(private readonly client: SRPClient) {}

  async get(agentDid: string): Promise<ScoreResponse> {
    return this.client.request<ScoreResponse>(
      "GET",
      `/v1/scores/${encodeURIComponent(agentDid)}`
    );
  }

  async history(
    agentDid: string,
    params?: { since?: string; limit?: number }
  ): Promise<{ subjectDid: string; history: Array<{ value: number; calculatedAt: string }> }> {
    return this.client.request(
      "GET",
      `/v1/scores/${encodeURIComponent(agentDid)}/history`,
      undefined,
      params
    );
  }
}

// ── Issuers API ──────────────────────────────────────────────

class IssuersAPI {
  constructor(private readonly client: SRPClient) {}

  async register(params: {
    did: string;
    name: string;
    website?: string;
    industry?: string;
    description?: string;
    crmIntegrations?: string[];
  }): Promise<RegisteredIssuer> {
    return this.client.request<RegisteredIssuer>(
      "POST",
      "/v1/issuers",
      params
    );
  }

  async get(issuerDid: string): Promise<RegisteredIssuer> {
    return this.client.request<RegisteredIssuer>(
      "GET",
      `/v1/issuers/${encodeURIComponent(issuerDid)}`
    );
  }

  async list(params?: {
    trustLevel?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PaginatedResponse<RegisteredIssuer>> {
    return this.client.request<PaginatedResponse<RegisteredIssuer>>(
      "GET",
      "/v1/issuers",
      undefined,
      { limit: DEFAULT_PAGE_LIMIT, ...params }
    );
  }
}
