import { useEffect, useState } from "react";
import { FiCalendar, FiCheckCircle, FiRotateCcw } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import FeedbackMessage from "@/components/atoms/FeedbackMessage";
import Heading from "@/components/atoms/Heading";
import MotionCard from "@/components/atoms/MotionCard";
import Text from "@/components/atoms/Text";

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

interface StudentCourseUploadDataProps {
  course?: Course | null;
}

const DEFAULT_TOPIC_COMPREHENSION: StudentTopicSurveyItem["comprehensionLevel"] = 4;

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

export default function StudentCourseUploadData({
  course,
}: StudentCourseUploadDataProps) {
  const [attendance, setAttendance] = useState(66);
  const [taskCompletion, setTaskCompletion] = useState(66);
  const [studyHours, setStudyHours] = useState(4);

  const [emotionalState, setEmotionalState] = useState(4);
  const [skillsText, setSkillsText] = useState("");
  const [comprehensionLevel, setComprehensionLevel] = useState(4);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "info" | "error">(
    "info"
  );
  const [isLoadingCheckIn, setIsLoadingCheckIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [topics, setTopics] = useState<StudentTopicSurveyItem[]>([]);
  const [baseTopics, setBaseTopics] = useState<StudentTopicSurveyItem[]>([]);

  useEffect(() => {
    if (!course?.id) {
      return;
    }

    let isCancelled = false;
    setIsLoadingCheckIn(true);

    async function loadSurveyData(subjectId: string) {
      const realTopics = await getSubjectTopics(subjectId).catch(() => []);
      const defaultTopics: StudentTopicSurveyItem[] = realTopics.map((topic) => ({
        topicId: topic.id,
        topicTitle: topic.title,
        comprehensionLevel: DEFAULT_TOPIC_COMPREHENSION,
      }));

      if (isCancelled) return;
      setBaseTopics(defaultTopics);
      setTopics(defaultTopics);

      try {
        const checkIn = await getCurrentStudentCheckIn(subjectId);
        if (isCancelled || !checkIn) return;

        setAttendance(checkIn.attendance ? 100 : 0);
        setTaskCompletion(checkIn.taskCompletion);
        setStudyHours(Number(checkIn.studyHours));
        setEmotionalState(ratingByEmotionalState[checkIn.emotionalState]);
        setComprehensionLevel(percentToRating(checkIn.generalComprehension));
        setSkillsText(checkIn.notes ?? "");
        setTopics(
          defaultTopics.map((topic) => {
            const savedTopic = checkIn.topicResponses?.find(
              (response) => response.topicId === topic.topicId
            );

            return savedTopic
              ? {
                  ...topic,
                  comprehensionLevel: percentToRating(
                    savedTopic.comprehension
                  ),
                }
              : topic;
          })
        );
        setMessage("Se cargo tu registro semanal actual.");
        setMessageTone("info");
      } catch {
        if (!isCancelled) {
          setMessage(
            "No se pudo cargar el registro semanal actual. Puedes completar uno nuevo."
          );
          setMessageTone("info");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCheckIn(false);
        }
      }
    }

    void loadSurveyData(course.id);

    return () => {
      isCancelled = true;
    };
  }, [course?.id]);

  const handleChangeTopicLevel = (
    topicId: string,
    value: StudentTopicSurveyItem["comprehensionLevel"]
  ) => {
    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.topicId === topicId
          ? {
              ...topic,
              comprehensionLevel: value,
            }
          : topic
      )
    );
  };

  const handleCancel = () => {
    setAttendance(66);
    setTaskCompletion(66);
    setStudyHours(4);
    setEmotionalState(4);
    setSkillsText("");
    setComprehensionLevel(4);
    setTopics(baseTopics);
    setMessage("Formulario restaurado a los valores iniciales.");
    setMessageTone("info");
  };

  const handleSave = async () => {
    if (!course?.id) {
      setMessage("No se encontro la materia seleccionada para guardar.");
      setMessageTone("error");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveStudentCheckIn(course.id, {
        attendance: attendance >= 50,
        taskCompletion,
        studyHours,
        emotionalState: emotionalStateByRating[emotionalState],
        generalComprehension: ratingToPercent(comprehensionLevel),
        topicResponses: topics.map((topic) => ({
          topicId: topic.topicId,
          comprehension: ratingToPercent(topic.comprehensionLevel),
        })),
        notes: skillsText.trim() || undefined,
      });

      setMessage(
        "Registro semanal guardado. La analitica de la materia se recalculara automaticamente."
      );
      setMessageTone("success");
    } catch {
      setMessage(
        "No se pudo guardar el registro semanal. Revisa tu sesion e intenta nuevamente."
      );
      setMessageTone("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <MotionCard
        as="section"
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <Badge className="bg-blue-100 text-blue-700">
              Seguimiento semanal
            </Badge>

            <Heading as="h4" className="mt-3 text-gray-900">
              {course?.name ?? "Registro de avance"}
            </Heading>

            <Text variant="small" className="mt-2 max-w-2xl text-gray-600">
              Actualiza asistencia, cumplimiento, habitos de estudio y
              comprension para que el acompanamiento academico sea mas preciso.
            </Text>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <Text
              variant="caption"
              className="font-bold uppercase text-gray-500"
            >
              Contexto
            </Text>
            <Text variant="small" className="mt-2 font-semibold text-gray-900">
              {course?.semester ?? "Periodo no registrado"}
            </Text>
            <Text variant="caption" className="mt-1 text-gray-600">
              {course?.careerName ?? "Carrera no registrada"}
            </Text>
          </div>
        </div>
      </MotionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentCourseMetricsPanel
          attendance={attendance}
          taskCompletion={taskCompletion}
          emotionalState={emotionalState}
          onChangeAttendance={setAttendance}
          onChangeTaskCompletion={setTaskCompletion}
          onChangeEmotionalState={setEmotionalState}
        />

        <StudentStudyHabitsPanel
          studyHours={studyHours}
          skillsText={skillsText}
          comprehensionLevel={comprehensionLevel}
          onChangeStudyHours={setStudyHours}
          onChangeSkillsText={setSkillsText}
          onChangeComprehensionLevel={setComprehensionLevel}
        />
      </div>

      {baseTopics.length > 0 ? (
        <StudentSyllabusSurveyPanel
          topics={topics}
          onChangeTopicLevel={handleChangeTopicLevel}
        />
      ) : !isLoadingCheckIn ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5">
          <Text variant="small" className="text-gray-600">
            Tu docente aún no cargó el sílabo de esta materia. Cuando lo haga,
            aquí podrás calificar tu comprensión por tema.
          </Text>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <FeedbackMessage
            message={message}
            tone={messageTone}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="min-w-36 gap-2"
        >
          <FiRotateCcw size={16} />
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoadingCheckIn}
          className="min-w-36 gap-2"
        >
          <FiCheckCircle size={16} />
          {isSaving ? "Guardando" : "Guardar"}
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar size={16} />
          Registro semanal
        </div>
      </div>
    </div>
  );
}
