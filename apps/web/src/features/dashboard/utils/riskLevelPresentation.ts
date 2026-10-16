import { RISK_LEVEL_RANK } from "@/types/risk";
import type { RiskLevel, RiskLevelOrUnknown } from "@/types/risk";

interface RiskLevelPresentation {
  label: string;
  shortLabel: string;
  panelClassName: string;
  badgeClassName: string;
}

export const riskLevelPresentation: Record<RiskLevel, RiskLevelPresentation> = {
  LOW: {
    label: "Riesgo bajo",
    shortLabel: "Estable",
    panelClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  MEDIUM: {
    label: "Riesgo medio",
    shortLabel: "Seguimiento",
    panelClassName: "border-amber-200 bg-amber-50 text-amber-800",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
  HIGH: {
    label: "Riesgo alto",
    shortLabel: "Alta prioridad",
    panelClassName: "border-red-200 bg-red-50 text-red-800",
    badgeClassName: "bg-red-100 text-red-700",
  },
  CRITICAL: {
    label: "Riesgo crítico",
    shortLabel: "Atención urgente",
    panelClassName: "border-red-300 bg-red-100 text-red-900",
    badgeClassName: "bg-red-700 text-white",
  },
};

export const insufficientDataPresentation: RiskLevelPresentation = {
  label: "Sin datos suficientes",
  shortLabel: "Sin datos",
  panelClassName: "border-gray-200 bg-gray-50 text-gray-700",
  badgeClassName: "bg-gray-100 text-gray-700",
};

export function getRiskPresentation(
  level: RiskLevelOrUnknown
): RiskLevelPresentation {
  return level === "UNKNOWN"
    ? insufficientDataPresentation
    : riskLevelPresentation[level];
}

export function isAtRiskLevel(level: RiskLevelOrUnknown): boolean {
  return level === "MEDIUM" || level === "HIGH" || level === "CRITICAL";
}

/** UNKNOWN sorts between LOW and MEDIUM — "no data" isn't necessarily safe. */
export function courseRiskRank(level: RiskLevelOrUnknown): number {
  return level === "UNKNOWN" ? 0.5 : RISK_LEVEL_RANK[level];
}
