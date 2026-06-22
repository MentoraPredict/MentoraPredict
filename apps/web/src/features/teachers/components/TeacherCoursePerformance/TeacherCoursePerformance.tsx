import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskStudentsPanel from "@/features/courses/components/CourseRiskStudentsPanel";

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
    projection: 3,
  },
  {
    week: "S2",
    actual: 7,
    projection: 5,
  },
  {
    week: "S3",
    actual: 9,
    projection: 8,
  },
  {
    week: "S4",
    actual: 12,
    projection: 10,
  },
  {
    week: "S5",
    actual: 11,
    projection: 9,
  },
  {
    week: "S6",
    actual: 13,
    projection: 12,
  },
  {
    week: "S7",
    actual: 12,
    projection: 14,
  },
  {
    week: "S8",
    actual: 14,
    projection: 15,
  },
];

const alerts: CourseAlert[] = [
  {
    id: "1",
    message: "El alumno 1 tiene problemas en el tema 1",
    severity: "HIGH",
  },
  {
    id: "2",
    message: "El alumno 20 tiene demasiadas faltas",
    severity: "HIGH",
  },
  {
    id: "3",
    message:
      "En la última evaluación la mayor parte del curso tiene una mala calificación.",
    severity: "LOW",
  },
];

const recommendations: CourseRecommendation[] = [
  {
    id: "1",
    title: "Recomendación 1",
    description:
      "Implementar tutorías personalizadas para el grupo de alto riesgo antes de la semana 6.",
  },
  {
    id: "2",
    title: "Recomendación 2",
    description:
      "Ajustar los materiales del Tema 1 para incluir ejercicios prácticos adicionales.",
  },
  {
    id: "3",
    title: "Recomendación 3",
    description:
      "Incentivar la participación en foros asincrónicos para estudiantes con baja asistencia.",
  },
];

const riskStudents: CourseRiskItem[] = [
  {
    id: "1",
    label: "Alumno 3",
    value: 90,
  },
  {
    id: "2",
    label: "Alumno 8",
    value: 88,
  },
  {
    id: "3",
    label: "Alumno 12",
    value: 67,
  },
  {
    id: "4",
    label: "Alumno 15",
    value: 66,
  },
  {
    id: "5",
    label: "Alumno 21",
    value: 65,
  },
];

export default function TeacherCoursePerformance() {
  const handleGenerateReport = () => {
    console.log("Generar reporte del curso");
  };

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
          subtitle="Promedio general del curso por semana"
        />

        <CourseAlertsPanel alerts={alerts} />

        <CourseRiskStudentsPanel students={riskStudents} />
      </div>

      <div className="space-y-6">
        <CourseAverageChart average={7} title="Promedio del curso" />

        <CourseRecommendationsPanel
          recommendations={recommendations}
          showReportButton
          onGenerateReport={handleGenerateReport}
        />
      </div>
    </div>
  );
}
