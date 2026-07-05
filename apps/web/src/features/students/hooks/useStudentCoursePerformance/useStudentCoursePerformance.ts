import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { getStudentSubjectAnalytics } from "@/services/course-analytics.service";

type StudentAnalytics = Awaited<ReturnType<typeof getStudentSubjectAnalytics>>;

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(". ");
    if (message) return message;
  }
  return "No fue posible cargar las métricas de la materia.";
}

export default function useStudentCoursePerformance(courseId: string) {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPerformance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudentSubjectAnalytics(courseId);
      setData(response);
      return response;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    getStudentSubjectAnalytics(courseId)
      .then((response) => {
        if (!isCancelled) setData(response);
      })
      .catch((requestError) => {
        if (!isCancelled) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  return { data, isLoading, error, reload: loadPerformance };
}
