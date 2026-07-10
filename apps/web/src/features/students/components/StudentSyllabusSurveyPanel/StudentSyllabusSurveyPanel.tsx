import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import RatingScale from "@/components/molecules/RatingScale";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";

import type { StudentTopicSurveyItem } from "@/types/course";

const TOPICS_PER_PAGE = 5;

interface StudentSyllabusSurveyPanelProps {
  topics: StudentTopicSurveyItem[];
  onChangeTopicLevel: (
    topicId: string,
    value: StudentTopicSurveyItem["comprehensionLevel"]
  ) => void;
}

export default function StudentSyllabusSurveyPanel({
  topics,
  onChangeTopicLevel,
}: StudentSyllabusSurveyPanelProps) {
  const {
    currentPage,
    paginatedItems: paginatedTopics,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(topics, TOPICS_PER_PAGE, topics.length);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-blue-800 px-6 py-5">
        <Heading as="h5" className="text-white">
          Comprension por tema
        </Heading>
        <Text variant="small" className="mt-2 text-white/85">
          Aqui aparece cada tema del sílabo cargado por tu docente. Para cada
          uno, elige la carita que mejor represente tu comprension: del 1
          (carita roja, muy bajo) al 5 (carita azul, muy alto).
        </Text>
      </div>

      <div className="divide-y divide-gray-200">
        {paginatedTopics.map((topic) => (
          <div
            key={topic.topicId}
            className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_220px] md:items-center"
          >
            <Text variant="small" className="font-semibold text-blue-800">
              {topic.topicTitle}
            </Text>

            <RatingScale
              value={topic.comprehensionLevel}
              onChange={(value) => {
                onChangeTopicLevel(
                  topic.topicId,
                  value as StudentTopicSurveyItem["comprehensionLevel"]
                );
              }}
            />
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <Pagination
          currentPage={currentPage}
          pageSize={TOPICS_PER_PAGE}
          totalItems={totalItems}
          totalPages={totalPages}
          itemLabel="temas"
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
