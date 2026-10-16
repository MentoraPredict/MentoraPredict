import { useQuery } from "@tanstack/react-query";

import type { Course } from "@/types/course";

import {
  getMockAttendanceSummary,
  getMockComplianceSummary,
  getMockComprehensionSummary,
  getMockEngagementSummary,
  getMockSurveyStatus,
} from "../../mocks/dashboardKpi.mock";

// Cada useQuery de acá abajo es, hoy, un mock — pero ya tiene la forma
// (queryKey + queryFn async) que tendrá la llamada real. Integrar después
// significa cambiar la queryFn de cada uno por una función de
// services/*.service.ts, no tocar ningún componente que consuma este hook.
// Ver docs/frontend/dashboard-kpi-proposal.md §2.

function courseIdsKey(courses: Course[]): string {
  return courses.map((course) => course.id).join(",");
}

export default function useStudentDashboardKpis(courses: Course[]) {
  const enabled = courses.length > 0;
  const subjectsKey = courseIdsKey(courses);

  const attendance = useQuery({
    queryKey: ["dashboard", "student", "attendance", subjectsKey],
    queryFn: () => getMockAttendanceSummary(courses),
    enabled,
  });

  const compliance = useQuery({
    queryKey: ["dashboard", "student", "compliance", subjectsKey],
    queryFn: () => getMockComplianceSummary(courses),
    enabled,
  });

  const comprehension = useQuery({
    queryKey: ["dashboard", "student", "comprehension", subjectsKey],
    queryFn: () => getMockComprehensionSummary(courses),
    enabled,
  });

  const engagement = useQuery({
    queryKey: ["dashboard", "student", "engagement"],
    queryFn: getMockEngagementSummary,
  });

  const surveyStatus = useQuery({
    queryKey: ["dashboard", "student", "survey-status"],
    queryFn: getMockSurveyStatus,
  });

  return {
    attendance: { data: attendance.data ?? null, isLoading: attendance.isLoading },
    compliance: { data: compliance.data ?? null, isLoading: compliance.isLoading },
    comprehension: {
      data: comprehension.data ?? null,
      isLoading: comprehension.isLoading,
    },
    engagement: { data: engagement.data ?? null, isLoading: engagement.isLoading },
    surveyStatus: {
      data: surveyStatus.data ?? null,
      isLoading: surveyStatus.isLoading,
    },
    isMocked: true as const,
  };
}
