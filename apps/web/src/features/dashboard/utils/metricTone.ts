import type { DashboardMetricTone } from "../components/DashboardMetricCard";

/** Escala 0-20 — mismo umbral que se usa en todo el dominio académico. */
export function getAverageTone(average: number | null): DashboardMetricTone {
  if (average === null) return "neutral";
  if (average >= 16) return "success";
  if (average >= 14) return "warning";
  return "danger";
}

export function getCountTone(count: number): DashboardMetricTone {
  if (count === 0) return "success";
  if (count <= 2) return "warning";
  return "danger";
}
