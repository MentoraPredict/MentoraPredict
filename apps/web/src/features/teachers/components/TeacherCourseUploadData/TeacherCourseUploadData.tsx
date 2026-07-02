import { useState } from "react";
import { AxiosError } from "axios";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";

import CourseFilesUploadPanel from "@/features/teachers/components/CourseFilesUploadPanel";
import SyllabusTopicsPanel from "@/features/teachers/components/SyllabusTopicsPanel";
import { importGradesFile } from "@/services/academic.service";

import type { CourseUploadedFile } from "@/types/course";

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
  const [syllabusTopicsText, setSyllabusTopicsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleCancel = () => {
    setFiles([]);
    setSyllabusTopicsText("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
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
      <CourseFilesUploadPanel
        files={files}
        onAddFile={handleAddFile}
        onRemoveFile={handleRemoveFile}
      />

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
          disabled={isSaving}
          className={isSaving ? "cursor-not-allowed opacity-60" : ""}
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
