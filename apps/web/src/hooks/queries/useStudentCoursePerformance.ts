import { useQuery } from "@tanstack/react-query";

import { getStudentSubjectAnalytics } from "@/services/course-analytics.service";

export default function useStudentCoursePerformance(courseId: string) {
  const {
    data,
    isLoading,
    error,
    refetch: reload,
  } = useQuery({
    queryKey: ["analytics", "student", "subject", courseId],
    queryFn: () => getStudentSubjectAnalytics(courseId),
    enabled: !!courseId,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ? "No fue posible cargar las metricas de la materia." : null,
    reload,
  };
}
