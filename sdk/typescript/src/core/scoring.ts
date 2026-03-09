import {
  SCORE_MIN,
  SCORE_RANGE,
  DIMENSION_WEIGHTS,
  EWMA_LAMBDA,
  MAX_DAILY_SCORE_CHANGE,
} from "./constants.js";
import type { ScoreDimensions, ScoreTier } from "./types.js";

/**
 * Calculate the Sales Reputation Score from normalized dimension values.
 *
 * Formula: SRS = 300 + 550 × weighted_sum(dimensions)
 *
 * @param dimensions - Normalized dimension values (0.0 to 1.0)
 * @returns Score between 300 and 850
 */
export function calculateScore(dimensions: ScoreDimensions): number {
  const rawScore =
    DIMENSION_WEIGHTS.performance * dimensions.performance +
    DIMENSION_WEIGHTS.reliability * dimensions.reliability +
    DIMENSION_WEIGHTS.clientImpact * dimensions.clientImpact +
    DIMENSION_WEIGHTS.professionalGrowth * dimensions.professionalGrowth +
    DIMENSION_WEIGHTS.peerTrust * dimensions.peerTrust;

  const score = Math.round(SCORE_MIN + rawScore * SCORE_RANGE);
  return Math.max(SCORE_MIN, Math.min(score, SCORE_MIN + SCORE_RANGE));
}

/**
 * Determine the tier label for a given score.
 */
export function getScoreTier(score: number): ScoreTier {
  if (score < 500) return "poor";
  if (score < 650) return "below_average";
  if (score < 720) return "good";
  if (score < 780) return "very_good";
  return "exceptional";
}

/**
 * Wilson Score Lower Bound — adjusts success ratios for small sample sizes.
 *
 * Prevents a professional with 2 deals and 100% win rate from
 * outscoring one with 200 deals and 60% win rate.
 *
 * @param positive - Number of positive outcomes
 * @param total - Total number of observations
 * @param confidence - Z-score for confidence interval (default: 1.96 for 95%)
 * @returns Lower bound of the confidence interval (0.0 to 1.0)
 */
export function wilsonScore(
  positive: number,
  total: number,
  confidence: number = 1.96
): number {
  if (total === 0) return 0;

  const p = positive / total;
  const z2 = confidence * confidence;
  const denominator = 1 + z2 / total;
  const center = p + z2 / (2 * total);
  const spread = confidence * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);

  return Math.max(0, (center - spread) / denominator);
}

/**
 * Exponentially Weighted Moving Average (EWMA) for time decay.
 *
 * Recent performance is weighted more heavily than historical data.
 *
 * @param currentValue - Current period's value
 * @param previousSmoothed - Previous smoothed value
 * @param lambda - Decay factor (default: 0.15)
 * @returns Smoothed value
 */
export function ewma(
  currentValue: number,
  previousSmoothed: number,
  lambda: number = EWMA_LAMBDA
): number {
  return lambda * currentValue + (1 - lambda) * previousSmoothed;
}

/**
 * Apply daily score change cap.
 *
 * @param previousScore - Previous day's score
 * @param newScore - Newly calculated score
 * @param maxChange - Maximum allowed change per day (default: 15)
 * @returns Capped score
 */
export function applyDailyCap(
  previousScore: number,
  newScore: number,
  maxChange: number = MAX_DAILY_SCORE_CHANGE
): number {
  const delta = newScore - previousScore;
  const cappedDelta = Math.max(-maxChange, Math.min(delta, maxChange));
  return previousScore + cappedDelta;
}

/**
 * Normalize a raw value to [0, 1] using min-max normalization.
 *
 * @param value - Raw value
 * @param min - Population minimum
 * @param max - Population maximum
 * @returns Normalized value between 0.0 and 1.0
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate time decay weight for an event.
 *
 * @param daysSinceEvent - Number of days since the event occurred
 * @param halfLife - Half-life in days (default: 200)
 * @returns Weight between 0.0 and 1.0
 */
export function timeDecayWeight(
  daysSinceEvent: number,
  halfLife: number = 200
): number {
  const alpha = Math.LN2 / halfLife;
  return Math.exp(-alpha * daysSinceEvent);
}
