import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBookOpen,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import CollapsibleGroup from "@/components/molecules/CollapsibleGroup";
import ListToolbar from "@/components/molecules/ListToolbar";

import CourseGrid from "@/features/courses/components/CourseGrid";
import TeacherCoursesTable from "@/features/teachers/components/TeacherCoursesTable";
import useTeacherCourses from "@/features/teachers/hooks/useTeacherCourses";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { getSubjectMetricsSummary } from "@/services/course-analytics.service";

import DashboardMetricCard, {
  type DashboardMetric,
} from "@/features/dashboard/components/DashboardMetricCard";
import { computeTeacherRealMetrics } from "@/features/dashboard/utils/computeTeacherRealMetrics";
import { getAverageTone, getCountTone } from "@/features/dashboard/utils/metricTone";
import {
  courseRiskRank,
  getRiskPresentation,
} from "@/features/dashboard/utils/riskLevelPresentation";

import Text from "@/components/atoms/Text";

import { useNavigate } from "react-router-dom";
import { getTeacherCoursePerformancePath } from "@/routes/paths";
import type { Course } from "@/types/course";
import type { RiskLevelOrUnknown } from "@/types/risk";

type CoursesView = "cards" | "list";
type CoursesGroupBy = "" | "risk" | "period";

const RISK_FILTER_LEVELS: RiskLevelOrUnknown[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNKNOWN",
];

const VIEW_OPTIONS: { value: CoursesView; label: string; icon: typeof FiGrid }[] = [
  { value: "cards", label: "Tarjetas", icon: FiGrid },
  { value: "list", label: "Lista", icon: FiList },
];

interface TeacherCoursesManagementProps {
  courseState: ReturnType<typeof useTeacherCourses>;
}

export default function TeacherCoursesManagement({
  courseState,
}: TeacherCoursesManagementProps) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const { courses: backendCourses, isLoading, error } = courseState;

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

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => courseRiskRank(b.riskLevel) - courseRiskRank(a.riskLevel)
      ),
    [courses]
  );

  const [view, setView] = useState<CoursesView>("cards");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [groupBy, setGroupBy] = useState<CoursesGroupBy>("");

  const periodOptions = useMemo(
    () =>
      [...new Set(courses.map((course) => course.semester).filter(Boolean))]
        .sort()
        .map((period) => ({ value: period, label: period })),
    [courses],
  );

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedCourses.filter((course) => {
      if (riskFilter && course.riskLevel !== riskFilter) return false;
      if (periodFilter && course.semester !== periodFilter) return false;
      if (!query) return true;

      return [course.name, course.code, course.description]
        .filter(Boolean)
        .some((text) => text!.toLowerCase().includes(query));
    });
  }, [sortedCourses, search, riskFilter, periodFilter]);

  const courseGroups = useMemo(() => {
    if (!groupBy) return [];

    const groups = new Map<string, Course[]>();
    for (const course of visibleCourses) {
      const label =
        groupBy === "risk"
          ? getRiskPresentation(course.riskLevel).label
          : course.semester || "Sin periodo";
      groups.set(label, [...(groups.get(label) ?? []), course]);
    }

    return [...groups.entries()].map(([label, items]) => ({ label, items }));
  }, [visibleCourses, groupBy]);

  const getCourseMetrics = (course: Course) => {
    const analytics = courseAnalytics[course.id];

    return {
      averageLabel: analytics
        ? `${analytics.average.toFixed(2)} / 10`
        : "Sin datos",
      enrolledCount: course.enrolledCount ?? 0,
    };
  };

  const handleCourseClick = (courseId: string) => {
    navigate(getTeacherCoursePerformancePath(courseId));
  };

  const renderCourses = (items: Course[]) =>
    view === "cards" ? (
      <CourseGrid
        courses={items}
        showTeacherDetails={false}
        getCourseMetrics={getCourseMetrics}
        onCourseClick={handleCourseClick}
      />
    ) : (
      <TeacherCoursesTable
        courses={items}
        getCourseMetrics={getCourseMetrics}
        onCourseClick={handleCourseClick}
      />
    );

  const dashboardMetrics: DashboardMetric[] = [
    {
      label: "Promedio general",
      value:
        realMetrics.averageAcrossCourses === null
          ? "--"
          : realMetrics.averageAcrossCourses.toFixed(2),
      hint: "Escala 0-10, promedio entre tus materias",
      icon: FiTrendingUp,
      tone: getAverageTone(realMetrics.averageAcrossCourses),
    },
    {
      label: "Estudiantes a atender",
      value: realMetrics.studentsAtRisk.toString(),
      hint: "Con riesgo medio, alto o crítico en alguna materia",
      icon: FiAlertTriangle,
      tone: getCountTone(realMetrics.studentsAtRisk),
    },
    {
      label: "Materias a cargo",
      value: realMetrics.totalCourses.toString(),
      hint: "Materias asignadas en el año lectivo activo",
      icon: FiBookOpen,
      tone: "neutral",
    },
    {
      label: "Estudiantes",
      value: realMetrics.totalStudents.toString(),
      hint: "Matriculados en tus materias",
      icon: FiUsers,
      tone: "neutral",
    },
  ];
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
            <div className="mb-8">
              <Heading as="h3" className="text-gray-900">
                Mis materias
              </Heading>
              <div className="mt-2 h-1 w-14 rounded-full bg-blue-700" />
            </div>

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

            {isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                <Text variant="small">Cargando cursos...</Text>
              </div>
            ) : hasCourses ? (
              <div className="space-y-5">
                <ListToolbar
                  search={search}
                  searchPlaceholder="Buscar por nombre, código o descripción"
                  onSearchChange={setSearch}
                  filters={[
                    {
                      id: "risk",
                      label: "Nivel de riesgo",
                      value: riskFilter,
                      allLabel: "Todos los niveles",
                      options: RISK_FILTER_LEVELS.map((level) => ({
                        value: level,
                        label: getRiskPresentation(level).label,
                      })),
                      onChange: setRiskFilter,
                    },
                    {
                      id: "period",
                      label: "Periodo",
                      value: periodFilter,
                      allLabel: "Todos los periodos",
                      options: periodOptions,
                      onChange: setPeriodFilter,
                    },
                  ]}
                  group={{
                    value: groupBy,
                    options: [
                      { value: "risk", label: "Nivel de riesgo" },
                      { value: "period", label: "Periodo" },
                    ],
                    onChange: (value) => setGroupBy(value as CoursesGroupBy),
                  }}
                  onClear={() => {
                    setSearch("");
                    setRiskFilter("");
                    setPeriodFilter("");
                    setGroupBy("");
                  }}
                  actions={
                    <div
                      role="group"
                      aria-label="Tipo de vista"
                      className="inline-flex h-12 overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={view === value}
                          title={label}
                          onClick={() => setView(value)}
                          className={`inline-flex items-center gap-2 px-4 text-sm font-medium transition ${
                            view === value
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
                ) : groupBy ? (
                  courseGroups.map((group) => (
                    <CollapsibleGroup
                      key={group.label}
                      label={group.label}
                      count={group.items.length}
                    >
                      <div className={view === "cards" ? "p-4" : ""}>
                        {renderCourses(group.items)}
                      </div>
                    </CollapsibleGroup>
                  ))
                ) : (
                  renderCourses(visibleCourses)
                )}
              </div>
            ) : (
              <Text variant="small" className="text-gray-600">
                Aún no tienes materias asignadas. Secretaría o administración
                las asignan al iniciar el año lectivo.
              </Text>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
