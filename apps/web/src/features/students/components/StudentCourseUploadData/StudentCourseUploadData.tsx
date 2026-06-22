import { useState } from "react";

import Button from "@/components/atoms/Button";

import StudentCourseMetricsPanel from "@/features/students/components/StudentCourseMetricsPanel";
import StudentStudyHabitsPanel from "@/features/students/components/StudentStudyHabitsPanel";
import StudentSyllabusSurveyPanel from "@/features/students/components/StudentSyllabusSurveyPanel";

import type { StudentTopicSurveyItem } from "@/types/course";

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

export default function StudentCourseUploadData() {
  const [attendance] = useState(66);
  const [taskCompletion] = useState(66);
  const [studyHours] = useState(4);

  const [emotionalState, setEmotionalState] = useState(4);
  const [skillsText, setSkillsText] = useState("");
  const [comprehensionLevel, setComprehensionLevel] = useState(4);

  const [topics, setTopics] = useState<StudentTopicSurveyItem[]>(initialTopics);

  const handleChangeTopicLevel = (
    topicId: string,
    value: StudentTopicSurveyItem["comprehensionLevel"],
  ) => {
    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.topicId === topicId
          ? {
              ...topic,
              comprehensionLevel: value,
            }
          : topic,
      ),
    );
  };

  const handleCancel = () => {
    setEmotionalState(4);
    setSkillsText("");
    setComprehensionLevel(4);
    setTopics(initialTopics);
  };

  const handleSave = () => {
    console.log({
      attendance,
      taskCompletion,
      studyHours,
      emotionalState,
      skillsText,
      comprehensionLevel,
      topics,
    });
  };

  return (
    <div className="space-y-6">
      <div
        className="
                    grid
                    gap-6
                    lg:grid-cols-2
                "
      >
        <StudentCourseMetricsPanel
          attendance={attendance}
          taskCompletion={taskCompletion}
          emotionalState={emotionalState}
          onChangeEmotionalState={setEmotionalState}
        />

        <StudentStudyHabitsPanel
          studyHours={studyHours}
          skillsText={skillsText}
          comprehensionLevel={comprehensionLevel}
          onChangeSkillsText={setSkillsText}
          onChangeComprehensionLevel={setComprehensionLevel}
        />
      </div>

      <StudentSyllabusSurveyPanel
        topics={topics}
        onChangeTopicLevel={handleChangeTopicLevel}
      />

      <div className="flex justify-center gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="min-w-28"
        >
          Cancelar
        </Button>

        <Button type="button" onClick={handleSave} className="min-w-28">
          Guardar
        </Button>
      </div>
    </div>
  );
}
