import axios from "axios";
import { useEffect, useState } from "react";

import { getCourseEnrolledStudents } from "@/services/academic.service";
import { getTeacherSubjectAnalytics } from "@/services/course-analytics.service";

type TeacherAnalytics = Awaited<ReturnType<typeof getTeacherSubjectAnalytics>> & {
  average: number;
  students: Awaited<ReturnType<typeof getCourseEnrolledStudents>>;
};

export default function useTeacherCourseAnalytics(courseId: string) {
  const [data, setData] = useState<TeacherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      getTeacherSubjectAnalytics(courseId),
      getCourseEnrolledStudents(courseId),
    ])
      .then(([analytics, students]) => {
        const studentsById = new Map(
          students.map((student) => [student.user.id, student]),
        );
        const averages = students
          .filter((student) => student.isEnrolled && student.average !== null)
          .map((student) => student.average as number);
        const average = averages.length
          ? averages.reduce((sum, value) => sum + value, 0) / averages.length
          : 0;
        const recommendations = analytics.recommendations.map((recommendation) => {
          const prediction = analytics.predictions.find(
            (item) => item.id === recommendation.id,
          );
          const student = prediction
            ? studentsById.get(prediction.studentId)
            : undefined;
          const studentName = student
            ? [student.user.firstName, student.user.lastName]
                .filter(Boolean)
                .join(" ")
            : "";

          return {
            ...recommendation,
            title: studentName || recommendation.title,
          };
        });

        if (!isCancelled) {
          setData({ ...analytics, average, recommendations, students });
        }
      })
      .catch((requestError) => {
        if (isCancelled) return;
        const message = axios.isAxiosError<{ message?: string }>(requestError)
          ? requestError.response?.data?.message
          : null;
        setError(message ?? "No se pudieron cargar las métricas del curso.");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  return { data, isLoading, error };
}
