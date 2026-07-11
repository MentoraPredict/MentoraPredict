import { useEffect, useMemo, useState } from "react";

import Container from "@/components/atoms/Container";
import Modal from "@/components/molecules/Modal";

import CourseGrid from "@/features/courses/components/CourseGrid";
import CreateCourseForm from "@/features/teachers/components/CreateCourseForm";
import TeacherCoursesEmptyState from "@/features/teachers/components/TeacherCoursesEmptyState";
import TeacherCoursesHeader from "@/features/teachers/components/TeacherCoursesHeader/TeacherCoursesHeader";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { getCourseEnrolledStudents } from "@/services/academic.service";
import { getTeacherSubjectAnalytics } from "@/services/course-analytics.service";

import Text from "@/components/atoms/Text";

import { useNavigate } from "react-router-dom";
import { getTeacherCoursePerformancePath } from "@/routes/paths";

interface TeacherCoursesManagementProps {
  teacherName: string;
  courseState: ReturnType<typeof useTeacherCourses>;
}

export default function TeacherCoursesManagement({
  teacherName,
  courseState,
}: TeacherCoursesManagementProps) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

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
    creationDataError,
    createError,
    clearCreateError,
    createCourse,
    deleteCourse,
  } = courseState;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [courseAnalytics, setCourseAnalytics] = useState<
    Record<
      string,
      {
        average: number;
        riskCounts: {
          low: number;
          medium: number;
          high: number;
        };
      }
    >
  >({});

  const courses = backendCourses;

  const hasCourses = courses.length > 0;
  useEffect(() => {
    let isMounted = true;

    async function loadCourseAnalytics() {
      const syncedCourses = courses.filter((course) => !course.isPendingSync);
      const entries = await Promise.all(
        syncedCourses.map(async (course) => {
          try {
            const [analytics, enrolledStudents] = await Promise.all([
              getTeacherSubjectAnalytics(course.id),
              getCourseEnrolledStudents(course.id),
            ]);
            const averages = enrolledStudents
              .filter((student) => student.isEnrolled && student.average !== null)
              .map((student) => student.average as number);

            return [
              course.id,
              {
                average: averages.length > 0
                  ? averages.reduce((sum, value) => sum + value, 0) / averages.length
                  : 0,
                riskCounts: analytics.riskCounts,
              },
            ] as const;
          } catch {
            return [
              course.id,
              {
                average: course.currentAverage ?? 0,
                riskCounts: { low: 0, medium: 0, high: 0 },
              },
            ] as const;
          }
        })
      );

      if (isMounted) {
        setCourseAnalytics(Object.fromEntries(entries));
      }
    }

    if (courses.length > 0) {
      void loadCourseAnalytics();
    } else {
      setCourseAnalytics({});
    }

    return () => {
      isMounted = false;
    };
  }, [courses]);

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

            {!isOnline ? (
              <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
                <Text variant="small" className="font-medium text-amber-700">
                  Sin conexión — los cambios se sincronizarán automáticamente cuando vuelva
                  internet.
                </Text>
              </div>
            ) : null}

            {error ? (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
                <Text variant="small" className="font-medium text-red-700">
                  {error}
                </Text>
              </div>
            ) : null}

            {creationDataError ? (
              <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
                <Text variant="small" className="font-medium text-amber-700">
                  {creationDataError}
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
                showTeacherDetails={false}
                getCourseMetrics={(course) => {
                  const analytics = courseAnalytics[course.id];

                  return {
                    averageLabel: analytics
                      ? `${analytics.average.toFixed(2)} / 20`
                      : "Sin datos",
                    enrolledCount: course.enrolledCount ?? 0,
                  };
                }}
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

      <Modal
        isOpen={isCreateModalOpen}
        ariaLabel="Crear curso"
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
      >
        <CreateCourseForm
          availableStudents={students}
          faculties={faculties}
          careers={careers}
          periods={periods}
          teacherName={teacherName}
          isSubmitting={isCreating}
          errorMessage={createError}
          onCancel={() => {
            setIsCreateModalOpen(false);
            clearCreateError();
          }}
          onCreateCourse={(coursePayload, studentIds) => {
            createCourse(coursePayload, studentIds);
            setIsCreateModalOpen(false);
          }}
        />
      </Modal>
    </>
  );
}
