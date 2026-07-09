import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { AxiosError } from "axios";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";
import AiRecommendationPanel from "@/features/courses/components/AiRecommendationPanel";
import CourseAlertsPanel from "@/features/courses/components/CourseAlertsPanel";
import CourseAverageChart from "@/features/courses/components/CourseAverageChart";
import CourseProgressChart from "@/features/courses/components/CourseProgressChart";
import CourseRecommendationsPanel from "@/features/courses/components/CourseRecommendationsPanel";
import CourseRiskStudentsPanel from "@/features/courses/components/CourseRiskStudentsPanel";
import StudentPerformanceUnavailableCard from "@/features/students/components/StudentPerformanceUnavailableCard";
import useStudentCoursePerformance from "@/features/students/hooks/useStudentCoursePerformance";
import {
  getLatestSubjectAiPrediction,
  requestSubjectAiPrediction,
  type AiPrediction,
} from "@/services/course-analytics.service";
import { useAuthStore } from "@/store/auth.store";
import type { Course } from "@/types/course";

interface StudentCoursePerformanceProps {
  courseId: string;
  course?: Course | null;
}

const predictionStatusLabels = {
  COMPUTED: "Calculada",
  INSUFFICIENT_DATA: "Datos insuficientes",
};

const predictedRiskLabels = {
  CRITICAL: "Critico",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
};

