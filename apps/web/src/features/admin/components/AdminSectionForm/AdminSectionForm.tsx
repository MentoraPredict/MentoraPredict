import { useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import {
  SHIFT_LABELS,
  type Shift,
} from "@/types/academic/institution-config.types";
import type { GradeLevel, Section } from "@/types/academic/academic-structure.types";
import type { AppUser } from "@/types/user/user.types";

export interface SectionFormValues {
  name: string;
  shift: Shift;
  capacity: number;
  tutorId: string | null;
}

interface AdminSectionFormProps {
  grade: GradeLevel;
  teachers: AppUser[];
  section?: Section;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (values: SectionFormValues) => void;
}

function teacherName(teacher: AppUser) {
  return (
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() ||
    teacher.email
  );
}

export default function AdminSectionForm({
  grade,
  teachers,
  section,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: AdminSectionFormProps) {
  const [name, setName] = useState(section?.name ?? "");
  const [shift, setShift] = useState<Shift>(
    section?.shift ?? grade.shifts[0] ?? "MATUTINA"
  );
  const [capacity, setCapacity] = useState(String(section?.capacity ?? 30));
  const [tutorId, setTutorId] = useState(section?.tutorId ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setLocalError("El nombre del paralelo es obligatorio.");
      return;
    }

    if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      setLocalError("El cupo debe ser un número entero mayor a 0.");
      return;
    }

    setLocalError(null);
    onSubmit({
      name: name.trim(),
      shift,
      capacity: Number(capacity),
      tutorId: tutorId || null,
    });
  };

  const message = localError ?? errorMessage;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
    >
      <div>
        <Heading as="h4" className="text-gray-900">
          {section ? "Editar paralelo" : "Nuevo paralelo"}
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          {grade.name} · {grade.levelName}
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="section-name">Paralelo</Label>
          <Input
            id="section-name"
            placeholder="A"
            maxLength={10}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="section-capacity">Cupo</Label>
          <Input
            id="section-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="section-shift">Jornada</Label>
          <Select
            id="section-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift)}
          >
            {grade.shifts.map((value) => (
              <option key={value} value={value}>
                {SHIFT_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="section-tutor">Docente tutor</Label>
          <Select
            id="section-tutor"
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
          >
            <option value="">Sin asignar</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacherName(teacher)}
              </option>
            ))}
          </Select>
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
          Guardar
        </Button>
      </div>
    </form>
  );
}
