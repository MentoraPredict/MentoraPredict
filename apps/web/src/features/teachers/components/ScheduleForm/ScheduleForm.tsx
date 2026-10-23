import { useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import { DAY_LABELS, type ScheduleSlot } from "@/types/academic/attendance.types";

interface ScheduleFormProps {
  isSaving: boolean;
  onSubmit: (slots: ScheduleSlot[]) => void;
}

const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export default function ScheduleForm({ isSaving, onSubmit }: ScheduleFormProps) {
  const [slots, setSlots] = useState<ScheduleSlot[]>([
    { dayOfWeek: "MONDAY", startTime: "07:00", endTime: "07:40" },
  ]);

  const update = (index: number, patch: Partial<ScheduleSlot>) =>
    setSlots((current) => current.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <Heading as="h5" className="text-gray-900">
        Horario de clases
      </Heading>
      <Text variant="caption" className="mt-1 text-gray-600">
        Define los días y horas en que dictas este curso. Con eso se generan las
        clases de todo el año lectivo para registrar la asistencia. Solo se puede
        definir una vez; para cambiarlo, contacta a un administrador.
      </Text>

      <div className="mt-4 space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Día"
              className="w-40 py-2"
              value={slot.dayOfWeek}
              onChange={(e) => update(index, { dayOfWeek: e.target.value })}
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>
                  {DAY_LABELS[day]}
                </option>
              ))}
            </Select>
            <Input
              aria-label="Hora de inicio"
              type="time"
              className="w-32 py-2"
              value={slot.startTime}
              onChange={(e) => update(index, { startTime: e.target.value })}
            />
            <Input
              aria-label="Hora de fin"
              type="time"
              className="w-32 py-2"
              value={slot.endTime}
              onChange={(e) => update(index, { endTime: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-sm"
              disabled={slots.length <= 1}
              onClick={() => setSlots((current) => current.filter((_, i) => i !== index))}
            >
              Quitar
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setSlots((current) => [
              ...current,
              { dayOfWeek: "TUESDAY", startTime: "07:00", endTime: "07:40" },
            ])
          }
        >
          Agregar otro día
        </Button>
        <Button
          type="button"
          isLoading={isSaving}
          disabled={slots.some((s) => !s.startTime || !s.endTime || s.startTime >= s.endTime)}
          onClick={() => onSubmit(slots)}
        >
          Guardar horario
        </Button>
      </div>
    </section>
  );
}
