import { useMemo, useState } from "react";

import Container from "@/components/atoms/Container";

import CourseGrid from "@/features/courses/components/CourseGrid";
import CreateCourseForm from "@/features/teachers/components/CreateCourseForm";
import CreateCourseModal from "@/features/teachers/components/CreateCourseModal";
import TeacherCoursesEmptyState from "@/features/teachers/components/TeacherCoursesEmptyState";
import TeacherCoursesHeader from "@/features/teachers/components/TeacherCoursesHeader/TeacherCoursesHeader";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";

import { useAuthStore } from "@/store/auth.store";
import Text from "@/components/atoms/Text";

import { useNavigate } from "react-router-dom";
import { getTeacherCoursePerformancePath } from "@/routes/paths";

export default function TeacherCoursesManagement() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const teacherName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");

    return fullName || user?.email || "Docente";
  }, [user]);

  const {
    courses: backendCourses,
    faculties,
    careers,
    periods,
    students,
    isLoading,
    isCreating,
    deletingCourseId,
    error,
    createCourse,
    deleteCourse,
  } = useTeacherCourses(user?.id, teacherName);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const courses = backendCourses;

  const hasCourses = courses.length > 0;

  const handleDeleteCourse = async (courseId: string) => {
    await deleteCourse(courseId);
    setIsDeleteMode(false);
  };

  return (
    <>
      <section className="py-8">
        <Container>
          <div
            className="
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            p-6
                        "
          >
            <TeacherCoursesHeader
              hasCourses={hasCourses}
              isDeleteMode={isDeleteMode}
              onOpenCreateModal={() => {
                setIsCreateModalOpen(true);
              }}
              onEnableDeleteMode={() => {
                setIsDeleteMode(true);
              }}
              onCancelDeleteMode={() => {
                setIsDeleteMode(false);
              }}
            />

            {error ? (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
                <Text variant="small" className="font-medium text-red-700">
                  {error}
                </Text>
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                <Text variant="small">Cargando cursos...</Text>
              </div>
            ) : hasCourses ? (
              <CourseGrid
                courses={courses}
                isDeleteMode={isDeleteMode}
                deletingCourseId={deletingCourseId}
                onCourseClick={(courseId) => {
                  navigate(getTeacherCoursePerformancePath(courseId));
                }}
                onDeleteCourse={handleDeleteCourse}
                onCancelDeleteMode={() => {
                  setIsDeleteMode(false);
                }}
              />
            ) : (
              <TeacherCoursesEmptyState
                onCreateCourse={() => {
                  setIsCreateModalOpen(true);
                }}
              />
            )}
          </div>
        </Container>
      </section>

      <CreateCourseModal isOpen={isCreateModalOpen}>
        <CreateCourseForm
          availableStudents={students}
          faculties={faculties}
          careers={careers}
          periods={periods}
          teacherName={teacherName}
          isSubmitting={isCreating}
          onCancel={() => {
            setIsCreateModalOpen(false);
          }}
          onCreateCourse={async (coursePayload, studentIds) => {
            const createdCourse = await createCourse(coursePayload, studentIds);

            if (createdCourse) {
              setIsCreateModalOpen(false);
            }

            return createdCourse;
          }}
        />
      </CreateCourseModal>
    </>
  );
}
