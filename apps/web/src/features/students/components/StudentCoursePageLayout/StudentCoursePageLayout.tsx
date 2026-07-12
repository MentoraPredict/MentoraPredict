import { useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";

import Text from "@/components/atoms/Text";
import CourseActionsToolbar from "@/features/courses/components/CourseActionsToolbar";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import useStudentCourses from "@/hooks/queries/useStudentCourses";

import type { Course } from "@/types/course";

export interface StudentCoursePageContext {
  course: Course;
}

export default function StudentCoursePageLayout() {
  const { courseId } = useParams();
  const { courses, isLoading, error } = useStudentCourses();

  const activeCourse = useMemo(
    () =>
      courses.find((course) => course.id === courseId) ?? courses[0] ?? null,
    [courseId, courses],
  );

  const activeCourseId = activeCourse?.id ?? courseId ?? "";
  const title = activeCourse
    ? `${activeCourse.name} - Estudiante`
    : "Curso - Estudiante";

  return (
    <CourseAnalyticsLayout
      title={title}
      sidebar={
        <CourseSidebar
          mode="student"
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
          <CourseActionsToolbar mode="student" courseId={activeCourse.id} />

          <Outlet context={{ course: activeCourse } satisfies StudentCoursePageContext} />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">No se encontro el curso seleccionado.</Text>
        </div>
      )}
    </CourseAnalyticsLayout>
  );
}
