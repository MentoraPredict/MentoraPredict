import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

import GradebookTable from "@/features/teachers/components/GradebookTable";
import NewActivityForm from "@/features/teachers/components/NewActivityForm";
import TeacherCourseSupplementary from "@/features/teachers/components/TeacherCourseSupplementary";
import useGradebook from "@/features/teachers/hooks/useGradebook";

interface TeacherCourseGradebookProps {
  courseId: string;
}

export default function TeacherCourseGradebook({
  courseId,
}: TeacherCourseGradebookProps) {
  const {
    gradebook,
    isLoading,
    isSaving,
    error,
    notice,
    selectPeriod,
    cellValue,
    setDraft,
    isInvalid,
    pendingCount,
    hasInvalid,
    save,
    addActivity,
    archiveActivity,
  } = useGradebook(courseId);
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading && !gradebook) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando libro de calificaciones...</Text>
      </div>
    );
  }

  if (!gradebook) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
        <Text variant="small" className="font-medium text-red-700">
          {error ?? "No se pudo cargar el libro de calificaciones."}
        </Text>
      </div>
    );
  }

  const { period, periods } = gradebook;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h4" className="text-gray-900">
            Libro de calificaciones
          </Heading>
          <Text variant="small" className="mt-1 text-gray-600">
            Escala {gradebook.scale.minValue}–{gradebook.scale.maxValue}, mínimo
            para aprobar {gradebook.scale.passingGrade}. Deja una celda vacía
            para no registrar nota.
          </Text>
        </div>

        <div className="flex items-end gap-3">
          <div className="min-w-[12rem]">
            <Label htmlFor="gradebook-period">Periodo</Label>
            <Select
              id="gradebook-period"
              value={period.id}
              disabled={isSaving || isLoading}
              onChange={(e) => selectPeriod(e.target.value)}
            >
              {periods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.isClosed ? " (cerrado)" : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {period.isClosed ? (
          <Badge tone="amber">Periodo cerrado: solo lectura</Badge>
        ) : (
          <Badge tone="green">Periodo abierto</Badge>
        )}
        {period.gradesDueDate ? (
          <Text variant="caption" className="text-gray-600">
            Fecha límite de registro: {period.gradesDueDate}
          </Text>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}
      {notice ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            {notice}
          </Text>
        </div>
      ) : null}

      <GradebookTable
        gradebook={gradebook}
        isReadOnly={period.isClosed}
        cellValue={cellValue}
        isInvalid={isInvalid}
        onChange={setDraft}
        onArchive={(activityId) => void archiveActivity(activityId)}
      />

      {!period.isClosed ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setIsFormOpen(true)}>
            Nueva actividad
          </Button>

          <div className="flex items-center gap-3">
            {hasInvalid ? (
              <Text variant="caption" className="text-red-700">
                Hay notas fuera de la escala o que no son números.
              </Text>
            ) : pendingCount > 0 ? (
              <Text variant="caption" className="text-gray-600">
                {pendingCount} cambio(s) sin guardar
              </Text>
            ) : null}
            <Button
              type="button"
              isLoading={isSaving}
              disabled={pendingCount === 0 || hasInvalid}
              onClick={() => void save()}
            >
              Guardar notas
            </Button>
          </div>
        </div>
      ) : null}

      <TeacherCourseSupplementary
        courseId={courseId}
        decimals={gradebook.scale.decimals}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        ariaLabel="Nueva actividad"
      >
        <NewActivityForm
          components={gradebook.components}
          periodName={period.name}
          isSubmitting={isSaving}
          onSubmit={addActivity}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
