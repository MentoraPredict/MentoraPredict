import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

import Container from "@/components/atoms/Container";
import Modal from "@/components/molecules/Modal";

import CourseGrid from "@/features/courses/components/CourseGrid";
import CreateCourseForm from "@/features/teachers/components/CreateCourseForm";
import TeacherCoursesEmptyState from "@/features/teachers/components/TeacherCoursesEmptyState";
import TeacherCoursesHeader from "@/features/teachers/components/TeacherCoursesHeader/TeacherCoursesHeader";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { getSubjectMetricsSummary } from "@/services/course-analytics.service";

import DashboardMetricCard, {
  type DashboardMetric,
} from "@/features/dashboard/components/DashboardMetricCard";
import useTeacherDashboardKpis from "@/features/dashboard/hooks/useTeacherDashboardKpis";
import { computeTeacherRealMetrics } from "@/features/dashboard/utils/computeTeacherRealMetrics";
import { getAverageTone, getCountTone } from "@/features/dashboard/utils/metricTone";
import { courseRiskRank } from "@/features/dashboard/utils/riskLevelPresentation";

import Text from "@/components/atoms/Text";

import { useNavigate } from "react-router-dom";
import { getTeacherCoursePerformancePath } from "@/routes/paths";

interface TeacherCoursesManagementProps {
  teacherName: string;
  courseState: ReturnType<typeof useTeacherCourses>;
}

const courseTrendLabel: Record<"ASCENDING" | "STABLE" | "DESCENDING", string> = {
  ASCENDING: "Ascendente",
  STABLE: "Estable",
  DESCENDING: "Descendente",
};

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
          critical: number;
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
      // subjects/:id/metrics/summary already computes both the course
      // average and the risk-count distribution server-side — this used to
      // additionally fetch progress/alerts/predictions (unused here, that's
      // for the course detail page) plus the full enrolled-students list
      // just to recompute this same average client-side.
      const entries = await Promise.all(
        syncedCourses.map(async (course) => {
          try {
            const summary = await getSubjectMetricsSummary(course.id);

            return [
              course.id,
              {
                average: summary.averageGrade ?? 0,
                riskCounts: {
                  low: summary.LOW,
                  medium: summary.MEDIUM,
                  high: summary.HIGH,
                  critical: summary.CRITICAL,
                },
              },
            ] as const;
          } catch {
            return [
              course.id,
              {
                average: course.currentAverage ?? 0,
                riskCounts: { low: 0, medium: 0, high: 0, critical: 0 },
              },
            ] as const;
          }
        }),
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

  const realMetrics = useMemo(
    () => computeTeacherRealMetrics(courses, courseAnalytics),
    [courses, courseAnalytics]
  );

  const teacherKpis = useTeacherDashboardKpis(courses);

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => courseRiskRank(b.riskLevel) - courseRiskRank(a.riskLevel)
      ),
    [courses]
  );

  const dashboardMetrics: DashboardMetric[] = [
    {
      label: "Promedio general",
      value:
        realMetrics.averageAcrossCourses === null
          ? "--"
          : realMetrics.averageAcrossCourses.toFixed(2),
      hint: "Escala 0-20, promedio entre tus materias",
      icon: FiTrendingUp,
      tone: getAverageTone(realMetrics.averageAcrossCourses),
    },
    {
      label: "Asistencia promedio",
      value: teacherKpis.mocked.data
        ? `${teacherKpis.mocked.data.averageAttendanceAcrossCourses}%`
        : "--",
      hint: "Combina registro docente y autorreporte",
      icon: FiCalendar,
      tone: getAverageTone(
        teacherKpis.mocked.data
          ? teacherKpis.mocked.data.averageAttendanceAcrossCourses / 5
          : null
      ),
      isMocked: true,
      isLoading: teacherKpis.mocked.isLoading,
    },
    {
      label: "Riesgo de deserción estimado",
      value: teacherKpis.mocked.data
        ? teacherKpis.mocked.data.studentsAtDropoutRisk.toString()
        : "--",
      hint: "Estudiantes con estimación preliminar de riesgo",
      icon: FiTrendingDown,
      tone: getCountTone(teacherKpis.mocked.data?.studentsAtDropoutRisk ?? 0),
      isMocked: true,
      isLoading: teacherKpis.mocked.isLoading,
    },
    {
      label: "Tendencia de tus cursos",
      value: courseTrendLabel[teacherKpis.mocked.data?.courseTrend ?? "STABLE"],
      hint: "Comparado con la clasificación de riesgo actual",
      icon:
        teacherKpis.mocked.data?.courseTrend === "DESCENDING"
          ? FiTrendingDown
          : FiTrendingUp,
      tone:
        teacherKpis.mocked.data?.courseTrend === "DESCENDING"
          ? "danger"
          : teacherKpis.mocked.data?.courseTrend === "ASCENDING"
            ? "success"
            : "neutral",
      isMocked: true,
      isLoading: teacherKpis.mocked.isLoading,
    },
  ];

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

            {!isLoading && hasCourses ? (
              <div className="mb-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardMetrics.map((metric) => (
                    <DashboardMetricCard key={metric.label} {...metric} />
                  ))}
                </div>
              </div>
            ) : null}

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
                courses={sortedCourses}
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
