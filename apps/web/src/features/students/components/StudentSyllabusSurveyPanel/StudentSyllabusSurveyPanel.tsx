import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import RatingScale from "@/components/molecules/RatingScale";

import type { StudentTopicSurveyItem } from "@/types/course";

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
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-blue-700 px-6 py-5">
        <Heading as="h5" className="text-white">
          Comprension por tema
        </Heading>
        <Text variant="small" className="mt-2 text-blue-50">
          Evalua tu avance en los temas principales para orientar el seguimiento
          academico.
        </Text>
      </div>

      <div className="divide-y divide-gray-200">
        {topics.map((topic) => (
          <div
            key={topic.topicId}
            className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_220px] md:items-center"
          >
            <Text variant="small" className="font-medium text-gray-900">
              Nivel de comprension en {topic.topicTitle}
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
    </section>
  );
}
