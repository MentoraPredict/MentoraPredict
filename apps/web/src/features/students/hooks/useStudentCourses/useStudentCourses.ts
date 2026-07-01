import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import { getStudentCourses } from "@/services/academic.service";
import type { Course } from "@/types/course";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron cargar tus cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron cargar tus cursos. Intenta nuevamente.";
}

export default function useStudentCourses(studentId?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    if (!studentId) {
      setCourses([]);
      setIsLoading(false);
      setError("No se pudo identificar al estudiante autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setCourses(await getStudentCourses(studentId));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  return {
    courses,
    isLoading,
    error,
    reload: loadCourses,
  };
}
