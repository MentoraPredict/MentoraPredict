import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

import CourseGrid from "@/features/courses/components/CourseGrid";
import StudentCoursesEmptyState from "@/features/students/components/StudentCoursesEmptyState";
import useStudentCourses from "@/features/students/hooks/useStudentCourses";

import { getStudentCoursePerformancePath } from "@/routes/paths";

export default function StudentCoursesManagement() {
  const navigate = useNavigate();
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
    };
  }, [courses]);

  const dashboardMetrics = [
    {
      label: "Materias activas",
      value: dashboard.activeCourses.toString(),
      hint: "Cursos matriculados en el periodo",
    },
    {
      label: "Promedio general",
      value:
        dashboard.globalAverage === null
          ? "--"
          : dashboard.globalAverage.toFixed(2),
      hint: "Calculado con materias que reportan notas",
    },
    {
      label: "Alertas academicas",
      value: dashboard.coursesAtRisk.toString(),
      hint: "Materias con riesgo medio o alto",
    },
  ];

  return (
    <section className="py-8">
      <Container>
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <Badge className="bg-indigo-100 text-indigo-700">
                Panel academico del estudiante
              </Badge>

              <div>
                <Heading as="h3" className="text-gray-900">
                  Mi seguimiento academico
                </Heading>

                <Text variant="small" className="mt-2 max-w-2xl text-gray-600">
                  Revisa tus materias activas, promedio disponible y alertas de
                  riesgo para tomar decisiones antes de que el periodo avance.
                </Text>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <Text
                variant="caption"
                className="font-bold uppercase text-gray-500"
              >
                Contexto academico
              </Text>

              <div className="mt-4 space-y-3">
                <div>
                  <Text variant="caption" className="text-gray-500">
                    Facultad
                  </Text>
                  <Text variant="small" className="font-semibold text-gray-900">
                    {dashboard.facultyName}
                  </Text>
                </div>

                <div>
                  <Text variant="caption" className="text-gray-500">
                    Carrera
                  </Text>
                  <Text variant="small" className="font-semibold text-gray-900">
                    {dashboard.careerName}
                  </Text>
                </div>

                <div>
                  <Text variant="caption" className="text-gray-500">
                    Periodo
                  </Text>
                  <Text variant="small" className="font-semibold text-gray-900">
                    {dashboard.periodName}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {dashboardMetrics.map((metric) => (
              <MotionCard
                key={metric.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
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
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <Text variant="small" className="font-medium text-red-700">
                {error}
              </Text>
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
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                <Text variant="small">Cargando cursos...</Text>
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
