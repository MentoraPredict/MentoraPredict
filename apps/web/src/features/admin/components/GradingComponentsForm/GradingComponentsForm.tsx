import { useState } from "react";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import type { GradingComponent } from "@/types/academic/grading.types";

interface GradingComponentsFormProps {
  components: GradingComponent[];
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (components: Pick<GradingComponent, "code" | "name" | "weight">[]) => void;
}

interface Row {
  code: string;
  name: string;
  weight: number;
  isNew: boolean;
}

export default function GradingComponentsForm({
  components,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: GradingComponentsFormProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    components.map((c) => ({ code: c.code, name: c.name, weight: c.weight, isNew: false }))
  );

  const total = Math.round(rows.reduce((sum, row) => sum + row.weight, 0) * 100) / 100;

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <AdminConfigSection
      title="Componentes de la nota"
      description="La nota de cada periodo es el promedio ponderado de sus componentes (por ejemplo formativa y sumativa). Los pesos deben sumar 100. Un componente con actividades registradas no se puede quitar."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={() =>
        onSave(rows.map(({ code, name, weight }) => ({ code, name: name.trim(), weight })))
      }
    >
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Peso (%)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <Input
                    aria-label={`Código del componente ${index + 1}`}
                    className="w-40 py-2 uppercase"
                    maxLength={20}
                    disabled={!row.isNew}
                    value={row.code}
                    onChange={(e) =>
                      update(index, { code: e.target.value.toUpperCase().replace(/\s+/g, "_") })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    aria-label={`Nombre del componente ${index + 1}`}
                    className="py-2"
                    maxLength={60}
                    value={row.name}
                    onChange={(e) => update(index, { name: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    aria-label={`Peso del componente ${index + 1}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-28 py-2"
                    value={row.weight}
                    onChange={(e) => update(index, { weight: Number(e.target.value) })}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-sm"
                    disabled={rows.length <= 1}
                    onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                  >
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((current) => [...current, { code: "", name: "", weight: 0, isNew: true }])
          }
        >
          Agregar componente
        </Button>
        <Text
          variant="small"
          className={total === 100 ? "font-medium text-emerald-700" : "font-medium text-red-700"}
        >
          Suma de pesos: {total}%
        </Text>
      </div>
    </AdminConfigSection>
  );
}
