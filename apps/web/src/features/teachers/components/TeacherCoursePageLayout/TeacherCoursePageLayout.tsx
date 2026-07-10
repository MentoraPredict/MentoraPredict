import { useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";

import Text from "@/components/atoms/Text";
import CourseActionsToolbar from "@/features/courses/components/CourseActionsToolbar";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import { useAuthStore } from "@/store/auth.store";
import type { UpdateTeacherCoursePayload } from "@/services/academic.service";

import type { Course } from "@/types/course";

export interface TeacherCoursePageContext {
  course: Course;
  actions: {
    updateCourse: (
      courseId: string,
      payload: UpdateTeacherCoursePayload,
    ) => Promise<void>;
    updatingCourseId: string | null;
    uploadCourseImage: (
      courseId: string,
      file: File,
    ) => Promise<string | undefined>;
    removeCourseImage: (courseId: string) => Promise<void>;
  };
}

function getTeacherDisplayName(
  user: ReturnType<typeof useAuthStore.getState>["user"],
) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return fullName || user?.email || "Docente";
}

export default function TeacherCoursePageLayout() {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  const teacherName = useMemo(() => getTeacherDisplayName(user), [user]);

  const {
    courses,
    isLoading,
    error,
    updateCourse,
    updatingCourseId,
    uploadCourseImage,
    removeCourseImage,
  } = useTeacherCourses(user?.id, teacherName);

  const activeCourse = useMemo(
    () =>
      courses.find((course) => course.id === courseId) ?? courses[0] ?? null,
    [courseId, courses],
  );

  const activeCourseId = activeCourse?.id ?? courseId ?? "";
  const title = activeCourse
    ? `${activeCourse.name} - Docente`
    : "Curso - Docente";

  return (
    <CourseAnalyticsLayout
      title={title}
      sidebar={
        <CourseSidebar
          mode="teacher"
          courses={courses}
          activeCourseId={activeCourseId}
        />
      }
    >
      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando curso...</Text>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : activeCourse ? (
        <>
          <CourseActionsToolbar mode="teacher" courseId={activeCourse.id} />

          <Outlet
            context={
              {
                course: activeCourse,
                actions: {
                  updateCourse,
                  updatingCourseId,
                  uploadCourseImage,
                  removeCourseImage,
                },
              } satisfies TeacherCoursePageContext
            }
          />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">No se encontro el curso seleccionado.</Text>
        </div>
      )}
    </CourseAnalyticsLayout>
  );
}
