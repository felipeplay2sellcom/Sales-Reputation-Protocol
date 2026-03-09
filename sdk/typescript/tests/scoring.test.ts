import { describe, it, expect } from "vitest";
import {
  calculateScore,
  getScoreTier,
  wilsonScore,
  ewma,
  applyDailyCap,
  normalize,
  timeDecayWeight,
} from "../src/core/scoring.js";

describe("calculateScore", () => {
  it("returns 300 for all-zero dimensions", () => {
    expect(
      calculateScore({
        performance: 0,
        reliability: 0,
        clientImpact: 0,
        professionalGrowth: 0,
        peerTrust: 0,
      })
    ).toBe(300);
  });

  it("returns 850 for all-one dimensions", () => {
    expect(
      calculateScore({
        performance: 1,
        reliability: 1,
        clientImpact: 1,
        professionalGrowth: 1,
        peerTrust: 1,
      })
    ).toBe(850);
  });

  it("returns correct score for mixed dimensions", () => {
    const score = calculateScore({
      performance: 0.85,
      reliability: 0.78,
      clientImpact: 0.72,
      professionalGrowth: 0.65,
      peerTrust: 0.60,
    });
    // 0.30*0.85 + 0.25*0.78 + 0.20*0.72 + 0.15*0.65 + 0.10*0.60
    // = 0.255 + 0.195 + 0.144 + 0.0975 + 0.06 = 0.7515
    // 300 + 0.7515 * 550 = 300 + 413.325 = 713.325 → 713
    expect(score).toBe(713);
  });

  it("clamps to 300 minimum", () => {
    expect(
      calculateScore({
        performance: -1,
        reliability: -1,
        clientImpact: -1,
        professionalGrowth: -1,
        peerTrust: -1,
      })
    ).toBe(300);
  });
});

describe("getScoreTier", () => {
  it("returns correct tiers", () => {
    expect(getScoreTier(300)).toBe("poor");
    expect(getScoreTier(499)).toBe("poor");
    expect(getScoreTier(500)).toBe("below_average");
    expect(getScoreTier(649)).toBe("below_average");
    expect(getScoreTier(650)).toBe("good");
    expect(getScoreTier(719)).toBe("good");
    expect(getScoreTier(720)).toBe("very_good");
    expect(getScoreTier(779)).toBe("very_good");
    expect(getScoreTier(780)).toBe("exceptional");
    expect(getScoreTier(850)).toBe("exceptional");
  });
});

describe("wilsonScore", () => {
  it("returns 0 for zero observations", () => {
    expect(wilsonScore(0, 0)).toBe(0);
  });

  it("returns lower score for small sample size", () => {
    const smallSample = wilsonScore(2, 2); // 100% with 2 obs
    const largeSample = wilsonScore(180, 200); // 90% with 200 obs
    // Small perfect sample should NOT outscore large good sample
    expect(smallSample).toBeLessThan(largeSample);
  });

  it("returns higher score for more data", () => {
    const few = wilsonScore(10, 10);
    const many = wilsonScore(100, 100);
    expect(many).toBeGreaterThan(few);
  });
});

describe("ewma", () => {
  it("returns current value when lambda is 1", () => {
    expect(ewma(100, 50, 1)).toBe(100);
  });

  it("returns previous value when lambda is 0", () => {
    expect(ewma(100, 50, 0)).toBe(50);
  });

  it("returns weighted average with default lambda", () => {
    const result = ewma(100, 50);
    // 0.15 * 100 + 0.85 * 50 = 15 + 42.5 = 57.5
    expect(result).toBe(57.5);
  });
});

describe("applyDailyCap", () => {
  it("caps positive change", () => {
    expect(applyDailyCap(700, 750)).toBe(715);
  });

  it("caps negative change", () => {
    expect(applyDailyCap(700, 650)).toBe(685);
  });

  it("allows small changes", () => {
    expect(applyDailyCap(700, 710)).toBe(710);
  });
});

describe("normalize", () => {
  it("returns 0 for min value", () => {
    expect(normalize(0, 0, 100)).toBe(0);
  });

  it("returns 1 for max value", () => {
    expect(normalize(100, 0, 100)).toBe(1);
  });

  it("returns 0.5 for midpoint", () => {
    expect(normalize(50, 0, 100)).toBe(0.5);
  });

  it("clamps to [0, 1]", () => {
    expect(normalize(-10, 0, 100)).toBe(0);
    expect(normalize(200, 0, 100)).toBe(1);
  });

  it("returns 0 when min equals max", () => {
    expect(normalize(50, 50, 50)).toBe(0);
  });
});

describe("timeDecayWeight", () => {
  it("returns 1 for day 0", () => {
    expect(timeDecayWeight(0)).toBe(1);
  });

  it("returns ~0.5 at half-life", () => {
    const weight = timeDecayWeight(200, 200);
    expect(weight).toBeCloseTo(0.5, 5);
  });

  it("decays over time", () => {
    const recent = timeDecayWeight(30);
    const old = timeDecayWeight(365);
    expect(recent).toBeGreaterThan(old);
  });
});
