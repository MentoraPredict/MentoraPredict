import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AxiosError } from "axios";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import ImageUploadPreview from "@/components/molecules/ImageUploadPreview";
import type { UpdateTeacherCoursePayload } from "@/services/academic.service";
import type { Course } from "@/types/course";

interface TeacherCourseEditProps {
  course: Course;
  isSaving?: boolean;
  onSave: (payload: UpdateTeacherCoursePayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<string | undefined>;
  onDeleteImage: () => Promise<void>;
  /** Contenido de la pestaña «Temas del sílabo». */
  syllabus: ReactNode;
}

type SettingsTab = "description" | "syllabus";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "description", label: "Descripción" },
  { id: "syllabus", label: "Temas del sílabo" },
];

function getSaveErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return `No se pudieron guardar los cambios. Código HTTP: ${
      error.response?.status ?? "desconocido"
    }.`;
  }

  return "No se pudieron guardar los cambios. Intenta nuevamente.";
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div>
      <Text variant="caption" className="font-bold uppercase text-gray-500">
        {label}
      </Text>
      <Text variant="small" className="mt-1 text-gray-900">
        {value || "—"}
      </Text>
    </div>
  );
}

export default function TeacherCourseEdit({
  course,
  isSaving = false,
  onSave,
  onUploadImage,
  onDeleteImage,
  syllabus,
}: TeacherCourseEditProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("description");
  const [description, setDescription] = useState(course.description);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(course.imageUrl);

  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const hasChanges =
    description.trim() !== (course.description ?? "").trim() ||
    selectedImage !== null;

  const handleCancel = () => {
    setDescription(course.description);
    setError(null);
    setSuccessMessage(null);
    setSelectedImage(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      if (description.trim() !== (course.description ?? "").trim()) {
        await onSave({ name: course.name, description: description.trim() });
        setDescription(description.trim());
      }
      if (selectedImage) {
        setImageUrl(await onUploadImage(selectedImage));
        setSelectedImage(null);
      }
      setSuccessMessage("Cambios guardados correctamente.");
    } catch (saveError) {
      setError(getSaveErrorMessage(saveError));
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <Heading as="h4" className="text-gray-900">
        Configuración de la materia
      </Heading>

      <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr]">
        <div>
          <ImageUploadPreview
            imageUrl={previewUrl ?? imageUrl}
            alt={`Portada de ${course.name}`}
            helperText="Cambiar portada de la materia"
            onChangeImage={(file) => setSelectedImage(file)}
          />
          {imageUrl && !selectedImage ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 px-4 py-2 text-sm"
              disabled={isSaving}
              onClick={async () => {
                try {
                  await onDeleteImage();
                  setImageUrl(undefined);
                  setSuccessMessage("Portada eliminada correctamente.");
                } catch (deleteError) {
                  setError(getSaveErrorMessage(deleteError));
                }
              }}
            >
              Eliminar portada
            </Button>
          ) : null}
        </div>

        <dl className="grid content-start gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Materia" value={course.name} />
          <ReadOnlyField label="Código" value={course.code ?? ""} />
          <ReadOnlyField label="Periodo" value={course.semester} />
          <ReadOnlyField label="Docente" value={course.teacherName} />
          <ReadOnlyField
            label="Estudiantes matriculados"
            value={String(course.enrolledCount ?? 0)}
          />
        </dl>
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

      <div
        role="tablist"
        aria-label="Configuración de la materia"
        className="mb-5 mt-8 flex gap-2 border-b border-gray-200"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "description" ? (
        <div>
          <Textarea
            rows={6}
            maxLength={500}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSuccessMessage(null);
            }}
            placeholder="Descripción de la materia"
            aria-label="Descripción de la materia"
          />

          <div className="mt-2 flex justify-end">
            <Text variant="caption">{description.length} / 500</Text>
          </div>
        </div>
      ) : (
        syllabus
      )}

      {hasChanges ? (
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="min-w-28"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-28"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}