import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiActivity, FiAlertTriangle, FiAward, FiBookOpen } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";

import {
  getStudentCoursePerformancePath,
  getStudentCourseUploadDataPath,
} from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";

const riskLabels = {
  HIGH: "Alta prioridad",
  MEDIUM: "Seguimiento",
  LOW: "Estable",
  UNKNOWN: "Sin datos",
};

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

export default function StudentCoursesManagement() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { courses, isLoading, error } = useStudentCourses();

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

  const academicStatus = getAcademicStatus(
    dashboard.coursesAtRisk,
    dashboard.globalAverage
  );
  const studentName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Estudiante";

  const dashboardMetrics = [
    {
      label: "Materias activas",
      value: dashboard.activeCourses.toString(),
      hint: "Cursos matriculados en el periodo",
      icon: FiBookOpen,
    },
    {
      label: "Promedio general",
      value:
        dashboard.globalAverage === null
          ? "--"
          : dashboard.globalAverage.toFixed(2),
      hint: "Calculado con materias que reportan notas",
      icon: FiAward,
    },
    {
      label: "Alertas academicas",
      value: dashboard.coursesAtRisk.toString(),
      hint: "Materias con riesgo medio o alto",
      icon: FiAlertTriangle,
    },
    {
      label: "Creditos activos",
      value: dashboard.totalCredits > 0 ? dashboard.totalCredits.toString() : "--",
      hint: "Carga academica registrada",
      icon: FiActivity,
    },
  ];

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
                    <Text variant="caption" className="mt-1 text-gray-500">
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
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <metric.icon size={20} />
                </div>

                <Text
                  variant="caption"
                  className="font-bold uppercase text-gray-500"
                >
                  {metric.label}
                </Text>

                <Heading as="h4" className="mt-2 text-gray-900">
                  {metric.value}
                </Heading>

                <Text variant="small" className="mt-2 text-gray-600">
                  {metric.hint}
                </Text>
              </MotionCard>
            ))}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <FeedbackMessage message={error} tone="error" />
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
