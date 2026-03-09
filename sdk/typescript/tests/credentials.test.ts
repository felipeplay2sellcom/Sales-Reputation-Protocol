import { describe, it, expect } from "vitest";
import {
  buildAchievementCredential,
  buildScoreCredential,
  buildEndorsementCredential,
  generateCredentialId,
} from "../src/core/credentials.js";
import { VC_CONTEXT_V2, SRP_CONTEXT_V1 } from "../src/core/constants.js";

describe("buildAchievementCredential", () => {
  it("creates a valid credential structure", () => {
    const credential = buildAchievementCredential({
      id: "urn:uuid:test-123",
      issuer: { id: "did:web:example.com", name: "Test Corp" },
      subjectDid: "did:key:z6Mktest123",
      achievement: {
        type: "SalesAchievement",
        name: "Century Club",
        description: "Closed 100+ deals",
        criteria: { narrative: "Close 100 CRM-verified deals" },
        salesCategory: "deal_milestone",
      },
    });

    expect(credential["@context"]).toContain(VC_CONTEXT_V2);
    expect(credential["@context"]).toContain(SRP_CONTEXT_V1);
    expect(credential.type).toContain("VerifiableCredential");
    expect(credential.type).toContain("SalesReputationCredential");
    expect(credential.id).toBe("urn:uuid:test-123");
    expect(credential.credentialSubject.id).toBe("did:key:z6Mktest123");
    expect(credential.credentialSubject.type).toBe("SalesAchievementSubject");
  });

  it("accepts string issuer", () => {
    const credential = buildAchievementCredential({
      id: "urn:uuid:test-456",
      issuer: "did:web:example.com",
      subjectDid: "did:key:z6Mktest456",
      achievement: {
        type: "SalesAchievement",
        name: "First Sale",
      },
    });

    expect(credential.issuer).toBe("did:web:example.com");
  });

  it("includes evidence when provided", () => {
    const credential = buildAchievementCredential({
      id: "urn:uuid:test-789",
      issuer: "did:web:example.com",
      subjectDid: "did:key:z6Mktest789",
      achievement: {
        type: "SalesAchievement",
        name: "Test",
      },
      evidence: [{ type: "CRMRecord", source: "salesforce" }],
    });

    expect(credential.credentialSubject).toHaveProperty("evidence");
    const subject = credential.credentialSubject as { evidence: unknown[] };
    expect(subject.evidence).toHaveLength(1);
  });
});

describe("buildScoreCredential", () => {
  it("creates a valid score credential", () => {
    const credential = buildScoreCredential({
      id: "urn:uuid:score-123",
      issuer: "did:web:srp.org",
      subjectDid: "did:key:z6Mktest123",
      score: {
        value: 742,
        dimensions: {
          performance: 0.85,
          reliability: 0.78,
          clientImpact: 0.72,
          professionalGrowth: 0.65,
          peerTrust: 0.60,
        },
        credentialCount: 47,
      },
    });

    expect(credential.type).toContain("SalesScoreCredential");
    expect(credential.credentialSubject.type).toBe("SalesScoreSubject");
  });
});

describe("buildEndorsementCredential", () => {
  it("creates a valid endorsement credential", () => {
    const credential = buildEndorsementCredential({
      id: "urn:uuid:endorsement-123",
      issuer: { id: "did:key:z6Mkmanager123", type: "Person", name: "Jane Doe" },
      subjectDid: "did:key:z6Mktest123",
      skills: ["enterprise_sales", "negotiation"],
      relationship: "direct_manager",
      narrative: "Outstanding sales professional.",
    });

    expect(credential.type).toContain("SalesEndorsementCredential");
    expect(credential.credentialSubject.type).toBe("SalesEndorsementSubject");
  });
});

describe("generateCredentialId", () => {
  it("generates URN UUID format", () => {
    const id = generateCredentialId();
    expect(id).toMatch(/^urn:uuid:[0-9a-f-]{36}$/);
  });

  it("generates unique IDs", () => {
    const id1 = generateCredentialId();
    const id2 = generateCredentialId();
    expect(id1).not.toBe(id2);
  });
});
