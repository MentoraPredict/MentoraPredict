import { useState } from "react";
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

import type { Course, StudentTopicSurveyItem } from "@/types/course";

interface StudentCourseUploadDataProps {
  course?: Course | null;
}

const initialTopics: StudentTopicSurveyItem[] = [
  {
    topicId: "1",
    topicTitle: "tema 1",
    comprehensionLevel: 4,
  },
  {
    topicId: "2",
    topicTitle: "tema 2",
    comprehensionLevel: 4,
  },
  {
    topicId: "3",
    topicTitle: "tema 3",
    comprehensionLevel: 4,
  },
];

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

  const [topics, setTopics] = useState<StudentTopicSurveyItem[]>(initialTopics);

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
    setTopics(initialTopics);
    setMessage("Formulario restaurado a los valores iniciales.");
  };

  const handleSave = () => {
    console.log({
      courseId: course?.id,
      attendance,
      taskCompletion,
      studyHours,
      emotionalState,
      skillsText,
      comprehensionLevel,
      topics,
    });

    setMessage(
      "Registro preparado. Cuando el endpoint este activo, estos datos alimentaran el seguimiento semanal."
    );
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

      <StudentSyllabusSurveyPanel
        topics={topics}
        onChangeTopicLevel={handleChangeTopicLevel}
      />

      {message ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <FeedbackMessage
            message={message}
            tone={message.startsWith("Registro") ? "success" : "info"}
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
          className="min-w-36 gap-2"
        >
          <FiCheckCircle size={16} />
          Guardar
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCalendar size={16} />
          Registro semanal
        </div>
      </div>
    </div>
  );
}
