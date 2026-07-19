import { useQuery } from "@tanstack/react-query";

import type { Course } from "@/types/course";

import { getMockTeacherMetrics } from "../../mocks/dashboardKpi.mock";

// Mismo principio que useStudentDashboardKpis: la queryFn de acá es hoy un
// mock, con la misma forma (queryKey + async) que tendrá la llamada real.
// Ver docs/frontend/dashboard-kpi-proposal.md §2.
function courseIdsKey(courses: Course[]): string {
  return courses.map((course) => course.id).join(",");
}

export default function useTeacherDashboardKpis(courses: Course[]) {
  const mocked = useQuery({
    queryKey: ["dashboard", "teacher", "mocked-metrics", courseIdsKey(courses)],
    queryFn: () => getMockTeacherMetrics(courses),
    enabled: courses.length > 0,
  });

  return {
    mocked: { data: mocked.data ?? null, isLoading: mocked.isLoading },
    isMocked: true as const,
  };
}
