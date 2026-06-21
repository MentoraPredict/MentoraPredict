import { useState } from "react";

import Button from "@/components/atoms/Button";

import CourseFilesUploadPanel from "@/features/teachers/components/CourseFilesUploadPanel";
import GradeEvaluationPanel from "@/features/teachers/components/GradeEvaluationPanel";
import SyllabusTopicsPanel, {
  parseSyllabusTopics,
} from "@/features/teachers/components/SyllabusTopicsPanel";

import type { CourseUploadedFile, GradeEvaluationItem } from "@/types/course";

const initialEvaluationItems: GradeEvaluationItem[] = [
  {
    id: "individual",
    label: "Individual",
    percentage: 10,
  },
  {
    id: "group",
    label: "Grupal",
    percentage: 20,
  },
  {
    id: "exam-1",
    label: "Examen 1",
    percentage: 30,
  },
  {
    id: "exam-2",
    label: "Examen 2",
    percentage: 40,
  },
];

export default function TeacherCourseUploadData() {
  const [files, setFiles] = useState<CourseUploadedFile[]>([
    {
      id: "1",
      name: "Archivo 1.csv",
    },
    {
      id: "2",
      name: "Archivo 2.xlsx",
    },
  ]);

  const [evaluationItems, setEvaluationItems] = useState<GradeEvaluationItem[]>(
    initialEvaluationItems,
  );

  const [syllabusTopicsText, setSyllabusTopicsText] = useState("");

  const totalEvaluation = evaluationItems.reduce(
    (sum, item) => sum + item.percentage,
    0,
  );

  const handleAddFile = (fileName: string) => {
    setFiles((currentFiles) => [
      ...currentFiles,
      {
        id: crypto.randomUUID(),
        name: fileName,
      },
    ]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId),
    );
  };

  const handleChangePercentage = (itemId: string, percentage: number) => {
    setEvaluationItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              percentage,
            }
          : item,
      ),
    );
  };

  const handleCancel = () => {
    setFiles([]);
    setEvaluationItems(initialEvaluationItems);
    setSyllabusTopicsText("");
  };

  const handleSave = () => {
    const syllabusTopics = parseSyllabusTopics(syllabusTopicsText);

    if (totalEvaluation !== 100) {
      return;
    }

    console.log({
      files,
      evaluationItems,
      syllabusTopics,
    });
  };

  return (
    <div className="space-y-6">
      <div
        className="
                    grid
                    gap-6
                    xl:grid-cols-[1fr_380px]
                "
      >
        <CourseFilesUploadPanel
          files={files}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
        />

        <GradeEvaluationPanel
          items={evaluationItems}
          onChangePercentage={handleChangePercentage}
        />
      </div>

      <SyllabusTopicsPanel
        value={syllabusTopicsText}
        onChange={setSyllabusTopicsText}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={totalEvaluation !== 100}
          className={
            totalEvaluation !== 100 ? "cursor-not-allowed opacity-60" : ""
          }
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
