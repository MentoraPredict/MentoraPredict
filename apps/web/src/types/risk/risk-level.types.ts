/**
 * Single source of truth for academic risk levels across the frontend.
 * Mirrors the real backend domain value set (analytics-service
 * `ClassifyRiskUseCase`, `@mentorapredict/shared-types`'s `RiskLevel`).
 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** `RiskLevel` plus the client-only "not enough data yet" state. */
export type RiskLevelOrUnknown = RiskLevel | "UNKNOWN";

export const RISK_LEVEL_RANK: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
};
