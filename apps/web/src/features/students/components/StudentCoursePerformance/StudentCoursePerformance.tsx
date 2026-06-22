import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskBars from "@/features/courses/components/CourseRiskBars";

import type {
  CourseAlert,
  CourseProgressPoint,
  CourseRecommendation,
  CourseRiskItem,
} from "@/types/course";

const progressData: CourseProgressPoint[] = [
  {
    week: "S1",
    actual: 5,
    projection: 7,
  },
  {
    week: "S2",
    actual: 6,
    projection: 6,
  },
  {
    week: "S3",
    actual: 5,
    projection: 9,
  },
  {
    week: "S4",
    actual: 9,
    projection: 8,
  },
  {
    week: "S5",
    actual: 10,
    projection: 11,
  },
  {
    week: "S6",
    actual: 8,
    projection: 12,
  },
  {
    week: "S7",
    actual: 13,
    projection: 10,
  },
  {
    week: "S8",
    actual: 14,
    projection: 11,
  },
  {
    week: "S9",
    actual: 16,
    projection: 13,
  },
];

const alerts: CourseAlert[] = [
  {
    id: "1",
    message: "En la nota individual tienes 3 puntos sobre 7",
    severity: "HIGH",
  },
  {
    id: "2",
    message: "Estás al límite de faltas permitidas",
    severity: "HIGH",
  },
  {
    id: "3",
    message: "En el examen obtuviste una nota de 5/20, equivalente al 20%.",
    severity: "MEDIUM",
  },
];

const recommendations: CourseRecommendation[] = [
  {
    id: "1",
    title: "Recomendación 1",
    description:
      "Repasa los conceptos base del módulo 2 antes de la próxima evaluación.",
  },
  {
    id: "2",
    title: "Recomendación 2",
    description:
      "Agenda una sesión de tutoría para reforzar los temas con menor comprensión.",
  },
  {
    id: "3",
    title: "Recomendación 3",
    description:
      "Entrega el reporte pendiente antes del viernes para mejorar tu progreso.",
  },
];

const riskItems: CourseRiskItem[] = [
  {
    id: "risk",
    label: "Riesgo de perder la materia",
    value: 93,
  },
];

export default function StudentCoursePerformance() {
  return (
    <div
      className="
                grid
                gap-6
                xl:grid-cols-[1fr_360px]
            "
    >
      <div className="space-y-6">
        <CourseProgressChart
          data={progressData}
          title="Progreso"
          subtitle="Métricas de rendimiento personal por semana"
        />

        <CourseAlertsPanel alerts={alerts} />

        <section
          className="
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-6
                        shadow-sm
                    "
        >
          <CourseRiskBars items={riskItems} />
        </section>
      </div>

      <div className="space-y-6">
        <CourseAverageChart
          average={7}
          title="Promedio actual"
          description="Tu promedio actual se encuentra por debajo del umbral recomendado para aprobar la materia."
        />

        <CourseRecommendationsPanel
          recommendations={recommendations}
          showReportButton={false}
        />
      </div>
    </div>
  );
}
