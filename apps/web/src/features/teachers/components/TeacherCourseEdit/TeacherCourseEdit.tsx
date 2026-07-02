import { useState } from "react";
import { AxiosError } from "axios";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import type { UpdateTeacherCoursePayload } from "@/services/academic.service";
import type { Course } from "@/types/course";

interface TeacherCourseEditProps {
  course: Course;
  isSaving?: boolean;
  onSave: (payload: UpdateTeacherCoursePayload) => Promise<void>;
}

function getSaveErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron guardar los cambios. Codigo HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron guardar los cambios. Intenta nuevamente.";
}

export default function TeacherCourseEdit({
  course,
  isSaving = false,
  onSave,
}: TeacherCourseEditProps) {
  const [courseName, setCourseName] = useState(course.name);
  const [description, setDescription] = useState(course.description);
  const [isEditingName, setIsEditingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCancel = () => {
    setCourseName(course.name);
    setDescription(course.description);
    setIsEditingName(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    const normalizedName = courseName.trim();

    if (!normalizedName) {
      setError("El nombre del curso es obligatorio.");
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await onSave({
        name: normalizedName,
        description: description.trim(),
      });
      setCourseName(normalizedName);
      setDescription(description.trim());
      setIsEditingName(false);
      setSuccessMessage("Curso actualizado correctamente.");
    } catch (saveError) {
      setError(getSaveErrorMessage(saveError));
    }
  };

  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-8
                shadow-sm
            "
    >
      <div>
        <div className="pt-4">
          {isEditingName ? (
            <div className="max-w-md">
              <Label htmlFor="courseName">Nombre del curso</Label>

              <Input
                id="courseName"
                value={courseName}
                onChange={(event) => {
                  setCourseName(event.target.value);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                }}
                className="mt-2"
              >
                <Text variant="caption" className="font-semibold text-blue-700">
                  Confirmar nombre
                </Text>
              </button>
            </div>
          ) : (
            <>
              <Heading as="h3" className="text-gray-900">
                {courseName}
              </Heading>

              <button
                type="button"
                onClick={() => {
                  setIsEditingName(true);
                }}
                className="mt-2"
              >
                <Text variant="caption" className="font-semibold text-blue-700">
                  ¿Editar nombre del curso?
                </Text>
              </button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <Text variant="small" className="font-medium text-emerald-700">
            {successMessage}
          </Text>
        </div>
      ) : null}

      <div className="mt-8">
        <Heading as="h5" className="text-gray-900">
          Descripción del curso
        </Heading>

        <Textarea
          rows={7}
          maxLength={500}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          placeholder="Descripción"
          className="mt-4"
        />

        <div className="mt-2 flex items-center justify-between">
          <button type="button">
            <Text variant="caption" className="font-semibold text-blue-700">
              Cambiar la descripción
            </Text>
          </button>

          <Text variant="caption">{description.length} / 500</Text>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="min-w-28"
        >
          Cancelar
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !courseName.trim()}
          className="min-w-28"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </section>
  );
}
