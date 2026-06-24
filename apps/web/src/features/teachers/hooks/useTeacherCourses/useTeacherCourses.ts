import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  createTeacherCourse,
  getCourseCreationOptions,
  getTeacherCourses,
  type CourseCareerOption,
  type CoursePeriodOption,
  type CreateTeacherCoursePayload,
} from "@/services/academic.service";
import type { Course } from "@/types/course";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron cargar tus cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron cargar tus cursos. Intenta nuevamente.";
}

function isUuid(value?: string) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function useTeacherCourses(
  teacherId?: string,
  teacherName?: string
) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [careers, setCareers] = useState<CourseCareerOption[]>([]);
  const [periods, setPeriods] = useState<CoursePeriodOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    if (!teacherId) {
      setCourses([]);
      setIsLoading(false);
      setError("No se pudo identificar al docente autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loadedCourses, creationOptions] = await Promise.all([
        getTeacherCourses(teacherId, teacherName),
        getCourseCreationOptions(),
      ]);

      setCourses(loadedCourses);
      setCareers(creationOptions.careers);
      setPeriods(creationOptions.periods);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [teacherId, teacherName]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(
    async (
      payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">
    ) => {
      if (!isUuid(teacherId)) {
        setError("No se pudo identificar al docente autenticado.");
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        const createdCourse = await createTeacherCourse({
          ...payload,
          teacherId,
          teacherName,
        });

        setCourses((currentCourses) => [
          ...currentCourses,
          createdCourse,
        ]);

        return createdCourse;
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [teacherId, teacherName]
  );

  return {
    courses,
    careers,
    periods,
    isLoading,
    isCreating,
    error,
    reload: loadCourses,
    createCourse,
  };
}
