import { ReactNode, useMemo } from "react";
import {
  FiBarChart2,
  FiEdit3,
  FiGrid,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import Text from "@/components/atoms/Text";
import CourseAnalyticsLayout from "@/features/courses/components/CourseAnalyticsLayout";
import CourseSidebar from "@/features/courses/components/CourseSidebar";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import { useAuthStore } from "@/store/auth.store";
import type { UpdateTeacherCoursePayload } from "@/services/academic.service";
import {
  APP_PATHS,
  getTeacherCourseEditPath,
  getTeacherCoursePerformancePath,
  getTeacherCourseStudentsPath,
  getTeacherCourseUploadDataPath,
} from "@/routes/paths";

import type { Course } from "@/types/course";

interface TeacherCoursePageLayoutProps {
  courseId?: string;
  children:
    | ReactNode
    | ((course: Course, actions: TeacherCoursePageActions) => ReactNode);
}

interface TeacherCoursePageActions {
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
}

function getTeacherDisplayName(
  user: ReturnType<typeof useAuthStore.getState>["user"],
) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return fullName || user?.email || "Docente";
}

function TeacherCourseActionsToolbar({ courseId }: { courseId: string }) {
  const actions = [
    {
      to: APP_PATHS.teacher.courses,
      label: "Panel docente",
      icon: <FiGrid size={16} />,
      end: true,
    },
    {
      to: getTeacherCoursePerformancePath(courseId),
      label: "Rendimiento",
      icon: <FiBarChart2 size={16} />,
    },
    {
      to: getTeacherCourseUploadDataPath(courseId),
      label: "Subir datos",
      icon: <FiUploadCloud size={16} />,
    },
    {
      to: getTeacherCourseStudentsPath(courseId),
      label: "Estudiantes",
      icon: <FiUsers size={16} />,
    },
    {
      to: getTeacherCourseEditPath(courseId),
      label: "Editar curso",
      icon: <FiEdit3 size={16} />,
    },
  ];

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-max gap-2">
        {actions.map((action) => (
          <NavLink
            key={action.to}
            to={action.to}
            end={action.end}
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")
            }
          >
            {action.icon}
            {action.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function TeacherCoursePageLayout({
  courseId,
  children,
}: TeacherCoursePageLayoutProps) {
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
          <TeacherCourseActionsToolbar courseId={activeCourse.id} />

          {typeof children === "function"
            ? children(activeCourse, {
                updateCourse,
                updatingCourseId,
                uploadCourseImage,
                removeCourseImage,
              })
            : children}
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">No se encontro el curso seleccionado.</Text>
        </div>
      )}
    </CourseAnalyticsLayout>
  );
}
