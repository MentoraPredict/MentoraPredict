import { FiClock, FiFrown, FiMeh, FiSmile } from "react-icons/fi";
import type { IconType } from "react-icons";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";

import type { StudentTopicSurveyItem } from "@/types/course";

const TOPICS_PER_PAGE = 8;

type ComprehensionLevel = StudentTopicSurveyItem["comprehensionLevel"];

interface ComprehensionOption {
  value: ComprehensionLevel;
  label: string;
  icon: IconType;
  /** Color de la carita sin elegir. */
  idle: string;
  /** Color de la carita elegida. */
  selected: string;
}

const OPTIONS: ComprehensionOption[] = [
  { value: 1, label: "Nada claro", icon: FiFrown, idle: "text-red-700 hover:bg-red-50", selected: "bg-red-700 text-white" },
  { value: 2, label: "Poco claro", icon: FiFrown, idle: "text-orange-600 hover:bg-orange-50", selected: "bg-orange-600 text-white" },
  { value: 3, label: "Neutral", icon: FiMeh, idle: "text-yellow-500 hover:bg-yellow-50", selected: "bg-yellow-400 text-white" },
  { value: 4, label: "Claro", icon: FiSmile, idle: "text-green-600 hover:bg-green-50", selected: "bg-green-600 text-white" },
  { value: 5, label: "Muy claro", icon: FiSmile, idle: "text-blue-700 hover:bg-blue-50", selected: "bg-blue-700 text-white" },
  { value: null, label: "Aún no se ha visto este tema", icon: FiClock, idle: "text-gray-400 hover:bg-gray-100", selected: "bg-gray-500 text-white" },
];

interface StudentSyllabusSurveyPanelProps {
  topics: StudentTopicSurveyItem[];
  onChangeTopicLevel: (topicId: string, value: ComprehensionLevel) => void;
}

/** Tabla de comprensión por tema: una fila por tema y una carita por nivel. */
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
          Comprensión por tema
        </Heading>
        <Text variant="small" className="mt-2 text-white/85">
          Para cada tema del sílabo elige cuánto lo entiendes, desde “Nada claro”
          (carita roja) hasta “Muy claro” (carita azul). Si tu docente aún no lo
          ha explicado, marca “Aún no se ha visto este tema”.
        </Text>
      </div>

      <div className="px-6 pt-4">
        <Pagination
          currentPage={currentPage}
          pageSize={TOPICS_PER_PAGE}
          totalItems={totalItems}
          totalPages={totalPages}
          itemLabel="temas"
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Tema
              </th>
              {OPTIONS.map((option) => (
                <th
                  key={option.label}
                  className="w-24 px-2 py-3 text-center text-xs font-semibold leading-tight text-gray-600"
                >
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTopics.map((topic) => (
              <tr key={topic.topicId}>
                <td className="px-6 py-3 font-medium text-blue-800">
                  {topic.topicTitle}
                </td>
                {OPTIONS.map((option) => {
                  const isSelected = topic.comprehensionLevel === option.value;
                  const Icon = option.icon;

                  return (
                    <td key={option.label} className="px-2 py-3 text-center">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${topic.topicTitle}: ${option.label}`}
                        title={option.label}
                        onClick={() => onChangeTopicLevel(topic.topicId, option.value)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                          isSelected ? option.selected : option.idle
                        }`}
                      >
                        <Icon size={20} aria-hidden="true" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
