import { useQuery } from "@tanstack/react-query";

import type { RiskLevelOrUnknown } from "@/types/risk";

import {
  getMockAttendanceDetail,
  getMockClassRanking,
  getMockComparativeMetrics,
  getMockGradeBreakdown,
} from "../../mocks/coursePerformanceExtras.mock";

// Igual criterio que useStudentDashboardKpis.ts: cada useQuery ya tiene la
// forma (queryKey + queryFn async) que tendrá la llamada real cuando estos
// datos existan en el backend — integrar después es cambiar la queryFn,
// no tocar el componente que consume el hook.
export default function useCoursePerformanceExtras(
  subjectId: string,
  average: number,
  riskLevel: RiskLevelOrUnknown,
  realAttendanceRatePercent: number | null
) {
  const enabled = Boolean(subjectId);

  const gradeBreakdown = useQuery({
    queryKey: ["course-performance", "grade-breakdown", subjectId, average],
    queryFn: () => getMockGradeBreakdown(subjectId, average),
    enabled,
  });

  const ranking = useQuery({
    queryKey: ["course-performance", "ranking", subjectId, average],
    queryFn: () => getMockClassRanking(subjectId, average),
    enabled,
  });

  const attendance = useQuery({
    queryKey: ["course-performance", "attendance", subjectId, riskLevel, realAttendanceRatePercent],
    queryFn: () => getMockAttendanceDetail(subjectId, riskLevel, realAttendanceRatePercent),
    enabled,
  });

  const comparative = useQuery({
    queryKey: ["course-performance", "comparative", subjectId, average],
    queryFn: () => getMockComparativeMetrics(subjectId, average),
    enabled,
  });

  return {
    gradeBreakdown: { data: gradeBreakdown.data ?? null, isLoading: gradeBreakdown.isLoading },
    ranking: { data: ranking.data ?? null, isLoading: ranking.isLoading },
    attendance: { data: attendance.data ?? null, isLoading: attendance.isLoading },
    comparative: { data: comparative.data ?? null, isLoading: comparative.isLoading },
    isMocked: true as const,
  };
}
