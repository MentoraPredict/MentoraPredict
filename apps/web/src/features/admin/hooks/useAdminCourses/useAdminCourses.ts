import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";

import {
  changeCourseStatus,
  createAdminCourse,
  deleteTeacherCourse,
  getAdminCourses,
  getCourseCreationOptions,
  updateTeacherCourse,
  type CourseCareerOption,
  type CourseFacultyOption,
  type CoursePeriodOption,
  type UpdateTeacherCoursePayload,
} from "@/services/academic.service";
import { getSubjectAverageGrade } from "@/services/course-analytics.service";
import { getTeachers } from "@/services/users/users.service";
import type { AdminCreateCoursePayload } from "@/features/admin/components/AdminCreateCourseForm";
import type { Course } from "@/types/course";
import type { AppUser } from "@/types/user/user.types";

function getTeacherDisplayName(teacher: AppUser) {
  return (
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() ||
    teacher.email
  );
}

function resolveTeacherNames(courses: Course[], teachers: AppUser[]): Course[] {
  const teachersById = new Map(teachers.map((teacher) => [teacher.id, teacher]));

  return courses.map((course) => {
    const teacher = course.teacherId ? teachersById.get(course.teacherId) : undefined;
    return teacher ? { ...course, teacherName: getTeacherDisplayName(teacher) } : course;
  });
}

async function enrichWithAverageGrades(courses: Course[]): Promise<Course[]> {
  const averages = await Promise.allSettled(
    courses.map((course) => getSubjectAverageGrade(course.id))
  );

  return courses.map((course, index) => {
    const result = averages[index];
    return result.status === "fulfilled"
      ? { ...course, currentAverage: result.value }
      : course;
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron cargar los cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron cargar los cursos. Intenta nuevamente.";
}

function getCreationDataErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `Los cursos se cargaron, pero no se pudieron cargar los datos para crear cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "Los cursos se cargaron, pero no se pudieron cargar los datos para crear cursos.";
}

function getCreateCourseErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "No se pudo crear el curso. Intenta nuevamente.";
  }

  const status = error.response?.status;
  const responseMessage = error.response?.data?.message;

  if (
    (status === 409 || status === 400) &&
    typeof responseMessage === "string" &&
    responseMessage.trim()
  ) {
    return responseMessage;
  }

  return `No se pudo crear el curso. Codigo HTTP: ${status ?? "desconocido"}.`;
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

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return `No se pudo eliminar el curso. Codigo HTTP: ${status ?? "desconocido"}.`;
}

export default function useAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [faculties, setFaculties] = useState<CourseFacultyOption[]>([]);
  const [careers, setCareers] = useState<CourseCareerOption[]>([]);
  const [periods, setPeriods] = useState<CoursePeriodOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creationDataError, setCreationDataError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCreationDataError(null);

    const [coursesResult, creationOptionsResult, teachersResult] = await Promise.allSettled([
      getAdminCourses(),
      getCourseCreationOptions(),
      getTeachers(),
    ]);

    if (coursesResult.status === "rejected") {
      setError(getErrorMessage(coursesResult.reason));
      setIsLoading(false);
      return;
    }

    if (creationOptionsResult.status === "fulfilled") {
      setFaculties(creationOptionsResult.value.faculties);
      setCareers(creationOptionsResult.value.careers);
      setPeriods(creationOptionsResult.value.periods);
    } else {
      setFaculties([]);
      setCareers([]);
      setPeriods([]);
      setCreationDataError(getCreationDataErrorMessage(creationOptionsResult.reason));
    }

    const loadedTeachers = teachersResult.status === "fulfilled" ? teachersResult.value : [];
    if (teachersResult.status === "fulfilled") {
      setTeachers(loadedTeachers);
    } else {
      setTeachers([]);
      setCreationDataError(getCreationDataErrorMessage(teachersResult.reason));
    }

    const coursesWithTeacherNames = resolveTeacherNames(coursesResult.value, loadedTeachers);
    setCourses(coursesWithTeacherNames);
    setIsLoading(false);

    // Enrich with the course-level average in the background so the list
    // itself doesn't wait on one extra analytics-service call per course.
    const enrichedCourses = await enrichWithAverageGrades(coursesWithTeacherNames);
    setCourses(enrichedCourses);
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(
    async (payload: AdminCreateCoursePayload) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const createdCourse = await createAdminCourse(payload);
        setCourses((current) => [...current, createdCourse]);
        return createdCourse;
      } catch (requestError) {
        setCreateError(getCreateCourseErrorMessage(requestError));
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateCourse = useCallback(
    async (courseId: string, payload: UpdateTeacherCoursePayload) => {
      setUpdatingCourseId(courseId);
      setError(null);

      try {
        const updatedCourse = await updateTeacherCourse(courseId, payload);
        setCourses((current) =>
          current.map((course) =>
            course.id === courseId
              ? { ...course, name: updatedCourse.name, description: updatedCourse.description }
              : course
          )
        );
        return true;
      } catch (requestError) {
        setError(getCreateCourseErrorMessage(requestError));
        return false;
      } finally {
        setUpdatingCourseId(null);
      }
    },
    []
  );

  const updateCourseStatus = useCallback(async (courseId: string, isActive: boolean) => {
    setUpdatingCourseId(courseId);
    setError(null);

    try {
      await changeCourseStatus(courseId, isActive);
      setCourses((current) =>
        current.map((course) =>
          course.id === courseId
            ? {
                ...course,
                isActive,
                riskLabel: isActive ? "Curso activo" : "Curso inactivo",
              }
            : course
        )
      );
      return true;
    } catch (requestError) {
      setError(getCreateCourseErrorMessage(requestError));
      return false;
    } finally {
      setUpdatingCourseId(null);
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    setDeletingCourseId(courseId);
    setError(null);

    try {
      await deleteTeacherCourse(courseId);
      setCourses((current) => current.filter((course) => course.id !== courseId));
      return true;
    } catch (requestError) {
      setError(getDeleteErrorMessage(requestError));
      return false;
    } finally {
      setDeletingCourseId(null);
    }
  }, []);

  const clearCreateError = useCallback(() => {
    setCreateError(null);
  }, []);

  return {
    courses,
    teachers,
    faculties,
    careers,
    periods,
    isLoading,
    error,
    creationDataError,
    isCreating,
    createError,
    clearCreateError,
    deletingCourseId,
    updatingCourseId,
    reload: loadCourses,
    createCourse,
    updateCourse,
    updateCourseStatus,
    deleteCourse,
  };
}
