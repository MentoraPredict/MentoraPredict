import { FiFileText, FiZap } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { CourseRecommendation } from "@/types/course";

interface CourseRecommendationsPanelProps {
  recommendations: CourseRecommendation[];
  showReportButton?: boolean;
  onGenerateReport?: () => void;
}

export default function CourseRecommendationsPanel({
  recommendations,
  showReportButton = false,
  onGenerateReport,
}: CourseRecommendationsPanelProps) {
  return (
    <section
      className="
                rounded-2xl
                border
                border-cyan-200
                bg-blue-50
                p-6
                shadow-sm
            "
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-700
                        text-white
                    "
        >
          <FiZap size={20} />
        </div>

        <Heading as="h4" className="text-blue-900">
          Recomendaciones IA
        </Heading>
      </div>

      <Text
        variant="small"
        className="
                    border-l-2
                    border-blue-300
                    pl-4
                    text-gray-600
                "
      >
        Estas recomendaciones están basadas en los datos proporcionados
        previamente por el docente y los estudiantes de este curso.
      </Text>

      <div className="mt-6 space-y-4">
        {recommendations.map((recommendation, index) => (
          <article
            key={recommendation.id}
            className="
                            rounded-xl
                            bg-white
                            p-4
                            shadow-sm
                        "
          >
            <div className="flex gap-4">
              <Text variant="small" className="font-bold text-blue-700">
                {String(index + 1).padStart(2, "0")}
              </Text>

              <div>
                <Text variant="small" className="font-semibold text-gray-900">
                  {recommendation.title}
                </Text>

                <Text variant="small" className="mt-1">
                  {recommendation.description}
                </Text>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showReportButton ? (
        <Button
          type="button"
          onClick={onGenerateReport}
          className="mt-6 w-full gap-2"
        >
          <FiFileText />
          Generar Nuevo Reporte
        </Button>
      ) : null}
    </section>
  );
}
