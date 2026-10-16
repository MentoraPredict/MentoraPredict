import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

import AdminGradingPeriodRow from "@/features/admin/components/AdminGradingPeriodRow";
import AdminSchoolYearForm from "@/features/admin/components/AdminSchoolYearForm";
import useAdminSchoolYears from "@/features/admin/hooks/useAdminSchoolYears";
import {
  REGIME_LABELS,
  SCHEME_LABELS,
  STATUS_LABELS,
  type SchoolYear,
  type SchoolYearStatus,
} from "@/types/academic/school-year.types";

const STATUS_TONE: Record<SchoolYearStatus, "neutral" | "green" | "amber"> = {
  PLANNED: "amber",
  ACTIVE: "green",
  FINISHED: "neutral",
};

interface SchoolYearCardProps {
  schoolYear: SchoolYear;
  isSubmitting: boolean;
  onChangeStatus: (id: string, status: SchoolYearStatus) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSavePeriod: ReturnType<typeof useAdminSchoolYears>["savePeriod"];
}

function formatRange(start: string | null, end: string | null) {
  return start && end ? `${start} → ${end}` : "No definido";
}

function SchoolYearCard({
  schoolYear,
  isSubmitting,
  onChangeStatus,
  onDelete,
  onSavePeriod,
}: SchoolYearCardProps) {
  const isFinished = schoolYear.status === "FINISHED";

  return (
    <article className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Heading as="h5" className="text-gray-900">
              {schoolYear.name}
            </Heading>
            <Badge tone={STATUS_TONE[schoolYear.status]}>
              {STATUS_LABELS[schoolYear.status]}
            </Badge>
          </div>
          <Text variant="caption" className="mt-1 text-gray-600">
            {REGIME_LABELS[schoolYear.regime]} ·{" "}
            {SCHEME_LABELS[schoolYear.periodScheme]} (
            {schoolYear.periodsCount}) · mínimo {schoolYear.minClassDays} días
            de clase
          </Text>
          <Text variant="caption" className="mt-1 text-gray-600">
            Clases: {formatRange(schoolYear.startDate, schoolYear.endDate)}
          </Text>
          <Text variant="caption" className="text-gray-600">
            Recuperación:{" "}
            {formatRange(
              schoolYear.recoveryStartDate,
              schoolYear.recoveryEndDate
            )}
          </Text>
          <Text variant="caption" className="text-gray-600">
            Supletorios:{" "}
            {formatRange(
              schoolYear.supplementaryStartDate,
              schoolYear.supplementaryEndDate
            )}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          {schoolYear.status === "PLANNED" ? (
            <>
              <Button
                type="button"
                className="px-4 py-2 text-sm"
                disabled={isSubmitting}
                onClick={() => void onChangeStatus(schoolYear.id, "ACTIVE")}
              >
                Activar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-4 py-2 text-sm"
                disabled={isSubmitting}
                onClick={() => void onDelete(schoolYear.id)}
              >
                Eliminar
              </Button>
            </>
          ) : null}

          {schoolYear.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="outline"
              className="px-4 py-2 text-sm"
              disabled={isSubmitting}
              onClick={() => void onChangeStatus(schoolYear.id, "FINISHED")}
            >
              Finalizar año
            </Button>
          ) : null}
        </div>
      </header>

      {schoolYear.warnings.length > 0 ? (
        <div className="border-t border-amber-200 bg-amber-50 px-5 py-3">
          {schoolYear.warnings.map((warning) => (
            <Text key={warning} variant="small" className="text-amber-800">
              {warning}
            </Text>
          ))}
        </div>
      ) : null}

      {schoolYear.periods.map((period) => (
        <AdminGradingPeriodRow
          key={period.id}
          period={period}
          isEditable={!isFinished}
          isSubmitting={isSubmitting}
          onSave={onSavePeriod}
        />
      ))}
    </article>
  );
}

export default function AdminSchoolYearsManagement() {
  const {
    schoolYears,
    isLoading,
    isSubmitting,
    error,
    actionError,
    clearActionError,
    create,
    changeStatus,
    remove,
    savePeriod,
  } = useAdminSchoolYears();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreate = async (
    payload: Parameters<typeof create>[0]
  ) => {
    if (await create(payload)) {
      setIsFormOpen(false);
    }
  };

  const closeForm = () => {
    clearActionError();
    setIsFormOpen(false);
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading as="h3" className="text-gray-900">
            Años lectivos y periodos
          </Heading>
          <Text variant="small" className="mt-1 text-gray-600">
            Configura el calendario escolar según el régimen y la organización
            del año (trimestres, quimestres o semestres).
          </Text>
        </div>

        <Button type="button" onClick={() => setIsFormOpen(true)}>
          Nuevo año lectivo
        </Button>
      </div>

      {actionError && !isFormOpen ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {actionError}
          </Text>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {!isLoading && !error && schoolYears.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            Aún no hay años lectivos. Crea el primero para definir los periodos
            de calificación.
          </Text>
        </div>
      ) : null}

      {schoolYears.map((schoolYear) => (
        <SchoolYearCard
          key={schoolYear.id}
          schoolYear={schoolYear}
          isSubmitting={isSubmitting}
          onChangeStatus={changeStatus}
          onDelete={remove}
          onSavePeriod={savePeriod}
        />
      ))}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        ariaLabel="Nuevo año lectivo"
      >
        <AdminSchoolYearForm
          isSubmitting={isSubmitting}
          errorMessage={actionError}
          onCancel={closeForm}
          onSubmit={(payload) => void handleCreate(payload)}
        />
      </Modal>
    </Container>
  );
}
