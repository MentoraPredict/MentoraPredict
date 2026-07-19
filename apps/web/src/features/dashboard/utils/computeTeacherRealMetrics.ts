import type { Course } from "@/types/course";

import type { TeacherRealMetrics } from "../types/dashboard-kpi.types";

export interface TeacherCourseAnalytics {
  average: number | null;
  riskCounts: { low: number; medium: number; high: number; critical: number };
}

/**
 * Agrega lo que TeacherCoursesManagement ya calcula por curso
 * (getSubjectMetricsSummary, una llamada por curso que ya se hacía) — no
 * agrega ninguna llamada nueva. Ver docs/frontend/dashboard-kpi-proposal.md
 * §4 ("Ninguno — calculable HOY").
 */
export function computeTeacherRealMetrics(
  courses: Course[],
  analyticsByCourseId: Record<string, TeacherCourseAnalytics>
): TeacherRealMetrics {
  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.enrolledCount ?? 0),
    0
  );

  const averages = Object.values(analyticsByCourseId)
    .map((entry) => entry.average)
    .filter((value): value is number => value !== null && value > 0);

  const studentsAtRisk = Object.values(analyticsByCourseId).reduce(
    (sum, entry) => sum + entry.riskCounts.medium + entry.riskCounts.high + entry.riskCounts.critical,
    0
  );

  return {
    totalCourses: courses.length,
    totalStudents,
    averageAcrossCourses:
      averages.length > 0
        ? Math.round(
            (averages.reduce((sum, value) => sum + value, 0) / averages.length) * 100
          ) / 100
        : null,
    studentsAtRisk,
  };
}
