import { useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import {
  DEFAULT_PERIODS_BY_SCHEME,
  REGIME_LABELS,
  SCHEME_LABELS,
  type CreateSchoolYearPayload,
  type PeriodScheme,
  type SchoolRegime,
} from "@/types/academic/school-year.types";

interface AdminSchoolYearFormProps {
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (payload: CreateSchoolYearPayload) => void;
}

interface FormState {
  name: string;
  code: string;
  regime: SchoolRegime;
  periodScheme: PeriodScheme;
  periodsCount: number;
  startDate: string;
  endDate: string;
  minClassDays: number;
  recoveryStartDate: string;
  recoveryEndDate: string;
  supplementaryStartDate: string;
  supplementaryEndDate: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  code: "",
  regime: "SIERRA_AMAZONIA",
  periodScheme: "TRIMESTER",
  periodsCount: DEFAULT_PERIODS_BY_SCHEME.TRIMESTER,
  startDate: "",
  endDate: "",
  minClassDays: 200,
  recoveryStartDate: "",
  recoveryEndDate: "",
  supplementaryStartDate: "",
  supplementaryEndDate: "",
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export default function AdminSchoolYearForm({
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: AdminSchoolYearFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [localError, setLocalError] = useState<string | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSchemeChange = (scheme: PeriodScheme) => {
    setForm((current) => ({
      ...current,
      periodScheme: scheme,
      periodsCount: DEFAULT_PERIODS_BY_SCHEME[scheme],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      setLocalError("El nombre y el código son obligatorios.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setLocalError("Indica la fecha de inicio y de fin del año lectivo.");
      return;
    }

    if (form.startDate >= form.endDate) {
      setLocalError("La fecha de inicio debe ser anterior a la de fin.");
      return;
    }

    setLocalError(null);

    onSubmit({
      name: form.name.trim(),
      code: form.code.trim(),
      regime: form.regime,
      periodScheme: form.periodScheme,
      periodsCount: form.periodsCount,
      startDate: form.startDate,
      endDate: form.endDate,
      minClassDays: form.minClassDays,
      recoveryStartDate: form.recoveryStartDate || undefined,
      recoveryEndDate: form.recoveryEndDate || undefined,
      supplementaryStartDate: form.supplementaryStartDate || undefined,
      supplementaryEndDate: form.supplementaryEndDate || undefined,
    });
  };

  const message = localError ?? errorMessage;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-h-[85vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
    >
      <div>
        <Heading as="h4" className="text-gray-900">
          Nuevo año lectivo
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          Los periodos de calificación se generan automáticamente en partes
          iguales y puedes ajustar sus fechas después.
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="school-year-name" label="Nombre">
          <Input
            id="school-year-name"
            placeholder="Año lectivo 2025-2026"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </Field>

        <Field id="school-year-code" label="Código">
          <Input
            id="school-year-code"
            placeholder="2025-2026"
            maxLength={15}
            value={form.code}
            onChange={(e) => setField("code", e.target.value)}
          />
        </Field>

        <Field id="school-year-regime" label="Régimen">
          <Select
            id="school-year-regime"
            value={form.regime}
            onChange={(e) => setField("regime", e.target.value as SchoolRegime)}
          >
            {Object.entries(REGIME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="school-year-scheme" label="Organización del año">
          <Select
            id="school-year-scheme"
            value={form.periodScheme}
            onChange={(e) =>
              handleSchemeChange(e.target.value as PeriodScheme)
            }
          >
            {Object.entries(SCHEME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="school-year-count" label="Cantidad de periodos">
          <Select
            id="school-year-count"
            value={form.periodsCount}
            onChange={(e) => setField("periodsCount", Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="school-year-min-days" label="Mínimo de días de clase">
          <Input
            id="school-year-min-days"
            type="number"
            min={1}
            max={366}
            value={form.minClassDays}
            onChange={(e) => setField("minClassDays", Number(e.target.value))}
          />
        </Field>

        <Field id="school-year-start" label="Inicio de clases">
          <Input
            id="school-year-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />
        </Field>

        <Field id="school-year-end" label="Fin de clases">
          <Input
            id="school-year-end"
            type="date"
            value={form.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
          />
        </Field>
      </div>

      <div>
        <Text variant="small" className="mb-2 font-medium text-gray-700">
          Después del fin de clases (opcional)
        </Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="recovery-start" label="Recuperación: inicio">
            <Input
              id="recovery-start"
              type="date"
              value={form.recoveryStartDate}
              onChange={(e) => setField("recoveryStartDate", e.target.value)}
            />
          </Field>
          <Field id="recovery-end" label="Recuperación: fin">
            <Input
              id="recovery-end"
              type="date"
              value={form.recoveryEndDate}
              onChange={(e) => setField("recoveryEndDate", e.target.value)}
            />
          </Field>
          <Field id="supplementary-start" label="Supletorios: inicio">
            <Input
              id="supplementary-start"
              type="date"
              value={form.supplementaryStartDate}
              onChange={(e) =>
                setField("supplementaryStartDate", e.target.value)
              }
            />
          </Field>
          <Field id="supplementary-end" label="Supletorios: fin">
            <Input
              id="supplementary-end"
              type="date"
              value={form.supplementaryEndDate}
              onChange={(e) => setField("supplementaryEndDate", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {message}
          </Text>
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Crear año lectivo
        </Button>
      </div>
    </form>
  );
}
