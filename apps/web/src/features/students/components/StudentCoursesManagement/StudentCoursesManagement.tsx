import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiBookOpen,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";

import {
  getStudentCoursePerformancePath,
  getStudentCourseUploadDataPath,
} from "@/routes/paths";
import {
  getStudentSubjectAnalytics,
  type StudentSubjectAnalytics,
} from "@/services/course-analytics.service";
import { useAuthStore } from "@/store/auth.store";
import type { Course, CourseAlert, CourseRecommendation } from "@/types/course";

const riskLabels = {
  HIGH: "Alta prioridad",
  MEDIUM: "Seguimiento",
  LOW: "Estable",
  UNKNOWN: "Sin datos",
};

const riskStyles = {
  HIGH: "border-red-200 bg-red-50 text-red-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  UNKNOWN: "border-gray-200 bg-gray-50 text-gray-700",
};

const metricToneStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-gray-200 bg-gray-50 text-gray-700",
};

type MetricTone = keyof typeof metricToneStyles;

interface CourseInsight {
  course: Course;
  analytics: StudentSubjectAnalytics;
}

interface DashboardAlert extends CourseAlert {
  courseId: string;
  courseName: string;
}

interface DashboardRecommendation extends CourseRecommendation {
  courseId: string;
  courseName: string;
}

interface DashboardPrediction {
  courseId: string;
  courseName: string;
  status: string;
  predictedRiskLevel: string;
  trendSlope: string;
  computedAt: string;
  message: string;
}

interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
  tone: MetricTone;
  onClick?: () => void;
}

interface StudentCoursesManagementProps {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<Course[]>;
}

