import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiBookOpen,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";
import { AxiosError } from "axios";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import UserAvatar from "@/components/atoms/UserAvatar";
import ListToolbar from "@/components/molecules/ListToolbar";

import AiRecommendationPanel from "@/features/courses/components/AiRecommendationPanel";
import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentAttendanceReport from "@/features/students/components/StudentAttendanceReport";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";
import StudentCoursesTable from "@/features/students/components/StudentCoursesTable";
import StudentResultsReport from "@/features/students/components/StudentResultsReport";

import DashboardMetricCard, {
  type DashboardMetric,
} from "@/features/dashboard/components/DashboardMetricCard";
import useStudentAttendance from "@/features/students/hooks/useStudentAttendance";
import { getAverageTone, getCountTone } from "@/features/dashboard/utils/metricTone";
import {
  courseRiskRank,
  getRiskPresentation,
  isAtRiskLevel,
} from "@/features/dashboard/utils/riskLevelPresentation";

import { getStudentCoursePerformancePath } from "@/routes/paths";
import {
  getLatestAiPrediction,
  getStudentSubjectsOverview,
  requestAiPrediction,
  type AiPrediction,
  type StudentSubjectOverview,
} from "@/services/course-analytics.service";
import { getActiveAcademicPeriod } from "@/services/student-performance.service";
import { useAuthStore } from "@/store/auth.store";
import type { Course, CourseAlert } from "@/types/course";
import { MAX_GRADE } from "@/utils/gradeScale";

interface DashboardAlert extends CourseAlert {
  courseId: string;
  courseName: string;
}

interface StudentCoursesManagementProps {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<Course[]>;
}

type DashboardTab = "courses" | "grades" | "attendance" | "overview";

const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: typeof FiGrid }[] = [
  { id: "courses", label: "Materias matriculadas", icon: FiBookOpen },
  { id: "grades", label: "Mis calificaciones", icon: FiTrendingUp },
  { id: "attendance", label: "Mi asistencia", icon: FiUserCheck },
  { id: "overview", label: "Panel principal", icon: FiGrid },
];

const RISK_FILTER_LEVELS = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"] as const;

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function getRiskDerivedAlerts(courses: Course[]): DashboardAlert[] {
  return courses.filter((course) => isAtRiskLevel(course.riskLevel)).map((course) => ({
    id: `risk-${course.id}`,
    courseId: course.id,
    courseName: course.name,
    severity: course.riskLevel as "HIGH" | "MEDIUM" | "CRITICAL",
    message: `${course.name}: ${getRiskPresentation(course.riskLevel).label}. Revisa el rendimiento y registra tu avance semanal.`,
  }));
}

