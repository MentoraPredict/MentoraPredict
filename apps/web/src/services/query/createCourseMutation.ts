import type { QueryClient } from "@tanstack/react-query";

import {
  createTeacherCourse,
  enrollStudentsInCourse,
  type CreateTeacherCoursePayload,
} from "@/services/academic.service";
import type { Course } from "@/types/course";

import { mutationKeys } from "./mutationKeys";
import { queryKeys } from "./queryKeys";

export interface CreateCourseMutationVariables {
  payload: Omit<CreateTeacherCoursePayload, "teacherId" | "teacherName">;
  studentIds: string[];
  teacherId: string;
  teacherName?: string;
  tempId: string;
}

export interface CreateCourseMutationResult {
  course: Course;
  failedStudentIds: string[];
}

interface CreateCourseMutationContext {
  previousCourses?: Course[];
}

// Thrown when the course itself was created successfully but the follow-up
// enrollment call couldn't even complete (e.g. connection dropped between the
// two requests) — the course is real and must not be rolled back, but the
// failure still needs to surface distinctly from a full creation failure.
export class PartialCourseCreationError extends Error {
  constructor(
    public readonly course: Course,
    public readonly failedStudentIds: string[]
  ) {
    super("El curso se creo, pero no se pudo completar la matricula de estudiantes.");
    this.name = "PartialCourseCreationError";
  }
}

async function createCourseMutationFn(
  variables: CreateCourseMutationVariables
): Promise<CreateCourseMutationResult> {
  const course = await createTeacherCourse({
    ...variables.payload,
    teacherId: variables.teacherId,
    teacherName: variables.teacherName,
  });

  if (variables.studentIds.length === 0) {
    return { course, failedStudentIds: [] };
  }

  try {
    const failedStudentIds = await enrollStudentsInCourse(course.id, variables.studentIds);
    return { course, failedStudentIds };
  } catch {
    throw new PartialCourseCreationError(course, variables.studentIds);
  }
}

function buildOptimisticCourse(variables: CreateCourseMutationVariables): Course {
  return {
    id: variables.tempId,
    name: variables.payload.name,
    teacherName: variables.teacherName ?? "",
    semester: "",
    description: variables.payload.description,
    riskLevel: "UNKNOWN",
    credits: variables.payload.credits,
    careerId: variables.payload.careerId,
    enrolledCount: variables.studentIds.length,
    isPendingSync: true,
  };
}

export function registerCreateCourseMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(mutationKeys.createCourse, {
    mutationFn: createCourseMutationFn,
    onMutate: async (variables: CreateCourseMutationVariables) => {
      const queryKey = queryKeys.teacherCourses(variables.teacherId);
      await queryClient.cancelQueries({ queryKey });

      const previousCourses = queryClient.getQueryData<Course[]>(queryKey);
      queryClient.setQueryData<Course[]>(queryKey, (current = []) => [
        ...current,
        buildOptimisticCourse(variables),
      ]);

      const context: CreateCourseMutationContext = { previousCourses };
      return context;
    },
    onError: (
      error: unknown,
      variables: CreateCourseMutationVariables,
      context: CreateCourseMutationContext | undefined
    ) => {
      const queryKey = queryKeys.teacherCourses(variables.teacherId);

      if (error instanceof PartialCourseCreationError) {
        queryClient.setQueryData<Course[]>(queryKey, (current = []) =>
          current.map((course) =>
            course.id === variables.tempId ? { ...error.course, isPendingSync: false } : course
          )
        );
        return;
      }

      if (context?.previousCourses) {
        queryClient.setQueryData(queryKey, context.previousCourses);
      }
    },
    onSuccess: (
      data: CreateCourseMutationResult,
      variables: CreateCourseMutationVariables
    ) => {
      const queryKey = queryKeys.teacherCourses(variables.teacherId);

      queryClient.setQueryData<Course[]>(queryKey, (current = []) =>
        current.map((course) =>
          course.id === variables.tempId ? { ...data.course, isPendingSync: false } : course
        )
      );
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
