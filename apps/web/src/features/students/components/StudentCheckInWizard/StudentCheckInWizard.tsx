import { useEffect, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";

import StudentCourseMetricsPanel from "@/features/students/components/StudentCourseMetricsPanel";
import StudentStudyHabitsPanel from "@/features/students/components/StudentStudyHabitsPanel";
import StudentSyllabusSurveyPanel from "@/features/students/components/StudentSyllabusSurveyPanel";
import {
  getCurrentStudentCheckIn,
  getSubjectTopics,
  saveStudentCheckIn,
  type StudentCheckInEmotionalState,
} from "@/services/academic.service";

import type { Course, StudentTopicSurveyItem } from "@/types/course";

interface StudentCheckInWizardProps {
  course: Course;
  onCancel: () => void;
  onSaved: () => void;
}

type StepId = "week" | "habits" | "topics" | "teacher";

const STEP_LABELS: Record<StepId, string> = {
  week: "Tu semana",
  habits: "Hábitos de estudio",
  topics: "Comprensión por tema",
  teacher: "Para tu docente",
};

const emotionalStateByRating: Record<number, StudentCheckInEmotionalState> = {
  1: "CRITICAL",
  2: "BAD",
  3: "NEUTRAL",
  4: "GOOD",
  5: "GREAT",
};

const ratingByEmotionalState: Record<StudentCheckInEmotionalState, 1 | 2 | 3 | 4 | 5> = {
  CRITICAL: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  GREAT: 5,
};

function ratingToPercent(value: number) {
  return Math.min(100, Math.max(0, value * 20));
}

function percentToRating(value: number): 1 | 2 | 3 | 4 | 5 {
  const rating = Math.round(value / 20);
  return Math.min(5, Math.max(1, rating)) as 1 | 2 | 3 | 4 | 5;
}

/**
 * Registro de un avance, paso a paso por temática: la semana (asistencia,
 * tareas y ánimo), los hábitos de estudio, la comprensión de cada tema y lo
 * que quiere que el docente explique mejor. Si ya hay un registro de la
 * semana en curso, lo carga y lo actualiza al guardar.
 */
export default function StudentCheckInWizard({
  course,
  onCancel,
  onSaved,
}: StudentCheckInWizardProps) {
  const [attendance, setAttendance] = useState(66);
  const [taskCompletion, setTaskCompletion] = useState(66);
  const [studyHours, setStudyHours] = useState(4);
  const [emotionalState, setEmotionalState] = useState(4);
  const [skillsText, setSkillsText] = useState("");
  const [explainBetter, setExplainBetter] = useState("");
  const [comprehensionLevel, setComprehensionLevel] = useState(4);
  const [topics, setTopics] = useState<StudentTopicSurveyItem[]>([]);

  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCurrentCheckIn, setHasCurrentCheckIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function load(subjectId: string) {
      const realTopics = await getSubjectTopics(subjectId).catch(() => []);
      const defaultTopics: StudentTopicSurveyItem[] = realTopics.map((topic) => ({
        topicId: topic.id,
        topicTitle: topic.title,
        // Sin respuesta guardada, el tema se considera aún no visto.
        comprehensionLevel: null,
      }));

      if (isCancelled) return;
      setTopics(defaultTopics);

      try {
        const checkIn = await getCurrentStudentCheckIn(subjectId);
        if (isCancelled || !checkIn) return;

        setHasCurrentCheckIn(true);
        setAttendance(checkIn.attendance);
        setTaskCompletion(checkIn.taskCompletion);
        setStudyHours(Number(checkIn.studyHours));
        setEmotionalState(ratingByEmotionalState[checkIn.emotionalState]);
        setComprehensionLevel(percentToRating(checkIn.generalComprehension));
        setSkillsText(checkIn.notes ?? "");
        setExplainBetter(checkIn.explainBetter ?? "");
        setTopics(
          defaultTopics.map((topic) => {
            const saved = checkIn.topicResponses?.find(
              (response) => response.topicId === topic.topicId
            );

            return saved
              ? { ...topic, comprehensionLevel: percentToRating(saved.comprehension) }
              : topic;
          })
        );
      } catch {
        // Sin registro previo: se empieza uno nuevo.
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    void load(course.id);

    return () => {
      isCancelled = true;
    };
  }, [course.id]);

  // La comprensión por tema solo aparece si el docente cargó el sílabo.
  const steps: StepId[] = topics.length > 0
    ? ["week", "habits", "topics", "teacher"]
    : ["week", "habits", "teacher"];
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex >= steps.length - 1;

  const handleChangeTopicLevel = (
    topicId: string,
    value: StudentTopicSurveyItem["comprehensionLevel"]
  ) => {
    setTopics((current) =>
      current.map((topic) =>
        topic.topicId === topicId ? { ...topic, comprehensionLevel: value } : topic
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveStudentCheckIn(course.id, {
        attendance,
        taskCompletion,
        studyHours,
        emotionalState: emotionalStateByRating[emotionalState],
        generalComprehension: ratingToPercent(comprehensionLevel),
        // Los temas marcados "aún no visto" no se envían: no cuentan en la
        // comprensión de la materia.
        topicResponses: topics.flatMap((topic) =>
          topic.comprehensionLevel === null
            ? []
            : [
                {
                  topicId: topic.topicId,
                  comprehension: ratingToPercent(topic.comprehensionLevel),
                },
              ]
        ),
        notes: skillsText.trim() || undefined,
        explainBetter: explainBetter.trim(),
      });

      onSaved();
    } catch {
      setError(
        "No se pudo guardar el avance. Revisa tu sesión e intenta nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando...</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading as="h4" className="text-gray-900">
              Nuevo avance de {course.name}
            </Heading>
            {hasCurrentCheckIn ? (
              <Text variant="small" className="mt-1 text-amber-700">
                Ya registraste un avance esta semana: lo que guardes lo
                actualizará.
              </Text>
            ) : null}
          </div>

          <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
            <FiX size={16} />
            Cancelar
          </Button>
        </div>

        <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {steps.map((step, index) => {
            const isCurrent = index === stepIndex;
            const isDone = index < stepIndex;

            return (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={`flex items-center gap-2 text-sm font-medium transition ${
                    isCurrent ? "text-blue-700" : isDone ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-blue-700 text-white"
                        : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>
                  {STEP_LABELS[step]}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {currentStep === "week" ? (
        <StudentCourseMetricsPanel
          attendance={attendance}
          taskCompletion={taskCompletion}
          emotionalState={emotionalState}
          onChangeAttendance={setAttendance}
          onChangeTaskCompletion={setTaskCompletion}
          onChangeEmotionalState={setEmotionalState}
        />
      ) : null}

      {currentStep === "habits" ? (
        <StudentStudyHabitsPanel
          studyHours={studyHours}
          skillsText={skillsText}
          comprehensionLevel={comprehensionLevel}
          onChangeStudyHours={setStudyHours}
          onChangeSkillsText={setSkillsText}
          onChangeComprehensionLevel={setComprehensionLevel}
        />
      ) : null}

      {currentStep === "topics" ? (
        <StudentSyllabusSurveyPanel
          topics={topics}
          onChangeTopicLevel={handleChangeTopicLevel}
        />
      ) : null}

      {currentStep === "teacher" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Heading as="h5" className="text-blue-700">
            Para tu docente
          </Heading>
          <Label htmlFor="explain-better" className="mt-4 block">
            ¿Qué parte te gustaría que se explique mejor?
          </Label>
          <Textarea
            id="explain-better"
            rows={4}
            maxLength={1000}
            value={explainBetter}
            onChange={(event) => setExplainBetter(event.target.value)}
            placeholder="Por ejemplo: la resolución de ecuaciones con fracciones"
            className="mt-2"
          />
        </section>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <FeedbackMessage message={error} tone="error" />
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
          disabled={stepIndex === 0}
          className="min-w-36 gap-2"
        >
          <FiChevronLeft size={16} />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="min-w-36 gap-2"
          >
            <FiCheckCircle size={16} />
            {isSaving ? "Guardando" : "Guardar avance"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setStepIndex((index) => index + 1)}
            className="min-w-36 gap-2"
          >
            Siguiente
            <FiChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
