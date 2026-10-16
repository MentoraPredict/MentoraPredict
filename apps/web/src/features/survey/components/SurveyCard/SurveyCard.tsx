import { FiClock } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import type { SurveyDefinition } from "@/features/survey/types";

interface SurveyCardProps {
  survey: SurveyDefinition;
  isCompleted: boolean;
  onStart: () => void;
}

export default function SurveyCard({ survey, isCompleted, onStart }: SurveyCardProps) {
  const Icon = survey.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={20} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Heading as="h5" className="text-gray-900">
              {survey.title}
            </Heading>
            <Badge tone={survey.category === "Obligatoria" ? "red" : "neutral"}>
              {survey.category}
            </Badge>
          </div>
          <Text variant="small" className="mt-1 max-w-md text-gray-600">
            {survey.description}
          </Text>
          <Text variant="caption" className="mt-2 flex items-center gap-1 text-gray-400">
            <FiClock size={12} />
            {survey.estimatedMinutes} min aprox.
          </Text>
        </div>
      </div>

      <Button
        type="button"
        variant={isCompleted ? "outline" : "primary"}
        onClick={onStart}
        className="shrink-0 px-5 py-2 text-sm"
      >
        {isCompleted ? "Ver respuesta" : "Comenzar"}
      </Button>
    </div>
  );
}
