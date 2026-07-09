import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
  type MutationState,
} from "@tanstack/react-query";

import {
  deleteTeacherCourse,
  getCourseCreationOptions,
  getTeacherCourses,
  updateTeacherCourse,
  uploadTeacherCourseImage,
  deleteTeacherCourseImage,
  type CreateTeacherCoursePayload,
  type UpdateTeacherCoursePayload,
} from "@/services/academic.service";
import { getStudents } from "@/services/users/users.service";
import {
  PartialCourseCreationError,
  type CreateCourseMutationResult,
  type CreateCourseMutationVariables,
} from "@/services/query/createCourseMutation";
import { mutationKeys } from "@/services/query/mutationKeys";
import { queryKeys } from "@/services/query/queryKeys";
import type { Course } from "@/types/course";

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

function getCreationDataErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `Los cursos se cargaron, pero no se pudieron cargar los datos para crear cursos. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "Los cursos se cargaron, pero no se pudieron cargar los datos para crear cursos.";
}

function isUuid(value?: string) {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type CreateCourseMutationStateEntry = MutationState<
  CreateCourseMutationResult,
  unknown,
  CreateCourseMutationVariables,
  unknown
>;

function pickLatestMutation(
  states: CreateCourseMutationStateEntry[]
): CreateCourseMutationStateEntry | undefined {
  return states.reduce<CreateCourseMutationStateEntry | undefined>((latest, current) => {
    if (!latest) {
      return current;
    }
    return current.submittedAt > latest.submittedAt ? current : latest;
  }, undefined);
}

export default function useTeacherCourses(
  teacherId?: string,
  teacherName?: string,
  includeCreationData = false
) {
  const queryClient = useQueryClient();
  const teacherIdValid = isUuid(teacherId);

  const [manualError, setManualError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  const coursesQueryKey = queryKeys.teacherCourses(teacherId ?? "unknown-teacher");

  const coursesQuery = useQuery({
    queryKey: coursesQueryKey,
    queryFn: () => getTeacherCourses(teacherId as string, teacherName),
    enabled: teacherIdValid,
  });

  const creationOptionsQuery = useQuery({
    queryKey: queryKeys.courseCreationOptions(),
    queryFn: getCourseCreationOptions,
    enabled: includeCreationData,
  });

  const studentsQuery = useQuery({
    queryKey: queryKeys.students(),
    queryFn: getStudents,
    enabled: includeCreationData,
  });

  const createCourseMutation = useMutation<
    CreateCourseMutationResult,
    unknown,
    CreateCourseMutationVariables
  >({
    mutationKey: mutationKeys.createCourse,
  });

  const errorMutationStates = useMutationState<CreateCourseMutationStateEntry>(
    { filters: { mutationKey: mutationKeys.createCourse, status: "error" } },
    queryClient
  );
  const successMutationStates = useMutationState<CreateCourseMutationStateEntry>(
    { filters: { mutationKey: mutationKeys.createCourse, status: "success" } },
    queryClient
  );

  const latestFatalError = pickLatestMutation(
    errorMutationStates.filter((state) => !(state.error instanceof PartialCourseCreationError))
  );
  const createError = latestFatalError
    ? getCreateCourseErrorMessage(latestFatalError.error)
    : null;

  const latestPartialFailure = pickLatestMutation(
    errorMutationStates.filter((state) => state.error instanceof PartialCourseCreationError)
  );
  const latestEnrollmentWarningFromSuccess = pickLatestMutation(
    successMutationStates.filter((state) => (state.data?.failedStudentIds.length ?? 0) > 0)
  );

  let enrollmentWarning: string | null = null;
  if (latestPartialFailure) {
    enrollmentWarning =
      "El curso se creo, pero no se pudo matricular a los estudiantes seleccionados.";
  } else if (latestEnrollmentWarningFromSuccess) {
    const failedCount = latestEnrollmentWarningFromSuccess.data?.failedStudentIds.length ?? 0;
    enrollmentWarning = `El curso se creo, pero no se pudo matricular a ${failedCount} estudiante(s).`;
  }

  const error =
    manualError ??
    enrollmentWarning ??
    (!teacherIdValid
      ? "No se pudo identificar al docente autenticado."
      : coursesQuery.error
        ? getErrorMessage(coursesQuery.error)
        : null);

  const creationDataError = creationOptionsQuery.error
    ? getCreationDataErrorMessage(creationOptionsQuery.error)
    : studentsQuery.error
      ? getCreationDataErrorMessage(studentsQuery.error)
      : null;

  const reload = useCallback(async () => {
    await Promise.allSettled([
      coursesQuery.refetch(),
      ...(includeCreationData ? [creationOptionsQuery.refetch(), studentsQuery.refetch()] : []),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeCreationData]);

  const createCourse = useCallback(
    (
      payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">,
      studentIds: string[]
    ) => {
      if (!teacherIdValid || !teacherId) {
        setManualError("No se pudo identificar al docente autenticado.");
        return;
      }

      createCourseMutation.mutate({
        payload,
        studentIds,
        teacherId,
        teacherName,
        tempId: `pending-${crypto.randomUUID()}`,
      });
    },
    [createCourseMutation, teacherId, teacherIdValid, teacherName]
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      setDeletingCourseId(courseId);
      setManualError(null);

      try {
        await deleteTeacherCourse(courseId);
        queryClient.setQueryData<Course[]>(coursesQueryKey, (current = []) =>
          current.filter((course) => course.id !== courseId)
        );
        return true;
      } catch (requestError) {
        setManualError(getDeleteErrorMessage(requestError));
        return false;
      } finally {
        setDeletingCourseId(null);
      }
    },
    [coursesQueryKey, queryClient]
  );

  const updateCourse = useCallback(
    async (courseId: string, payload: UpdateTeacherCoursePayload) => {
      setUpdatingCourseId(courseId);

      try {
        const updatedCourse = await updateTeacherCourse(courseId, payload);
        queryClient.setQueryData<Course[]>(coursesQueryKey, (current = []) =>
          current.map((course) =>
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
    [coursesQueryKey, queryClient]
  );

  const uploadCourseImage = useCallback(
    async (courseId: string, file: File) => {
      const imageUrl = await uploadTeacherCourseImage(courseId, file);
      queryClient.setQueryData<Course[]>(coursesQueryKey, (current = []) =>
        current.map((course) => (course.id === courseId ? { ...course, imageUrl } : course))
      );
      return imageUrl;
    },
    [coursesQueryKey, queryClient]
  );

  const removeCourseImage = useCallback(
    async (courseId: string) => {
      await deleteTeacherCourseImage(courseId);
      queryClient.setQueryData<Course[]>(coursesQueryKey, (current = []) =>
        current.map((course) =>
          course.id === courseId ? { ...course, imageUrl: undefined } : course
        )
      );
    },
    [coursesQueryKey, queryClient]
  );

  const clearCreateError = useCallback(() => {
    const mutationCache = queryClient.getMutationCache();
    mutationCache
      .findAll({ mutationKey: mutationKeys.createCourse, status: "error" })
      .forEach((mutation) => mutationCache.remove(mutation));
    setManualError(null);
  }, [queryClient]);

  return {
    courses: coursesQuery.data ?? [],
    faculties: creationOptionsQuery.data?.faculties ?? [],
    careers: creationOptionsQuery.data?.careers ?? [],
    periods: creationOptionsQuery.data?.periods ?? [],
    students: studentsQuery.data ?? [],
    isLoading: teacherIdValid ? coursesQuery.isLoading : false,
    isCreating: createCourseMutation.isPending,
    deletingCourseId,
    updatingCourseId,
    error,
    creationDataError,
    createError,
    clearCreateError,
    reload,
    createCourse,
    deleteCourse,
    updateCourse,
    uploadCourseImage,
    removeCourseImage,
  };
}
