import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  createTeacherCourse,
  deleteTeacherCourse,
  enrollStudentsInCourse,
  getCourseCreationOptions,
  getTeacherCourses,
  updateTeacherCourse,
  type CourseCareerOption,
  type CourseFacultyOption,
  type CoursePeriodOption,
  type CreateTeacherCoursePayload,
  type UpdateTeacherCoursePayload,
} from "@/services/academic.service";
import { getStudents } from "@/services/users/users.service";
import type { Course } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron cargar tus cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron cargar tus cursos. Intenta nuevamente.";
}

function getDeleteErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "No se pudo eliminar el curso. Intenta nuevamente.";
  }

  const status = error.response?.status;
  const responseMessage = error.response?.data?.message;

  if (status === 400) {
    return "No se puede eliminar el curso porque tiene estudiantes o registros academicos asociados.";
  }

  if (status === 404) {
    return "El curso ya no existe o no pudo encontrarse.";
  }

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return `No se pudo eliminar el curso. Codigo HTTP: ${status ?? "desconocido"}.`;
}

function isUuid(value?: string) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function useTeacherCourses(
  teacherId?: string,
  teacherName?: string,
  includeCreationData = false
) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<CourseFacultyOption[]>([]);
  const [careers, setCareers] = useState<CourseCareerOption[]>([]);
  const [periods, setPeriods] = useState<CoursePeriodOption[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
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
      if (includeCreationData) {
        const [loadedCourses, creationOptions, loadedStudents] =
          await Promise.all([
            getTeacherCourses(teacherId, teacherName),
            getCourseCreationOptions(),
            getStudents(),
          ]);

        setCourses(loadedCourses);
        setFaculties(creationOptions.faculties);
        setCareers(creationOptions.careers);
        setPeriods(creationOptions.periods);
        setStudents(loadedStudents);
      } else {
        setCourses(await getTeacherCourses(teacherId, teacherName));
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [includeCreationData, teacherId, teacherName]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(
    async (
      payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">,
      studentIds: string[]
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

        if (studentIds.length > 0) {
          const failedStudentIds = await enrollStudentsInCourse(
            createdCourse.id,
            studentIds
          );

          if (failedStudentIds.length > 0) {
            setError(
              `El curso se creo, pero no se pudo matricular a ${failedStudentIds.length} estudiante(s).`
            );
          }
        }

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

  const deleteCourse = useCallback(async (courseId: string) => {
    setDeletingCourseId(courseId);
    setError(null);

    try {
      await deleteTeacherCourse(courseId);
      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== courseId)
      );
      return true;
    } catch (requestError) {
      setError(getDeleteErrorMessage(requestError));
      return false;
    } finally {
      setDeletingCourseId(null);
    }
  }, []);

  const updateCourse = useCallback(
    async (courseId: string, payload: UpdateTeacherCoursePayload) => {
      setUpdatingCourseId(courseId);

      try {
        const updatedCourse = await updateTeacherCourse(courseId, payload);
        setCourses((currentCourses) =>
          currentCourses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  name: updatedCourse.name,
                  description: updatedCourse.description,
                }
              : course
          )
        );
      } finally {
        setUpdatingCourseId(null);
      }
    },
    []
  );

  return {
    courses,
    faculties,
    careers,
    periods,
    students,
    isLoading,
    isCreating,
    deletingCourseId,
    updatingCourseId,
    error,
    reload: loadCourses,
    createCourse,
    deleteCourse,
    updateCourse,
  };
}
