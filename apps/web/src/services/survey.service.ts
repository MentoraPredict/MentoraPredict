import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  SubmitSurveyResponsePayload,
  SurveyQuestion,
  SurveyResponse,
} from "@/types/survey";

export const SOCIOECONOMIC_SURVEY_CODE = "SOCIOECONOMIC";

export async function getSurveyQuestions(
  surveyCode: string
): Promise<SurveyQuestion[]> {
  const response = await api.get<SurveyQuestion[]>(
    endpoints.academic.surveyQuestions(surveyCode)
  );
  return response.data;
}

export async function submitSurveyResponse(
  payload: SubmitSurveyResponsePayload
): Promise<SurveyResponse> {
  const response = await api.post<SurveyResponse>(
    endpoints.academic.studentSurveyResponses,
    payload
  );
  return response.data;
}

export async function getMySurveyResponses(): Promise<SurveyResponse[]> {
  const response = await api.get<SurveyResponse[]>(
    endpoints.academic.studentSurveyResponses
  );
  return response.data;
}
