import type { DashboardMetricTone } from "../components/DashboardMetricCard";
import { GOOD_GRADE, PASSING_GRADE } from "@/utils/gradeScale";

/** Escala 0-10 (ver utils/gradeScale). */
export function getAverageTone(average: number | null): DashboardMetricTone {
  if (average === null) return "neutral";
  if (average >= GOOD_GRADE) return "success";
  if (average >= PASSING_GRADE) return "warning";
  return "danger";
}

export function getCountTone(count: number): DashboardMetricTone {
  if (count === 0) return "success";
  if (count <= 2) return "warning";
  return "danger";
}
