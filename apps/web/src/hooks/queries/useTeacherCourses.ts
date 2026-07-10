import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import {
  createTeacherCourse,
  deleteTeacherCourse,
  enrollStudentsInCourse,
  getCourseCreationOptions,
  getTeacherCourses,
  updateTeacherCourse,
  uploadTeacherCourseImage,
  deleteTeacherCourseImage,
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
  const queryClient = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: ["courses", "teacher", teacherId],
    queryFn: () => getTeacherCourses(teacherId!, teacherName),
    enabled: !!teacherId,
  });

  const creationOptionsQuery = useQuery({
    queryKey: ["academic", "creationOptions"],
    queryFn: getCourseCreationOptions,
    enabled: includeCreationData,
  });

  const studentsQuery = useQuery({
    queryKey: ["users", "students"],
    queryFn: getStudents,
    enabled: includeCreationData,
  });

  const createCourseMutation = useMutation({
    mutationFn: async ({
      payload,
      studentIds,
    }: {
      payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">;
      studentIds: string[];
    }) => {
      if (!isUuid(teacherId)) {
        throw new Error("No se pudo identificar al docente autenticado.");
      }
      const createdCourse = await createTeacherCourse({
        ...payload,
        teacherId,
        teacherName,
      });
      if (studentIds.length > 0) {
        await enrollStudentsInCourse(createdCourse.id, studentIds);
      }
      return createdCourse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher", teacherId] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteTeacherCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher", teacherId] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: UpdateTeacherCoursePayload;
    }) => updateTeacherCourse(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher", teacherId] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({
      courseId,
      file,
    }: {
      courseId: string;
      file: File;
    }) => uploadTeacherCourseImage(courseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher", teacherId] });
    },
  });

  const removeImageMutation = useMutation({
    mutationFn: deleteTeacherCourseImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "teacher", teacherId] });
    },
  });

  const courses = coursesQuery.data ?? [];
  const faculties = creationOptionsQuery.data?.faculties ?? [];
  const careers = creationOptionsQuery.data?.careers ?? [];
  const periods = creationOptionsQuery.data?.periods ?? [];
  const students = studentsQuery.data ?? [];

  const queryError = coursesQuery.error
    ? getErrorMessage(coursesQuery.error)
    : null;
  const creationDataError =
    includeCreationData && (creationOptionsQuery.error || studentsQuery.error)
      ? "Los cursos se cargaron, pero no se pudieron cargar los datos para crear cursos."
      : null;

  return {
    courses,
    faculties,
    careers,
    periods,
    students,
    isLoading: coursesQuery.isLoading,
    isCreating: createCourseMutation.isPending,
    deletingCourseId: null as string | null,
    updatingCourseId: null as string | null,
    error:
      queryError ??
      createCourseMutation.error?.message ??
      deleteCourseMutation.error?.message ??
      null,
    creationDataError,
    reload: () => coursesQuery.refetch(),
    createCourse: async (
      payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">,
      studentIds: string[]
    ) => {
      try {
        const result = await createCourseMutation.mutateAsync({ payload, studentIds });
        return result;
      } catch (err) {
        return null;
      }
    },
    deleteCourse: async (courseId: string) => {
      try {
        await deleteCourseMutation.mutateAsync(courseId);
        return true;
      } catch (err) {
        return false;
      }
    },
    updateCourse: async (courseId: string, payload: UpdateTeacherCoursePayload) => {
      await updateCourseMutation.mutateAsync({ courseId, payload });
    },
    uploadCourseImage: async (courseId: string, file: File) => {
      const result = await uploadImageMutation.mutateAsync({ courseId, file });
      return result;
    },
    removeCourseImage: async (courseId: string) => {
      await removeImageMutation.mutateAsync(courseId);
    },
  };
}