export default function StudentCoursesManagement({
  courses,
  isLoading,
  error,
  reload,
}: StudentCoursesManagementProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const dashboardTab: DashboardTab =
    DASHBOARD_TABS.find((tab) => tab.id === tabParam)?.id ?? "courses";
  const setDashboardTab = (tab: DashboardTab) =>
    setSearchParams(tab === "courses" ? {} : { tab }, { replace: true });
  const [coursesView, setCoursesView] = useState<"cards" | "list">("cards");
  const [courseSearch, setCourseSearch] = useState("");
  const [courseRiskFilter, setCourseRiskFilter] = useState("");
  const [coursePeriodFilter, setCoursePeriodFilter] = useState("");
  const [overview, setOverview] = useState<StudentSubjectOverview[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<AiPrediction | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadInsights = useCallback(async (studentCourses: Course[]) => {
    if (studentCourses.length === 0) {
      setOverview([]);
      setInsightsError(null);
      return;
    }

    setIsLoadingInsights(true);
    setInsightsError(null);

    try {
      setOverview(await getStudentSubjectsOverview());
    } catch {
      setInsightsError(
        "No se pudo actualizar la analítica predictiva de tus materias."
      );
    } finally {
      setIsLoadingInsights(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void loadInsights(courses);
    }
  }, [courses, isLoading, loadInsights]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isCancelled = false;
    setIsLoadingAi(true);

    getLatestAiPrediction(user.id)
      .then((prediction) => {
        if (!isCancelled) {
          setAiPrediction(prediction);
        }
      })
      .catch(() => {
        // Best-effort preload — the student can still generate a fresh one.
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingAi(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  const handleGenerateAiPrediction = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const activePeriod = await getActiveAcademicPeriod();
      const prediction = await requestAiPrediction(activePeriod.id);
      setAiPrediction(prediction);
    } catch (requestError) {
      if (
        requestError instanceof AxiosError &&
        requestError.response?.status === 429
      ) {
        setAiError(
          (requestError.response.data as { message?: string })?.message ??
            "Ya generaste una recomendación recientemente. Inténtalo más tarde."
        );
      } else {
        setAiError(
          "No se pudo generar la recomendación con IA. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const dashboard = useMemo(() => {
    const averages = courses
      .map((course) => course.currentAverage)
      .filter((average): average is number => typeof average === "number");

    const contextCourse = courses.find(
      (course) => course.semester
    );

    return {
      activeCourses: courses.length,
      globalAverage:
        averages.length > 0
          ? averages.reduce((total, average) => total + average, 0) /
            averages.length
          : null,
      coursesAtRisk: courses.filter((course) => isAtRiskLevel(course.riskLevel))
        .length,
      periodName: contextCourse?.semester ?? "Periodo no registrado",
    };
  }, [courses]);

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => courseRiskRank(b.riskLevel) - courseRiskRank(a.riskLevel)
      ),
    [courses]
  );

  const periodOptions = useMemo(
    () =>
      [...new Set(courses.map((course) => course.semester).filter(Boolean))]
        .sort()
        .map((period) => ({ value: period, label: period })),
    [courses]
  );

  const visibleCourses = useMemo(() => {
    const terms = normalizeText(courseSearch).split(/\s+/).filter(Boolean);

    return sortedCourses.filter((course) => {
      if (courseRiskFilter && course.riskLevel !== courseRiskFilter) return false;
      if (coursePeriodFilter && course.semester !== coursePeriodFilter) return false;

      const haystack = normalizeText(
        [course.name, course.code, course.teacherName, course.description]
          .filter(Boolean)
          .join(" ")
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [sortedCourses, courseSearch, courseRiskFilter, coursePeriodFilter]);


  const attendanceReport = useStudentAttendance(user?.id);
  const attendanceTotals = useMemo(() => {
    const courseRows = attendanceReport.data?.courses ?? [];
    const held = courseRows.reduce((sum, row) => sum + row.summary.held, 0);
    const absences = courseRows.reduce((sum, row) => sum + row.summary.absences, 0);

    return {
      held,
      rate: held > 0 ? Math.round(((held - absences) / held) * 100) : null,
    };
  }, [attendanceReport.data]);

  const dashboardAlerts = useMemo<DashboardAlert[]>(() => {
    const backendAlerts = overview.flatMap((subject): DashboardAlert[] => {
      const course = coursesById.get(subject.subjectId);
      if (!course) return [];

      return subject.alerts.map((alert) => ({
        id: alert.id,
        message: alert.message,
        severity: alert.severity ?? "LOW",
        courseId: course.id,
        courseName: course.name,
      }));
    });

    return backendAlerts.length > 0
      ? backendAlerts
      : getRiskDerivedAlerts(courses);
  }, [courses, coursesById, overview]);

  const studentName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Estudiante";

  const globalAverageMetric: DashboardMetric = {
    label: "Promedio general",
    value:
      dashboard.globalAverage === null ? "--" : `${dashboard.globalAverage.toFixed(2)} / ${MAX_GRADE}`,
    tone: getAverageTone(dashboard.globalAverage),
  };

  const attendanceMetric: DashboardMetric = {
    label: "Asistencia",
    value: attendanceTotals.rate === null ? "--" : `${attendanceTotals.rate}%`,
    tone: getAverageTone(
      attendanceTotals.rate === null ? null : attendanceTotals.rate / 10
    ),
    isLoading: attendanceReport.isLoading,
  };
  const comprehensionValues = overview
    .map((subject) => subject.comprehensionAvg)
    .filter((value): value is number => typeof value === "number");
  const comprehensionAverage =
    comprehensionValues.length > 0
      ? Math.round(
          comprehensionValues.reduce((sum, value) => sum + value, 0) /
            comprehensionValues.length,
        )
      : null;

  const comprehensionMetric: DashboardMetric = {
    label: "Comprensión",
    value: comprehensionAverage === null ? "--" : `${comprehensionAverage}%`,
    tone: getAverageTone(
      comprehensionAverage === null ? null : comprehensionAverage / 10,
    ),
    isLoading: isLoadingInsights,
  };
  const alertsMetric: DashboardMetric = {
    label: "Alertas académicas",
    value: dashboardAlerts.length.toString(),

    tone: getCountTone(dashboardAlerts.length),
    onClick: () => {
      setShowAlerts((current) => !current);
    },
  };

  const handleRefresh = async () => {
    const loadedCourses = await reload();
    await loadInsights(loadedCourses);
  };

  return (
    <section className="bg-neutral-50 py-8">
      <Container>
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div>
              <div className="space-y-5 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    imageUrl={user?.avatarUrl ?? undefined}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    className="h-14 w-14"
                  />
                  <div>
                    <Heading as="h3" className="text-gray-900">
                      Hola, {studentName}
                    </Heading>
                    {user?.email ? (
                      <Text variant="small" className="mt-1 text-gray-500">
                        {user.email}
                      </Text>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Badge className="w-fit bg-gray-100 text-gray-700">
                    {dashboard.periodName}
                  </Badge>
                </div>
              </div>

            </div>
          </div>

          <div className="overflow-x-auto border-b border-gray-200">
            <div className="flex min-w-max gap-2">
              {DASHBOARD_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDashboardTab(id)}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
                    dashboardTab === id
                      ? "border-blue-700 text-blue-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {dashboardTab === "grades" ? (
            <StudentResultsReport studentId={user?.id} showStudentName={false} />
          ) : null}

          {dashboardTab === "attendance" ? (
            <StudentAttendanceReport studentId={user?.id} showStudentName={false} />
          ) : null}
          {dashboardTab === "courses" ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                    />
                  ))}
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-5">
                  <ListToolbar
                    search={courseSearch}
                    searchPlaceholder="Buscar por materia, código o docente"
                    onSearchChange={setCourseSearch}
                    filters={[
                      {
                        id: "course-risk",
                        label: "Nivel de riesgo",
                        value: courseRiskFilter,
                        allLabel: "Todos los niveles",
                        options: RISK_FILTER_LEVELS.map((level) => ({
                          value: level,
                          label: getRiskPresentation(level).label,
                        })),
                        onChange: setCourseRiskFilter,
                      },
                      {
                        id: "course-period",
                        label: "Periodo",
                        value: coursePeriodFilter,
                        allLabel: "Todos los periodos",
                        options: periodOptions,
                        onChange: setCoursePeriodFilter,
                      },
                    ]}
                    onClear={() => {
                      setCourseSearch("");
                      setCourseRiskFilter("");
                      setCoursePeriodFilter("");
                    }}
                    actions={
                      <div
                        role="group"
                        aria-label="Tipo de vista"
                        className="inline-flex h-12 overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        {(
                          [
                            { value: "cards", label: "Tarjetas", icon: FiGrid },
                            { value: "list", label: "Lista", icon: FiList },
                          ] as const
                        ).map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={coursesView === value}
                            title={label}
                            onClick={() => setCoursesView(value)}
                            className={`inline-flex items-center gap-2 px-4 text-sm font-medium transition ${
                              coursesView === value
                                ? "bg-blue-700 text-white"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <Icon size={16} aria-hidden="true" />
                            <span className="hidden sm:inline">{label}</span>
                          </button>
                        ))}
                      </div>
                    }
                  />

                  {visibleCourses.length === 0 ? (
                    <Text variant="small" className="text-gray-600">
                      Ninguna materia coincide con la búsqueda o los filtros.
                    </Text>
                  ) : coursesView === "cards" ? (
                    <CourseGrid
                      courses={visibleCourses}
                      onCourseClick={(courseId) => {
                        navigate(getStudentCoursePerformancePath(courseId));
                      }}

                    />
                  ) : (
                    <StudentCoursesTable
                      courses={visibleCourses}
                      onCourseClick={(courseId) => {
                        navigate(getStudentCoursePerformancePath(courseId));
                      }}

                    />
                  )}
                </div>              ) : (
                <StudentCoursesEmptyState />
              )}
            </div>
          ) : null}

          {dashboardTab === "overview" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard {...globalAverageMetric} />
                <DashboardMetricCard {...attendanceMetric} />
                <DashboardMetricCard {...comprehensionMetric} />
                <DashboardMetricCard {...alertsMetric} />
              </div>

              {showAlerts ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Heading as="h4" className="text-gray-900">
                        Alertas y señales de riesgo
                      </Heading>
                      <Text variant="small" className="mt-2 text-gray-600">
                        Detalle por materia a partir de tus notas y asistencia.
                      </Text>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        void handleRefresh();
                      }}
                      disabled={isLoadingInsights}
                      className="gap-2 px-5 py-2 text-sm"
                    >
                      <FiRefreshCw size={16} />
                      Recargar
                    </Button>
                  </div>

                  {dashboardAlerts.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {dashboardAlerts.map((alert) => (
                        <button
                          key={alert.id}
                          type="button"
                          onClick={() => {
                            navigate(getStudentCoursePerformancePath(alert.courseId));
                          }}
                          className={`rounded-xl border p-4 text-left transition hover:shadow-sm ${
                            alert.severity === "CRITICAL" || alert.severity === "HIGH"
                              ? "border-red-200 bg-red-50 text-red-800"
                              : alert.severity === "MEDIUM"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          <Text variant="caption" className="font-bold uppercase">
                            {alert.courseName}
                          </Text>
                          <Text variant="small" className="mt-2 text-current">
                            {alert.message}
                          </Text>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Text variant="small" className="text-gray-600">
                      No hay alertas activas con la información disponible.
                    </Text>
                  )}
                </div>
              ) : null}

              <AiRecommendationPanel
                title="Recomendación con IA"
                description="Generada a partir de tu información académica actual"
                prediction={aiPrediction}
                isLoading={isLoadingAi}
                isGenerating={isGeneratingAi}
                error={aiError}
                emptyMessage="Aún no has generado una recomendación con IA. Presiona el botón para generar una basada en tu información académica actual."
                onGenerate={() => {
                  void handleGenerateAiPrediction();
                }}
              />
            </>
          ) : null}

          {error || insightsError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <FeedbackMessage message={error ?? insightsError ?? ""} tone="error" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
