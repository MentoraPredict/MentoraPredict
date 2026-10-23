import { FiFileText, FiZap } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";

import type { CourseRecommendation } from "@/types/course";

const RECOMMENDATIONS_PER_PAGE = 3;

interface CourseRecommendationsPanelProps {
  recommendations: CourseRecommendation[];
  showDescription?: boolean;
  showReportButton?: boolean;
  onGenerateReport?: () => void;
}

export default function CourseRecommendationsPanel({
  recommendations,
  showDescription = true,
  showReportButton = false,
  onGenerateReport,
}: CourseRecommendationsPanelProps) {
  const {
    currentPage,
    paginatedItems: paginatedRecommendations,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(recommendations, RECOMMENDATIONS_PER_PAGE);

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

      {showDescription ? (
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
      ) : null}

      <div className="mt-6 space-y-4">
        {paginatedRecommendations.map((recommendation, index) => (
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
                {String((currentPage - 1) * RECOMMENDATIONS_PER_PAGE + index + 1).padStart(2, "0")}
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

      {totalPages > 1 ? (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            pageSize={RECOMMENDATIONS_PER_PAGE}
            totalItems={totalItems}
            totalPages={totalPages}
            itemLabel="recomendaciones"
            onPageChange={setCurrentPage}
          />
        </div>
      ) : null}

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
