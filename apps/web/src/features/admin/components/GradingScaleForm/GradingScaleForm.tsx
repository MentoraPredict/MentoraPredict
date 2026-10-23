import { useState } from "react";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import type {
  GradingScale,
  GradingScaleBand,
} from "@/types/academic/institution-config.types";

interface GradingScaleFormProps {
  scale: GradingScale;
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (payload: Omit<GradingScale, "id">) => void;
}

const toNumber = (value: string) => (value === "" ? 0 : Number(value));

export default function GradingScaleForm({
  scale,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: GradingScaleFormProps) {
  const [name, setName] = useState(scale.name);
  const [minValue, setMinValue] = useState(String(scale.minValue));
  const [maxValue, setMaxValue] = useState(String(scale.maxValue));
  const [passingGrade, setPassingGrade] = useState(String(scale.passingGrade));
  const [decimals, setDecimals] = useState(String(scale.decimals));
  const [bands, setBands] = useState<GradingScaleBand[]>(scale.bands);

  const updateBand = (index: number, patch: Partial<GradingScaleBand>) => {
    setBands((current) =>
      current.map((band, i) => (i === index ? { ...band, ...patch } : band))
    );
  };

  const addBand = () => {
    setBands((current) => [
      ...current,
      { code: "", label: "", minValue: 0, maxValue: 0 },
    ]);
  };

  const removeBand = (index: number) => {
    setBands((current) => current.filter((_, i) => i !== index));
  };

  return (
    <AdminConfigSection
      title="Escala de calificaciones"
      description="Define el rango numérico, la nota mínima de aprobación y las equivalencias cualitativas. Los rangos deben cubrir toda la escala sin huecos ni traslapes."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={() =>
        onSave({
          name,
          minValue: toNumber(minValue),
          maxValue: toNumber(maxValue),
          passingGrade: toNumber(passingGrade),
          decimals: toNumber(decimals),
          bands,
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <Label htmlFor="scale-name">Nombre</Label>
          <Input
            id="scale-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="scale-min">Mínimo</Label>
          <Input
            id="scale-min"
            type="number"
            step="0.01"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="scale-max">Máximo</Label>
          <Input
            id="scale-max"
            type="number"
            step="0.01"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="scale-passing">Nota de aprobación</Label>
          <Input
            id="scale-passing"
            type="number"
            step="0.01"
            value={passingGrade}
            onChange={(e) => setPassingGrade(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="scale-decimals">Decimales</Label>
          <Input
            id="scale-decimals"
            type="number"
            min={0}
            max={2}
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Text variant="small" className="mb-2 font-medium text-gray-700">
          Equivalencias cualitativas
        </Text>

        <div className="space-y-2">
          {bands.map((band, index) => (
            <div
              key={index}
              className="grid items-end gap-2 sm:grid-cols-[6rem_1fr_6rem_6rem_auto]"
            >
              <Input
                aria-label="Código"
                placeholder="Código"
                value={band.code}
                onChange={(e) => updateBand(index, { code: e.target.value })}
              />
              <Input
                aria-label="Descripción"
                placeholder="Descripción"
                value={band.label}
                onChange={(e) => updateBand(index, { label: e.target.value })}
              />
              <Input
                aria-label="Desde"
                type="number"
                step="0.01"
                value={band.minValue}
                onChange={(e) =>
                  updateBand(index, { minValue: toNumber(e.target.value) })
                }
              />
              <Input
                aria-label="Hasta"
                type="number"
                step="0.01"
                value={band.maxValue}
                onChange={(e) =>
                  updateBand(index, { maxValue: toNumber(e.target.value) })
                }
              />
              <Button
                type="button"
                variant="outline"
                className="px-3 py-2 text-sm"
                onClick={() => removeBand(index)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-3 px-4 py-2 text-sm"
          onClick={addBand}
        >
          Agregar rango
        </Button>
      </div>
    </AdminConfigSection>
  );
}
