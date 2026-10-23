import { useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import CollapsibleGroup from "@/components/molecules/CollapsibleGroup";
import ListToolbar from "@/components/molecules/ListToolbar";
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

/** Minúsculas y sin tildes, para que «ano» encuentre «Año». */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function matchesSearch(schoolYear: SchoolYear, query: string) {
  const haystack = [
    schoolYear.name,
    schoolYear.code,
    REGIME_LABELS[schoolYear.regime],
    SCHEME_LABELS[schoolYear.periodScheme],
    STATUS_LABELS[schoolYear.status],
    ...schoolYear.periods.flatMap((period) => [period.name, period.code]),
  ]
    .map(normalize)
    .join(" ");

  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

type SchoolYearGroupBy = "" | "status" | "regime" | "scheme";

function groupKey(year: SchoolYear, groupBy: SchoolYearGroupBy) {
  if (groupBy === "status") return STATUS_LABELS[year.status];
  if (groupBy === "regime") return REGIME_LABELS[year.regime];
  return SCHEME_LABELS[year.periodScheme];
}

function SchoolYearCard({
  schoolYear,
  isSubmitting,
  onChangeStatus,
  onDelete,
  onSavePeriod,
}: SchoolYearCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFinished = schoolYear.status === "FINISHED";
  const contentId = `school-year-${schoolYear.id}`;

  return (
    <article className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <FiChevronDown
            size={20}
            aria-hidden="true"
            className={`mt-1 shrink-0 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />

          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <Heading as="h5" className="text-gray-900">
                {schoolYear.name}
              </Heading>
              <Badge tone={STATUS_TONE[schoolYear.status]}>
                {STATUS_LABELS[schoolYear.status]}
              </Badge>
              {schoolYear.warnings.length > 0 ? (
                <Badge tone="amber">
                  {schoolYear.warnings.length}{" "}
                  {schoolYear.warnings.length === 1 ? "aviso" : "avisos"}
                </Badge>
              ) : null}
            </span>

            <Text variant="caption" className="mt-1 block text-gray-600">
              {REGIME_LABELS[schoolYear.regime]} ·{" "}
              {SCHEME_LABELS[schoolYear.periodScheme]} (
              {schoolYear.periods.length}) · Clases:{" "}
              {formatRange(schoolYear.startDate, schoolYear.endDate)}
            </Text>
          </span>
        </button>

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

      {isOpen ? (
        <div id={contentId} className="border-t border-gray-200">
          <div className="px-5 py-3">
            <Text variant="caption" className="block text-gray-600">
              Mínimo {schoolYear.minClassDays} días de clase
            </Text>
            <Text variant="caption" className="block text-gray-600">
              Recuperación:{" "}
              {formatRange(
                schoolYear.recoveryStartDate,
                schoolYear.recoveryEndDate
              )}
            </Text>
            <Text variant="caption" className="block text-gray-600">
              Supletorios:{" "}
              {formatRange(
                schoolYear.supplementaryStartDate,
                schoolYear.supplementaryEndDate
              )}
            </Text>
          </div>

          {schoolYear.warnings.length > 0 ? (
            <div className="border-t border-amber-200 bg-amber-50 px-5 py-3">
              {schoolYear.warnings.map((warning) => (
                <Text key={warning} variant="small" className="text-amber-800">
                  {warning}
                </Text>
              ))}
            </div>
          ) : null}

          {schoolYear.periods.length === 0 ? (
            <div className="border-t border-gray-200 px-5 py-4">
              <Text variant="small" className="text-gray-600">
                Este año lectivo aún no tiene periodos de calificación.
              </Text>
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
        </div>
      ) : null}
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regimeFilter, setRegimeFilter] = useState("");
  const [groupBy, setGroupBy] = useState<SchoolYearGroupBy>("");

  const visibleYears = useMemo(
    () =>
      schoolYears.filter(
        (year) =>
          (!search.trim() || matchesSearch(year, search)) &&
          (!statusFilter || year.status === statusFilter) &&
          (!regimeFilter || year.regime === regimeFilter)
      ),
    [schoolYears, search, statusFilter, regimeFilter]
  );

  const groupedYears = useMemo(() => {
    if (!groupBy) return [];
    const groups = new Map<string, SchoolYear[]>();
    for (const year of visibleYears) {
      const key = groupKey(year, groupBy);
      groups.set(key, [...(groups.get(key) ?? []), year]);
    }
    return [...groups.entries()];
  }, [visibleYears, groupBy]);

  const clearAll = () => {
    setSearch("");
    setStatusFilter("");
    setRegimeFilter("");
    setGroupBy("");
  };

  const renderCard = (schoolYear: SchoolYear) => (
    <SchoolYearCard
      key={schoolYear.id}
      schoolYear={schoolYear}
      isSubmitting={isSubmitting}
      onChangeStatus={changeStatus}
      onDelete={remove}
      onSavePeriod={savePeriod}
    />
  );

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
            del año (trimestres, quimestres o semestres). Abre un año para ver
            y editar sus periodos.
          </Text>
        </div>

        <Button type="button" onClick={() => setIsFormOpen(true)}>
          Nuevo año lectivo
        </Button>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <ListToolbar
          search={search}
          searchPlaceholder="Buscar por año, código, estado o periodo"
          searchLabel="Buscar años lectivos"
          onSearchChange={setSearch}
          onClear={clearAll}
          filters={[
            {
              id: "status",
              label: "Estado",
              value: statusFilter,
              allLabel: "Todos los estados",
              options: (Object.keys(STATUS_LABELS) as SchoolYearStatus[]).map(
                (value) => ({ value, label: STATUS_LABELS[value] })
              ),
              onChange: setStatusFilter,
            },
            {
              id: "regime",
              label: "Régimen",
              value: regimeFilter,
              allLabel: "Todos los regímenes",
              options: (
                Object.keys(REGIME_LABELS) as (keyof typeof REGIME_LABELS)[]
              ).map((value) => ({ value, label: REGIME_LABELS[value] })),
              onChange: setRegimeFilter,
            },
          ]}
          group={{
            value: groupBy,
            options: [
              { value: "status", label: "Estado" },
              { value: "regime", label: "Régimen" },
              { value: "scheme", label: "Organización del año" },
            ],
            onChange: (value) => setGroupBy(value as SchoolYearGroupBy),
          }}
        />
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

      {!isLoading &&
      !error &&
      schoolYears.length > 0 &&
      visibleYears.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            Ningún año lectivo coincide con «{search.trim()}».
          </Text>
        </div>
      ) : null}

      {groupBy
        ? groupedYears.map(([label, years]) => (
            <CollapsibleGroup key={label} label={label} count={years.length}>
              <div className="p-4 pb-0">{years.map(renderCard)}</div>
            </CollapsibleGroup>
          ))
        : visibleYears.map(renderCard)}
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
