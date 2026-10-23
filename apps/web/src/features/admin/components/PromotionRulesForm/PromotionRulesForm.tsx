import { useState } from "react";

import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import {
  REPETITION_POLICY_LABELS,
  type EducationLevel,
  type PromotionRule,
  type RepetitionPolicy,
} from "@/types/academic/institution-config.types";

interface PromotionRulesFormProps {
  catalog: EducationLevel[];
  rules: PromotionRule[];
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (rules: PromotionRule[]) => void;
}

export default function PromotionRulesForm({
  catalog,
  rules,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: PromotionRulesFormProps) {
  const [state, setState] = useState<Record<string, PromotionRule>>(() =>
    Object.fromEntries(
      catalog.map((level) => [
        level.code,
        rules.find((r) => r.levelCode === level.code) ?? {
          levelCode: level.code,
          minAverage: 7,
          allowsSupplementary: false,
          supplementaryMinAverage: 4,
          repetitionPolicy: "NOT_APPLICABLE" as RepetitionPolicy,
        },
      ])
    )
  );

  const update = (code: string, patch: Partial<PromotionRule>) => {
    setState((current) => ({
      ...current,
      [code]: { ...current[code], ...patch },
    }));
  };

  return (
    <AdminConfigSection
      title="Reglas de promoción"
      description="Promedio mínimo, examen supletorio (y desde qué promedio se rinde) y política de repetición por nivel. El supletorio solo puede habilitarse en los niveles que lo admiten."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={() => onSave(Object.values(state))}
    >
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3 font-medium">Promedio mínimo</th>
              <th className="px-4 py-3 font-medium">Supletorio</th>
              <th className="px-4 py-3 font-medium">Desde promedio</th>
              <th className="px-4 py-3 font-medium">Repetición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {catalog.map((level) => {
              const rule = state[level.code];

              return (
                <tr key={level.code}>
                  <td className="px-4 py-3">
                    <Text variant="small" className="font-medium text-gray-900">
                      {level.name}
                    </Text>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label={`Promedio mínimo ${level.name}`}
                      type="number"
                      step="0.01"
                      className="w-28 py-2"
                      value={rule.minAverage}
                      onChange={(e) =>
                        update(level.code, {
                          minAverage: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        disabled={!level.allowsSupplementary}
                        checked={rule.allowsSupplementary}
                        onChange={(e) =>
                          update(level.code, {
                            allowsSupplementary: e.target.checked,
                          })
                        }
                      />
                      {level.allowsSupplementary ? "Admite" : "No aplica"}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label={`Promedio para supletorio ${level.name}`}
                      type="number"
                      step="0.01"
                      className="w-28 py-2"
                      disabled={!rule.allowsSupplementary}
                      value={rule.supplementaryMinAverage}
                      onChange={(e) =>
                        update(level.code, {
                          supplementaryMinAverage: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      aria-label={`Repetición ${level.name}`}
                      className="py-2"
                      value={rule.repetitionPolicy}
                      onChange={(e) =>
                        update(level.code, {
                          repetitionPolicy: e.target.value as RepetitionPolicy,
                        })
                      }
                    >
                      {Object.entries(REPETITION_POLICY_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminConfigSection>
  );
}
