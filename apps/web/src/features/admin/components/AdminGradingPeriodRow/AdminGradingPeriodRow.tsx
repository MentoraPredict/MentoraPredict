import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";

import type {
  GradingPeriod,
  UpdateGradingPeriodPayload,
} from "@/types/academic/school-year.types";

interface AdminGradingPeriodRowProps {
  period: GradingPeriod;
  isEditable: boolean;
  isSubmitting: boolean;
  onSave: (
    periodId: string,
    payload: UpdateGradingPeriodPayload
  ) => Promise<boolean>;
}

export default function AdminGradingPeriodRow({
  period,
  isEditable,
  isSubmitting,
  onSave,
}: AdminGradingPeriodRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(period.startDate);
  const [endDate, setEndDate] = useState(period.endDate);
  const [gradesDueDate, setGradesDueDate] = useState(period.gradesDueDate ?? "");

  const handleSave = async () => {
    const saved = await onSave(period.id, {
      startDate,
      endDate,
      gradesDueDate: gradesDueDate || null,
    });

    if (saved) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setStartDate(period.startDate);
    setEndDate(period.endDate);
    setGradesDueDate(period.gradesDueDate ?? "");
    setIsEditing(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-3">
      <div className="min-w-[10rem] flex-1">
        <Text variant="small" className="font-medium text-gray-900">
          {period.name}
        </Text>
        {period.isCurrent ? (
          <Badge tone="green" className="mt-1">
            Periodo vigente
          </Badge>
        ) : null}
      </div>

      {isEditing ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-600">
            Inicio
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 py-2"
            />
          </label>
          <label className="text-xs text-gray-600">
            Fin
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 py-2"
            />
          </label>
          <label className="text-xs text-gray-600">
            Límite de notas
            <Input
              type="date"
              value={gradesDueDate}
              onChange={(e) => setGradesDueDate(e.target.value)}
              className="mt-1 py-2"
            />
          </label>
          <Button
            type="button"
            className="px-4 py-2 text-sm"
            isLoading={isSubmitting}
            onClick={() => void handleSave()}
          >
            Guardar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 text-sm"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <>
          <Text variant="small" className="text-gray-600">
            {period.startDate} → {period.endDate}
          </Text>
          <Text variant="caption" className="text-gray-500">
            {period.gradesDueDate
              ? `Notas hasta ${period.gradesDueDate}`
              : "Sin fecha límite de notas"}
          </Text>
          {isEditable ? (
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-sm"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