const predictedRiskStyles = {
  CRITICAL: "border-red-200 bg-red-50 text-red-800",
  HIGH: "border-orange-200 bg-orange-50 text-orange-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function formatPredictionDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StudentCoursePerformance({
  courseId,
  course,
}: StudentCoursePerformanceProps) {
  const { data, isLoading, error, reload } = useStudentCoursePerformance(courseId);
  const user = useAuthStore((state) => state.user);
  const [aiPrediction, setAiPrediction] = useState<AiPrediction | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isCancelled = false;
    setIsLoadingAi(true);

    getLatestSubjectAiPrediction(user.id, courseId)
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
  }, [user?.id, courseId]);

  const handleGenerateSubjectAiPrediction = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const prediction = await requestSubjectAiPrediction(courseId);
      setAiPrediction(prediction);
    } catch (requestError) {
      if (
        requestError instanceof AxiosError &&
        requestError.response?.status === 429
      ) {
        setAiError(
          (requestError.response.data as { message?: string })?.message ??
            "Ya generaste una recomendacion para esta materia recientemente. Intenta mas tarde."
        );
      } else {
        setAiError(
          "No se pudo generar la recomendacion con IA. Intenta nuevamente."
        );
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <StudentPerformanceUnavailableCard
        title="Cargando rendimiento"
        description="Estamos consultando las métricas reales de la materia."
      />
    );
  }

  if (error || !data) {
    return (
      <StudentPerformanceUnavailableCard
        title="No se pudo cargar el rendimiento"
        description={error ?? "No existen datos disponibles."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MotionCard
        as="section"
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <Badge className="bg-blue-100 text-blue-700">
              Rendimiento academico
            </Badge>
            <Heading as="h4" className="mt-3 text-gray-900">
              {course?.name ?? "Detalle de materia"}
            </Heading>
            <Text variant="small" className="mt-2 max-w-2xl text-gray-600">
              Consulta el avance semanal, factores de riesgo, alertas y
              recomendaciones generadas con datos reales disponibles.
            </Text>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void reload();
                }}
                disabled={isLoading}
                className="gap-2 px-5 py-2 text-sm"
              >
                <FiRefreshCw size={16} />
                Recargar analitica
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <Text
              variant="caption"
              className="font-bold uppercase text-gray-500"
            >
              Resumen
            </Text>
            <Text variant="small" className="mt-2 font-semibold text-gray-900">
              {course?.semester ?? "Periodo no registrado"}
            </Text>
            <Text variant="caption" className="mt-1 text-gray-600">
              {course?.careerName ?? "Carrera no registrada"}
            </Text>
          </div>
        </div>
      </MotionCard>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <CourseAverageChart
            average={data.average}
            title="Promedio actual de la materia"
          />
          <CourseRiskStudentsPanel
            students={data.riskFactors}
            title="Factores del riesgo"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CourseAlertsPanel alerts={data.alerts} />

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <Badge className="bg-blue-100 text-blue-700">
                Analisis predictivo
              </Badge>
              <Heading as="h4" className="mt-3 text-gray-900">
                Proyeccion de la materia
              </Heading>
              <Text variant="small" className="mt-2 text-gray-600">
                Riesgo academico esperado y recomendacion generada con los
                datos disponibles de esta materia.
              </Text>
            </div>

            {data.prediction.data ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div
                    className={`
                      rounded-xl
                      border
                      p-4
                      ${
                        data.prediction.data.predictedRiskLevel
                          ? predictedRiskStyles[data.prediction.data.predictedRiskLevel]
                          : "border-gray-100 bg-gray-50 text-gray-800"
                      }
                    `}
                  >
                    <Text variant="caption" className="font-bold uppercase opacity-80">
                      Riesgo esperado
                    </Text>
                    <Text variant="small" className="mt-1 font-semibold">
                      {data.prediction.data.predictedRiskLevel
                        ? predictedRiskLabels[data.prediction.data.predictedRiskLevel]
                        : "Sin clasificar"}
                    </Text>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Text variant="caption" className="font-bold uppercase text-gray-500">
                      Tendencia
                    </Text>
                    <Text variant="small" className="mt-1 font-semibold text-gray-900">
                      {data.prediction.data.trendSlope !== null
                        ? data.prediction.data.trendSlope.toFixed(2)
                        : "Sin tendencia"}
                    </Text>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Text variant="caption" className="font-bold uppercase text-gray-500">
                      Semana academica
                    </Text>
                    <Text variant="small" className="mt-1 font-semibold text-gray-900">
                      {data.prediction.data.academicWeek && data.prediction.data.academicYear
                        ? `S${data.prediction.data.academicWeek} / ${data.prediction.data.academicYear}`
                        : "Sin periodo"}
                    </Text>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Text variant="caption" className="font-bold uppercase text-gray-500">
                      Estado
                    </Text>
                    <Text variant="small" className="mt-1 font-semibold text-gray-900">
                      {predictionStatusLabels[data.prediction.data.status]}
                    </Text>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <Text variant="caption" className="font-bold uppercase text-blue-700">
                    Recomendacion
                  </Text>
                  <Text variant="small" className="mt-2 text-blue-900">
                    {data.prediction.data.recommendation ??
                      "Aun no hay una recomendacion disponible para esta materia."}
                  </Text>
                </div>

                <Text variant="caption" className="text-gray-500">
                  Actualizada: {formatPredictionDate(data.prediction.data.computedAt)}
                </Text>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Text variant="small" className="font-semibold text-amber-800">
                  Aun no hay una prediccion disponible para esta materia.
                </Text>
              </div>
            )}
          </section>
        </div>

        <AiRecommendationPanel
          title="Recomendacion con IA para esta materia"
          description="Basada en tu avance semanal y el silabo de la materia"
          prediction={aiPrediction}
          isLoading={isLoadingAi}
          isGenerating={isGeneratingAi}
          error={aiError}
          emptyMessage="Aun no has generado una recomendacion con IA para esta materia. Presiona el boton para generar una basada en tu avance semanal y el silabo."
          generateLabel="Generar recomendacion para esta materia"
          onGenerate={() => {
            void handleGenerateSubjectAiPrediction();
          }}
        />

        <CourseRecommendationsPanel recommendations={data.recommendations} />

        <CourseProgressChart
          data={data.progress}
          title="Progreso semanal"
          subtitle="Promedio real de la materia por semana"
        />
      </div>
    </div>
  );
}
