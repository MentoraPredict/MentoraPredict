import { useState } from "react";

import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import type {
  AttendanceRule,
  EducationLevel,
} from "@/types/academic/institution-config.types";

interface AttendanceRuleFormProps {
  rule: AttendanceRule;
  catalog: EducationLevel[];
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (payload: AttendanceRule) => void;
}

function parseWarnings(value: string): number[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

export default function AttendanceRuleForm({
  rule,
  catalog,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: AttendanceRuleFormProps) {
  const [maxPct, setMaxPct] = useState(String(rule.maxUnjustifiedPct));
  const [warnings, setWarnings] = useState(rule.warningPcts.join(", "));
  const [fromOrder, setFromOrder] = useState(String(rule.appliesFromLevelOrder));
  const [days, setDays] = useState(
    rule.justificationDays === null ? "" : String(rule.justificationDays)
  );

  return (
    <AdminConfigSection
      title="Regla de asistencia"
      description="Porcentaje máximo de faltas injustificadas por asignatura, avisos previos y desde qué nivel se aplica. Los valores iniciales deben contrastarse con el reglamento vigente."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={() =>
        onSave({
          maxUnjustifiedPct: Number(maxPct),
          warningPcts: parseWarnings(warnings),
          appliesFromLevelOrder: Number(fromOrder),
          justificationDays: days === "" ? null : Number(days),
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="attendance-max">
            Máximo de faltas injustificadas (%)
          </Label>
          <Input
            id="attendance-max"
            type="number"
            step="0.01"
            value={maxPct}
            onChange={(e) => setMaxPct(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="attendance-warnings">
            Avisos previos (%, separados por coma)
          </Label>
          <Input
            id="attendance-warnings"
            placeholder="5, 8"
            value={warnings}
            onChange={(e) => setWarnings(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="attendance-level">Se aplica desde el nivel</Label>
          <Select
            id="attendance-level"
            value={fromOrder}
            onChange={(e) => setFromOrder(e.target.value)}
          >
            {catalog.map((level) => (
              <option key={level.code} value={level.sortOrder}>
                {level.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="attendance-days">
            Días para justificar (vacío = sin límite)
          </Label>
          <Input
            id="attendance-days"
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
      </div>
    </AdminConfigSection>
  );
}
