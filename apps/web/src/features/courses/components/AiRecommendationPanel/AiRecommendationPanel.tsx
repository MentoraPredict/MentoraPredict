import { FiCpu } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { AiPrediction } from "@/services/course-analytics.service";

const aiRecommendationLabels = {
  STUDY_HABIT: "Habitos de estudio",
  TUTORING: "Tutoria",
  TIME_MANAGEMENT: "Gestion del tiempo",
  ATTENDANCE: "Asistencia",
  SUBJECT_FOCUS: "Enfoque en la materia",
  WELLBEING: "Bienestar",
};

const aiPriorityStyles = {
  HIGH: "border-red-200 bg-red-50 text-red-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

interface AiRecommendationPanelProps {
  title: string;
  description: string;
  prediction: AiPrediction | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  emptyMessage: string;
  generateLabel?: string;
  onGenerate: () => void;
}

export default function AiRecommendationPanel({
  title,
  description,
  prediction,
  isLoading,
  isGenerating,
  error,
  emptyMessage,
  generateLabel = "Generar nueva recomendacion",
  onGenerate,
}: AiRecommendationPanelProps) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white">
            <FiCpu size={20} />
          </div>
          <div>
            <Heading as="h4" className="text-violet-900">
              {title}
            </Heading>
            <Text variant="caption" className="text-violet-800">
              {description}
            </Text>
          </div>
        </div>

        <Button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="gap-2 bg-violet-700 px-5 py-2 text-sm hover:bg-violet-800"
        >
          <FiCpu size={16} />
          {isGenerating ? "Generando..." : generateLabel}
        </Button>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <Text variant="small" className="text-violet-900">
          Cargando tu ultima recomendacion...
        </Text>
      ) : prediction ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-100 bg-white p-4">
            <Text variant="caption" className="font-bold uppercase text-violet-700">
              Resumen
            </Text>
            <Text variant="small" className="mt-2 text-gray-700">
              {prediction.summary}
            </Text>
            <Text variant="caption" className="mt-3 block text-gray-500">
              Generado el{" "}
              {new Intl.DateTimeFormat("es-EC", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(prediction.generatedAt))}
            </Text>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {prediction.recommendations.map((recommendation, index) => (
              <div
                key={`${recommendation.type}-${index}`}
                className={`rounded-xl border p-4 ${aiPriorityStyles[recommendation.priority]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Text variant="caption" className="font-bold uppercase opacity-80">
                    {aiRecommendationLabels[recommendation.type]}
                  </Text>
                  <Text variant="caption" className="font-bold uppercase opacity-80">
                    {recommendation.priority}
                  </Text>
                </div>
                <Text variant="small" className="mt-2 font-semibold">
                  {recommendation.title}
                </Text>
                <Text variant="small" className="mt-1 text-current opacity-90">
                  {recommendation.reason}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Text variant="small" className="text-violet-900">
          {emptyMessage}
        </Text>
      )}
    </div>
  );
}
