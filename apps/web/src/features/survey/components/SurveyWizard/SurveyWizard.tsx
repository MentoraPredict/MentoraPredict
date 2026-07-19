import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClipboard, FiShield } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import SurveyCompletionScreen from "@/features/survey/components/SurveyCompletionScreen";
import SurveyStepField, {
  type StepAnswerValue,
} from "@/features/survey/components/SurveyStepField";
import useSurveyQuestions from "@/features/survey/hooks/useSurveyQuestions";
import { getSurveyDefinition } from "@/features/survey/mocks/surveyCatalog.mock";
import type { SurveyStep } from "@/features/survey/types";
import { recordMockCompletion } from "@/features/survey/utils/surveyCompletionStore";
import { APP_PATHS } from "@/routes/paths";
import { getActiveAcademicPeriod } from "@/services/student-performance.service";
import { submitSurveyResponse } from "@/services/survey.service";

const QUESTIONS_PER_STEP = 2;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export default function SurveyWizard() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const survey = surveyId ? getSurveyDefinition(surveyId) : undefined;

  const realQuestions = useSurveyQuestions(survey && !survey.isMocked ? survey.code : "");

  const steps: SurveyStep[] = useMemo(() => {
    if (!survey) return [];
    if (survey.isMocked) return survey.steps ?? [];

    return chunk(realQuestions.questions, QUESTIONS_PER_STEP).map((group, index) => ({
      title: `Preguntas ${index + 1}`,
      fields: group.map((question) => ({
        id: question.id,
        label: question.questionText,
        type: question.questionType,
        options: question.options ?? undefined,
      })),
    }));
  }, [survey, realQuestions.questions]);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StepAnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<{
    completedAt: string;
    durationMinutes: number;
  } | null>(null);
  const [startedAt] = useState(() => Date.now());

  if (!survey) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <Text variant="small" className="text-gray-600">
          No se encontró esta encuesta.
        </Text>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(APP_PATHS.student.survey)}
          className="mt-4 px-4 py-2 text-sm"
        >
          Volver a encuestas
        </Button>
      </div>
    );
  }

  const handleBackToSurveys = () => navigate(APP_PATHS.student.survey);

  if (completion) {
    return (
      <SurveyCompletionScreen
        completedAt={completion.completedAt}
        durationMinutes={completion.durationMinutes}
        onBackToSurveys={handleBackToSurveys}
      />
    );
  }

  const isLoadingRealQuestions = !survey.isMocked && realQuestions.isLoading;

  if (isLoadingRealQuestions) {
    return (
      <div className="space-y-3">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <FiClipboard size={32} className="text-gray-400" />
        <Heading as="h4" className="text-gray-700">
          Todavía no hay preguntas cargadas
        </Heading>
        <Text variant="small" className="max-w-md text-gray-500">
          El catálogo de esta encuesta lo carga un administrador — por ahora
          no hay nada que responder.
        </Text>
        <Button
          type="button"
          variant="outline"
          onClick={handleBackToSurveys}
          className="mt-2 px-4 py-2 text-sm"
        >
          Volver a encuestas
        </Button>
      </div>
    );
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

    try {
      if (survey.isMocked) {
        recordMockCompletion(survey.id, durationMinutes);
      } else {
        const activePeriod = await getActiveAcademicPeriod();
        await submitSurveyResponse({
          surveyCode: survey.code,
          periodId: activePeriod.id,
          answers: Object.entries(answers).map(([questionId, answerValue]) => ({
            questionId,
            answerValue: answerValue as never,
          })),
        });
      }

      setCompletion({ completedAt: new Date().toISOString(), durationMinutes });
    } catch {
      setSubmitError("No se pudo enviar la encuesta. Intenta nuevamente en unos minutos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleBackToSurveys}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft size={16} />
        Volver
      </button>

      <div>
        <Heading as="h3" className="text-gray-900">
          {survey.title}
        </Heading>

        <div className="mt-4 flex items-center justify-between">
          <Text variant="small" className="text-gray-600">
            Paso {currentStep + 1} de {steps.length}
          </Text>
          <Text variant="small" className="font-semibold text-blue-700">
            {progressPercent}%
          </Text>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-700 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Text variant="caption" className="font-bold uppercase text-gray-500">
          {step.title}
        </Text>

        {step.fields.map((field) => (
          <div key={field.id} className="space-y-3">
            <Text variant="small" className="font-semibold text-gray-900">
              {field.label}
            </Text>
            <SurveyStepField
              field={field}
              value={answers[field.id]}
              onChange={(value) => {
                setAnswers((current) => ({ ...current, [field.id]: value }));
              }}
            />
          </div>
        ))}

        {submitError ? <FeedbackMessage message={submitError} tone="error" /> : null}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => {
              setCurrentStep((current) => Math.max(0, current - 1));
            }}
            className="px-5 py-2 text-sm"
          >
            Anterior
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={() => {
                void handleSubmit();
              }}
              className="px-5 py-2 text-sm"
            >
              Enviar
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setCurrentStep((current) => Math.min(steps.length - 1, current + 1));
              }}
              className="px-5 py-2 text-sm"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <FiShield size={14} />
        <Text variant="caption">Tus respuestas son confidenciales</Text>
      </div>
    </div>
  );
}
