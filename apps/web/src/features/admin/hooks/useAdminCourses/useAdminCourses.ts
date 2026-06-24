import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import { getAdminCourses } from "@/services/academic.service";
import type { Course } from "@/types/course";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron cargar los cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron cargar los cursos. Intenta nuevamente.";
}

export default function useAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedCourses = await getAdminCourses();
      setCourses(loadedCourses);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
