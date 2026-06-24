import { useState } from "react";
import { AxiosError } from "axios";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";

import CourseFilesUploadPanel from "@/features/teachers/components/CourseFilesUploadPanel";
import GradeEvaluationPanel from "@/features/teachers/components/GradeEvaluationPanel";
import SyllabusTopicsPanel from "@/features/teachers/components/SyllabusTopicsPanel";
import { importGradesFile } from "@/services/academic.service";

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

function getUploadErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    const readableMessage = Array.isArray(message) ? message.join(", ") : message;

    return readableMessage
      ? `No se pudieron subir los datos. ${readableMessage}`
      : `No se pudieron subir los datos. Codigo HTTP: ${
          error.response?.status ?? "desconocido"
        }.`;
  }

  return "No se pudieron subir los datos. Intenta nuevamente.";
}

export default function TeacherCourseUploadData() {
  const [files, setFiles] = useState<CourseUploadedFile[]>([]);

  const [evaluationItems, setEvaluationItems] = useState<GradeEvaluationItem[]>(
    initialEvaluationItems,
  );

  const [syllabusTopicsText, setSyllabusTopicsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalEvaluation = evaluationItems.reduce(
    (sum, item) => sum + item.percentage,
    0,
  );

  const handleAddFile = (file: File) => {
    setFiles((currentFiles) => [
      ...currentFiles,
      {
        id: crypto.randomUUID(),
        name: file.name,
        file,
      },
    ]);
    setError(null);
    setSuccessMessage(null);
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
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (totalEvaluation !== 100) {
      return;
    }

    if (files.length === 0) {
      setError("Selecciona al menos un archivo CSV o Excel para subir.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const results = await Promise.all(
        files.map((uploadedFile) => importGradesFile(uploadedFile.file))
      );
      const importedCount = results.reduce(
        (sum, result) => sum + result.imported,
        0
      );

      setSuccessMessage(
        `Datos subidos correctamente. Registros importados: ${importedCount}.`
      );
    } catch (uploadError) {
      setError(getUploadErrorMessage(uploadError));
    } finally {
      setIsSaving(false);
    }
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

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <Text variant="small" className="font-medium text-emerald-700">
            {successMessage}
          </Text>
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={totalEvaluation !== 100 || isSaving}
          className={
            totalEvaluation !== 100 || isSaving
              ? "cursor-not-allowed opacity-60"
              : ""
          }
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
