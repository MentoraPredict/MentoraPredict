import { useQuery } from "@tanstack/react-query";

import { getTeacherSubjectAnalytics } from "@/services/course-analytics.service";
import { getCourseEnrolledStudents } from "@/services/academic.service";

export default function useTeacherCourseAnalytics(courseId: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analytics", "teacher", "subject", courseId],
    queryFn: async () => {
      const [analytics, enrolledStudents] = await Promise.all([
        getTeacherSubjectAnalytics(courseId),
        getCourseEnrolledStudents(courseId),
      ]);

      const activeStudents = enrolledStudents.filter((s) => s.isEnrolled && s.average !== null);
      const totalAverage =
        activeStudents.length > 0
          ? activeStudents.reduce(
              (sum, student) => sum + (student.average ?? 0),
              0
            ) / activeStudents.length
          : 0;

      const studentsById = new Map(
        enrolledStudents.map((s) => [s.user.id, s])
      );

      const enrichedRecommendations = analytics.recommendations.map((rec) => {
        const prediction = analytics.predictions.find(
          (item) => item.id === rec.id
        );
        const student = prediction
          ? studentsById.get(prediction.studentId)
          : undefined;
        return {
          ...rec,
          title: student
            ? `${student.user.firstName ?? ""} ${student.user.lastName ?? ""}`.trim() ||
              rec.title
            : rec.title,
        };
      });

      return {
        ...analytics,
        students: enrolledStudents,
        average: totalAverage,
        recommendations: enrichedRecommendations,
      };
    },
    enabled: !!courseId,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error ? "No se pudieron cargar las metricas del curso." : null,
  };
}
