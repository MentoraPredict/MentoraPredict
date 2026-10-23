export type SurveyQuestionType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "NUMBER"
  | "TEXT"
  | "BOOLEAN";

export interface SurveyQuestion {
  id: string;
  code: string;
  category: string;
  questionText: string;
  questionType: SurveyQuestionType;
  options: string[] | null;
  isActive: boolean;
  order: number;
}

export type SurveyAnswerValue = string | number | boolean | string[];

export interface SurveyAnswerInput {
  questionId: string;
  answerValue: SurveyAnswerValue;
}

export interface SubmitSurveyResponsePayload {
  surveyCode: string;
  periodId: string;
  answers: SurveyAnswerInput[];
}

export interface SurveyResponse {
  id: string;
  studentId: string;
  periodId: string;
  surveyCode: string;
  submittedAt: string;
  answers: { questionId: string; answerValue: SurveyAnswerValue }[];
}
