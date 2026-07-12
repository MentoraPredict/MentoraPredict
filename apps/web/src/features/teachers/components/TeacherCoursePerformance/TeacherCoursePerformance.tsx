import { useMemo, useState } from "react";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useTeacherCourseAnalytics from "@/features/teachers/hooks/useTeacherCourseAnalytics";

interface TeacherCoursePerformanceProps {
  courseId: string;
}

const riskLabels = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

const riskStyles = {
  high: {
    button: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    active: "border-red-700 bg-red-700 text-white",
  },
  medium: {
    button: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    active: "border-amber-600 bg-amber-600 text-white",
  },
  low: {
    button: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    active: "border-emerald-700 bg-emerald-700 text-white",
  },
};

type RiskGroup = keyof typeof riskLabels;

export default function TeacherCoursePerformance({
  courseId,
}: TeacherCoursePerformanceProps) {
  const { data, isLoading, error } = useTeacherCourseAnalytics(courseId);
  const [selectedRiskGroup, setSelectedRiskGroup] =
    useState<RiskGroup>("high");

  const predictionsByStudentId = useMemo(
    () =>
      new Map(
        data?.predictions.map((prediction) => [
          prediction.studentId,
          prediction,
        ]) ?? [],
      ),
    [data?.predictions],
  );

  const studentsByRisk = useMemo(() => {
    const groups: Record<RiskGroup, NonNullable<typeof data>["students"]> = {
      high: [],
      medium: [],
      low: [],
    };

    data?.students.forEach((student) => {
      const prediction = predictionsByStudentId.get(student.user.id);
      const riskLevel = prediction?.predictedRiskLevel;

      if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
        groups.high.push(student);
      } else if (riskLevel === "MEDIUM") {
        groups.medium.push(student);
      } else if (riskLevel === "LOW") {
        groups.low.push(student);
      }
    });

    return groups;
  }, [data?.students, predictionsByStudentId]);

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando metricas"
        description="Estamos consultando la informacion real del curso."
      />
    );
  }

  if (error || !data) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se pudieron cargar las metricas"
        description={error ?? "No existen datos disponibles."}
      />
    );
  }

  const selectedStudents = studentsByRisk[selectedRiskGroup];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <Heading as="h4" className="text-gray-900">
              Riesgo del curso
            </Heading>
            <Text variant="small" className="mt-2 text-gray-600">
              Selecciona un nivel para ver que estudiantes estan clasificados
              por prediction-service en esta materia.
            </Text>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(["high", "medium", "low"] as RiskGroup[]).map((riskGroup) => {
              const isSelected = selectedRiskGroup === riskGroup;

              return (
                <button
                  key={riskGroup}
                  type="button"
                  onClick={() => {
                    setSelectedRiskGroup(riskGroup);
                  }}
                  className={`
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-left
                    font-semibold
                    transition
                    ${
                      isSelected
                        ? riskStyles[riskGroup].active
                        : riskStyles[riskGroup].button
                    }
                  `}
                >
                  <span className="block text-xs uppercase opacity-80">
                    Riesgo {riskLabels[riskGroup]}
                  </span>
                  <span className="mt-1 block text-2xl">
                    {studentsByRisk[riskGroup].length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <Text
              variant="caption"
              className="font-bold uppercase text-gray-500"
            >
              Estudiantes en riesgo{" "}
              {riskLabels[selectedRiskGroup].toLowerCase()}
            </Text>

            {selectedStudents.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selectedStudents.map((student) => {
                  const prediction = predictionsByStudentId.get(
                    student.user.id,
                  );

                  return (
                    <div
                      key={student.id}
                      className="rounded-lg border border-white bg-white px-4 py-3"
                    >
                      <Text
                        variant="small"
                        className="font-semibold text-gray-900"
                      >
                        {[student.user.firstName, student.user.lastName]
                          .filter(Boolean)
                          .join(" ") || student.user.email}
                      </Text>
                      <Text variant="caption" className="mt-1 text-gray-600">
                        {student.user.email}
                      </Text>
                      {prediction?.recommendation ? (
                        <Text variant="caption" className="mt-2 text-blue-700">
                          {prediction.recommendation}
                        </Text>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Text variant="small" className="mt-3 text-gray-600">
                No hay estudiantes clasificados en este nivel.
              </Text>
            )}
          </div>
        </section>

        <CourseAverageChart
          average={Number(data.average.toFixed(2))}
          title="Promedio del curso"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CourseAlertsPanel alerts={data.alerts} />
        <CourseRecommendationsPanel
          recommendations={data.recommendations}
          showDescription={false}
        />
      </div>

      <div className="w-full">
        <CourseProgressChart
          data={data.progress}
          title="Progreso del curso"
          subtitle="Promedio general de todos los estudiantes por semana"
        />
      </div>
    </div>
  );
}
