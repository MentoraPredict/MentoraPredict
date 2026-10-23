import { useQuery } from "@tanstack/react-query";

import {
  SOCIOECONOMIC_SURVEY_CODE,
  getSurveyQuestions,
} from "@/services/survey.service";

export default function useSurveyQuestions(
  surveyCode: string = SOCIOECONOMIC_SURVEY_CODE
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["survey", "questions", surveyCode],
    queryFn: () => getSurveyQuestions(surveyCode),
    enabled: surveyCode.length > 0,
  });

  return {
    questions: data ?? [],
    isLoading,
    error: error ? "No se pudo cargar el catálogo de preguntas." : null,
    reload: refetch,
  };
}
