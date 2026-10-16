import { useState } from "react";

import Text from "@/components/atoms/Text";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import {
  SHIFT_LABELS,
  type EducationLevel,
  type InstitutionLevel,
  type Shift,
} from "@/types/academic/institution-config.types";

interface InstitutionLevelsFormProps {
  catalog: EducationLevel[];
  levels: InstitutionLevel[];
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (levels: InstitutionLevel[]) => void;
}

const SHIFTS = Object.keys(SHIFT_LABELS) as Shift[];

export default function InstitutionLevelsForm({
  catalog,
  levels,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: InstitutionLevelsFormProps) {
  const [state, setState] = useState<Record<string, InstitutionLevel>>(() =>
    Object.fromEntries(
      catalog.map((level) => [
        level.code,
        levels.find((l) => l.levelCode === level.code) ?? {
          levelCode: level.code,
          isActive: false,
          shifts: [],
        },
      ])
    )
  );

  const update = (code: string, patch: Partial<InstitutionLevel>) => {
    setState((current) => ({
      ...current,
      [code]: { ...current[code], ...patch },
    }));
  };

  const toggleShift = (code: string, shift: Shift) => {
    const current = state[code].shifts;

    update(code, {
      shifts: current.includes(shift)
        ? current.filter((s) => s !== shift)
        : [...current, shift],
    });
  };

  return (
    <AdminConfigSection
      title="Niveles y jornadas"
      description="Activa los niveles que ofrece la institución y las jornadas de cada uno."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={() => onSave(Object.values(state))}
    >
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {catalog.map((level) => {
          const item = state[level.code];

          return (
            <div
              key={level.code}
              className="flex flex-wrap items-center gap-4 px-4 py-3"
            >
              <label className="flex min-w-[14rem] flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) =>
                    update(level.code, {
                      isActive: e.target.checked,
                      shifts:
                        e.target.checked && item.shifts.length === 0
                          ? ["MATUTINA"]
                          : item.shifts,
                    })
                  }
                />
                <span>
                  <Text variant="small" className="font-medium text-gray-900">
                    {level.name}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {level.evaluationMode === "QUALITATIVE"
                      ? "Evaluación cualitativa"
                      : "Evaluación cualitativa y/o cuantitativa"}
                    {level.allowsSupplementary ? " · admite supletorio" : ""}
                  </Text>
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                {SHIFTS.map((shift) => (
                  <label
                    key={shift}
                    className="flex items-center gap-1.5 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      disabled={!item.isActive}
                      checked={item.shifts.includes(shift)}
                      onChange={() => toggleShift(level.code, shift)}
                    />
                    {SHIFT_LABELS[shift]}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminConfigSection>
  );
}