function getAcademicStatus(coursesAtRisk: number, globalAverage: number | null) {
  if (coursesAtRisk > 0) {
    return {
      label: "Seguimiento requerido",
      description:
        "Hay materias que necesitan revision temprana para evitar acumulacion de riesgo.",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  if (globalAverage !== null && globalAverage >= 8.5) {
    return {
      label: "Rendimiento destacado",
      description:
        "Tu desempeno general se mantiene en un rango solido para el periodo actual.",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  return {
    label: "Progreso estable",
    description:
      "Continua registrando tus avances para que el sistema detecte cambios a tiempo.",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  };
}

function getAverageTone(average: number | null): MetricTone {
  if (average === null) return "neutral";
  if (average >= 8) return "success";
  if (average >= 7) return "warning";
  return "danger";
}

function getAlertTone(alertCount: number): MetricTone {
  if (alertCount === 0) return "success";
  if (alertCount <= 2) return "warning";
  return "danger";
}

function getRiskDerivedAlerts(courses: Course[]): DashboardAlert[] {
  return courses
    .filter((course) => ["HIGH", "MEDIUM"].includes(course.riskLevel))
    .map((course) => ({
      id: `risk-${course.id}`,
      courseId: course.id,
      courseName: course.name,
      severity: course.riskLevel === "HIGH" ? "HIGH" : "MEDIUM",
      message: `${course.name}: ${riskLabels[course.riskLevel]}. Revisa el rendimiento y registra tu avance semanal.`,
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
  const [insights, setInsights] = useState<CourseInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const loadInsights = useCallback(async (studentCourses: Course[]) => {
    if (studentCourses.length === 0) {
      setInsights([]);
      setInsightsError(null);
      return;
    }

    setIsLoadingInsights(true);
    setInsightsError(null);

    try {
      const loadedInsights = await Promise.all(
        studentCourses.map(async (course) => ({
          course,
          analytics: await getStudentSubjectAnalytics(course.id),
        }))
      );
      setInsights(loadedInsights);
    } catch {
      setInsightsError(
        "No se pudo actualizar la analitica predictiva de tus materias."
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

  const dashboard = useMemo(() => {
    const averages = courses
      .map((course) => course.currentAverage)
      .filter((average): average is number => typeof average === "number");

    const contextCourse = courses.find(
      (course) => course.facultyName || course.careerName || course.semester
    );

    return {
      activeCourses: courses.length,
      totalCredits: courses.reduce(
        (total, course) => total + (course.credits ?? 0),
        0
      ),
      globalAverage:
        averages.length > 0
          ? averages.reduce((total, average) => total + average, 0) /
            averages.length
          : null,
      coursesAtRisk: courses.filter((course) =>
        ["HIGH", "MEDIUM"].includes(course.riskLevel)
      ).length,
      facultyName: contextCourse?.facultyName ?? "Facultad no registrada",
      careerName: contextCourse?.careerName ?? "Carrera no registrada",
      periodName: contextCourse?.semester ?? "Periodo no registrado",
      nextCourse:
        courses.find((course) => course.riskLevel === "HIGH") ??
        courses.find((course) => course.riskLevel === "MEDIUM") ??
        courses[0] ??
        null,
    };
  }, [courses]);

  const dashboardAlerts = useMemo<DashboardAlert[]>(() => {
    const backendAlerts = insights.flatMap(({ course, analytics }) =>
      analytics.alerts.map((alert) => ({
        ...alert,
        courseId: course.id,
        courseName: course.name,
      }))
    );

    return backendAlerts.length > 0
      ? backendAlerts
      : getRiskDerivedAlerts(courses);
  }, [courses, insights]);

  const dashboardRecommendations = useMemo<DashboardRecommendation[]>(
    () =>
      insights.flatMap(({ course, analytics }) =>
        analytics.recommendations.map((recommendation) => ({
          ...recommendation,
          courseId: course.id,
          courseName: course.name,
        }))
      ),
    [insights]
  );

  const dashboardPredictions = useMemo<DashboardPrediction[]>(
    () =>
      insights.map(({ course, analytics }) => ({
        courseId: course.id,
        courseName: course.name,
        status: analytics.prediction.data?.status ?? analytics.prediction.status,
        predictedRiskLevel:
          analytics.prediction.data?.predictedRiskLevel ?? "Sin clasificar",
        trendSlope:
          analytics.prediction.data?.trendSlope !== null &&
          analytics.prediction.data?.trendSlope !== undefined
            ? analytics.prediction.data.trendSlope.toFixed(2)
            : "Sin tendencia",
        computedAt: analytics.prediction.data?.computedAt
          ? new Intl.DateTimeFormat("es-EC", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(analytics.prediction.data.computedAt))
          : "Sin fecha",
        message: analytics.prediction.message,
      })),
    [insights]
  );

  const weeklyProgress = useMemo(() => {
    const latestPoints = insights
      .map(({ course, analytics }) => {
        const latest = analytics.progress[analytics.progress.length - 1];
        const previous = analytics.progress[analytics.progress.length - 2];

        return {
          course,
          latest: latest?.actual ?? null,
          previous: previous?.actual ?? null,
          weeks: analytics.progress.length,
        };
      })
      .filter((item) => item.latest !== null);

    return latestPoints.slice(0, 4);
  }, [insights]);

  const academicStatus = getAcademicStatus(
    dashboard.coursesAtRisk,
    dashboard.globalAverage
  );
  const studentName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Estudiante";

  const dashboardMetrics: DashboardMetric[] = [
    {
      label: "Materias activas",
      value: dashboard.activeCourses.toString(),
      hint: "Cursos matriculados en el periodo",
      icon: FiBookOpen,
      tone: dashboard.activeCourses > 0 ? "success" : "neutral",
    },
    {
      label: "Promedio general",
      value:
        dashboard.globalAverage === null
          ? "--"
          : dashboard.globalAverage.toFixed(2),
      hint: "Escala 0-10, calculado con materias que reportan notas",
      icon: FiAward,
      tone: getAverageTone(dashboard.globalAverage),
    },
    {
      label: "Alertas academicas",
      value: dashboardAlerts.length.toString(),
      hint: "Presiona para ver detalle por materia",
      icon: FiAlertTriangle,
      tone: getAlertTone(dashboardAlerts.length),
      onClick: () => {
        setShowAlerts((current) => !current);
      },
    },
    {
      label: "Creditos activos",
      value: dashboard.totalCredits > 0 ? dashboard.totalCredits.toString() : "--",
      hint: "Carga academica registrada",
      icon: FiActivity,
      tone: "neutral" as MetricTone,
    },
  ];

  const handleRefresh = async () => {
    const loadedCourses = await reload();
    await loadInsights(loadedCourses);
  };

  return (
    <section className="bg-neutral-50 py-8">
      <Container>
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-5 p-6 md:p-8">
                <Badge className="bg-blue-100 text-blue-700">
                  Panel academico del estudiante
                </Badge>

                <div>
                  <Heading as="h3" className="text-gray-900">
                    Hola, {studentName}
                  </Heading>

                  <Text
                    variant="small"
                    className="mt-2 max-w-2xl text-gray-600"
                  >
                    Revisa tus materias, rendimiento disponible y senales de
                    riesgo para actuar antes de que el periodo avance.
                  </Text>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-gray-100 text-gray-700">
                    {dashboard.facultyName}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700">
                    {dashboard.careerName}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700">
                    {dashboard.periodName}
                  </Badge>
                </div>

                {dashboard.nextCourse ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        navigate(
                          getStudentCoursePerformancePath(
                            dashboard.nextCourse!.id
                          )
                        );
                      }}
                      className="px-5 py-2 text-sm"
                    >
                      Ver materia prioritaria
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigate(
                          getStudentCourseUploadDataPath(
                            dashboard.nextCourse!.id
                          )
                        );
                      }}
                      className="px-5 py-2 text-sm"
                    >
                      Registrar avance semanal
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        void handleRefresh();
                      }}
                      disabled={isLoading || isLoadingInsights}
                      className="px-5 py-2 text-sm"
                    >
                      <FiRefreshCw size={16} />
                      {isLoadingInsights ? "Actualizando" : "Recargar analitica"}
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-gray-200 bg-gray-50 p-6 md:p-8 lg:border-l lg:border-t-0">
                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  Estado academico
                </Text>

                <div
                  className={`mt-4 rounded-2xl border px-5 py-4 ${academicStatus.className}`}
                >
                  <Text variant="small" className="font-bold">
                    {academicStatus.label}
                  </Text>

                  <Text variant="small" className="mt-2">
                    {academicStatus.description}
                  </Text>
                </div>

                {dashboard.nextCourse ? (
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-5 py-4">
                    <Text
                      variant="caption"
                      className="font-bold uppercase text-gray-500"
                    >
                      Materia sugerida
                    </Text>
                    <Text
                      variant="small"
                      className="mt-1 font-semibold text-gray-900"
                    >
                      {dashboard.nextCourse.name}
                    </Text>
                    <Text
                      variant="caption"
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 font-semibold ${riskStyles[dashboard.nextCourse.riskLevel]}`}
                    >
                      {riskLabels[dashboard.nextCourse.riskLevel]}
                    </Text>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <MotionCard
                key={metric.label}
                as="article"
                role={metric.onClick ? "button" : undefined}
                tabIndex={metric.onClick ? 0 : undefined}
                onClick={metric.onClick}
                onKeyDown={(event) => {
                  if (
                    metric.onClick &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    metric.onClick();
                  }
                }}
                className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${metricToneStyles[metric.tone]}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-current">
                  <metric.icon size={20} />
                </div>

                <Text
                  variant="caption"
                  className="font-bold uppercase text-current opacity-75"
                >
                  {metric.label}
                </Text>

                <Heading as="h4" className="mt-2 text-current">
                  {metric.value}
                </Heading>

                <Text variant="small" className="mt-2 text-current opacity-80">
                  {metric.hint}
                </Text>
              </MotionCard>
            ))}
          </div>

          {showAlerts ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Heading as="h4" className="text-gray-900">
                    Alertas y senales de riesgo
                  </Heading>
                  <Text variant="small" className="mt-2 text-gray-600">
                    Detalle generado desde alertas del backend o desde el nivel
                    de riesgo disponible por materia.
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
                  No hay alertas activas con la informacion disponible.
                </Text>
              )}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Heading as="h4" className="text-gray-900">
                    Progreso semanal reciente
                  </Heading>
                  <Text variant="small" className="mt-2 text-gray-600">
                    Ultima nota promedio disponible por materia y comparacion
                    con la semana anterior.
                  </Text>
                </div>
                {isLoadingInsights ? (
                  <Badge className="bg-blue-100 text-blue-700">
                    Actualizando
                  </Badge>
                ) : null}
              </div>

              {weeklyProgress.length > 0 ? (
                <div className="space-y-3">
                  {weeklyProgress.map(({ course, latest, previous, weeks }) => {
                    const delta =
                      latest !== null && previous !== null
                        ? latest - previous
                        : null;
                    const tone =
                      latest === null
                        ? metricToneStyles.neutral
                        : latest >= 8
                          ? metricToneStyles.success
                          : latest >= 7
                            ? metricToneStyles.warning
                            : metricToneStyles.danger;

                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => {
                          navigate(getStudentCoursePerformancePath(course.id));
                        }}
                        className={`grid w-full gap-3 rounded-xl border p-4 text-left md:grid-cols-[1fr_auto] md:items-center ${tone}`}
                      >
                        <div>
                          <Text variant="small" className="font-semibold">
                            {course.name}
                          </Text>
                          <Text variant="caption" className="mt-1">
                            {weeks} semanas de historial disponible
                          </Text>
                        </div>
                        <div className="text-left md:text-right">
                          <Text variant="small" className="font-bold">
                            {latest?.toFixed(2)} / 10
                          </Text>
                          <Text variant="caption">
                            {delta === null
                              ? "Sin comparacion previa"
                              : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} vs semana anterior`}
                          </Text>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Text variant="small" className="text-gray-600">
                  Todavia no hay historial semanal suficiente. Registra tu
                  avance semanal para alimentar la analitica.
                </Text>
              )}
            </div>

            <div className="rounded-2xl border border-cyan-200 bg-blue-50 p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <FiZap size={20} />
                </div>
                <div>
                  <Heading as="h4" className="text-blue-900">
                    Recomendaciones predictivas
                  </Heading>
                  <Text variant="caption" className="text-blue-800">
                    Desde prediction-service
                  </Text>
                </div>
              </div>

              {dashboardRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {dashboardRecommendations.slice(0, 3).map((recommendation) => (
                    <button
                      key={recommendation.id}
                      type="button"
                      onClick={() => {
                        navigate(
                          getStudentCoursePerformancePath(recommendation.courseId)
                        );
                      }}
                      className="w-full rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                    >
                      <Text variant="caption" className="font-bold uppercase text-blue-700">
                        {recommendation.courseName}
                      </Text>
                      <Text variant="small" className="mt-2 text-gray-700">
                        {recommendation.description}
                      </Text>
                    </button>
                  ))}
                </div>
              ) : (
                <Text variant="small" className="text-blue-900">
                  Aun no hay recomendaciones calculadas. Guarda tu avance
                  semanal o recarga la analitica despues del recalculo.
                </Text>
              )}

              {dashboardPredictions.length > 0 ? (
                <div className="mt-5 space-y-3">
                  <Text variant="caption" className="font-bold uppercase text-blue-800">
                    Estado de predicciones
                  </Text>
                  {dashboardPredictions.slice(0, 3).map((prediction) => (
                    <button
                      key={prediction.courseId}
                      type="button"
                      onClick={() => {
                        navigate(getStudentCoursePerformancePath(prediction.courseId));
                      }}
                      className="w-full rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                    >
                      <Text variant="small" className="font-semibold text-gray-900">
                        {prediction.courseName}
                      </Text>
                      <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                        <span>Estado: {prediction.status}</span>
                        <span>Riesgo: {prediction.predictedRiskLevel}</span>
                        <span>Tendencia: {prediction.trendSlope}</span>
                        <span>Calculo: {prediction.computedAt}</span>
                      </div>
                      <Text variant="caption" className="mt-2 text-gray-500">
                        {prediction.message}
                      </Text>
                    </button>
                  ))}
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRecommendations((current) => !current);
                }}
                className="mt-5 w-full bg-white px-5 py-2 text-sm"
              >
                {showRecommendations ? "Ocultar detalle" : "Ver detalle"}
              </Button>
            </div>
          </div>

          {showRecommendations && dashboardRecommendations.length > 3 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Heading as="h4" className="text-gray-900">
                Todas las recomendaciones
              </Heading>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {dashboardRecommendations.slice(3).map((recommendation) => (
                  <button
                    key={recommendation.id}
                    type="button"
                    onClick={() => {
                      navigate(
                        getStudentCoursePerformancePath(recommendation.courseId)
                      );
                    }}
                    className="rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
                  >
                    <Text variant="caption" className="font-bold uppercase text-gray-500">
                      {recommendation.courseName}
                    </Text>
                    <Text variant="small" className="mt-2 text-gray-700">
                      {recommendation.description}
                    </Text>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error || insightsError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <FeedbackMessage message={error ?? insightsError ?? ""} tone="error" />
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <Heading as="h4" className="text-gray-900">
                Materias matriculadas
              </Heading>

              <Text variant="small" className="mt-2 text-gray-600">
                Ingresa a una materia para revisar rendimiento, riesgo y
                recomendaciones.
              </Text>
            </div>

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
              <CourseGrid
                courses={courses}
                onCourseClick={(courseId) => {
                  navigate(getStudentCoursePerformancePath(courseId));
                }}
                onSecondaryCourseAction={(courseId) => {
                  navigate(getStudentCourseUploadDataPath(courseId));
                }}
                secondaryCourseActionLabel="Registrar avance"
              />
            ) : (
              <StudentCoursesEmptyState />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
