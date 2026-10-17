import { FormEvent, useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import type { GradingComponent } from "@/types/academic/grading.types";

interface NewActivityFormProps {
  components: GradingComponent[];
  periodName: string;
  isSubmitting: boolean;
  onSubmit: (payload: {
    name: string;
    componentCode: string;
    dueDate?: string | null;
  }) => Promise<boolean>;
  onClose: () => void;
}

export default function NewActivityForm({
  components,
  periodName,
  isSubmitting,
  onSubmit,
  onClose,
}: NewActivityFormProps) {
  const [name, setName] = useState("");
  const [componentCode, setComponentCode] = useState(components[0]?.code ?? "");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const created = await onSubmit({
      name: name.trim(),
      componentCode,
      dueDate: dueDate || null,
    });

    if (created) onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
    >
      <div>
        <Heading as="h4" className="text-gray-900">
          Nueva actividad
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          Se registrará en el periodo «{periodName}».
        </Text>
      </div>

      <div>
        <Label htmlFor="activity-name">Nombre</Label>
        <Input
          id="activity-name"
          value={name}
          maxLength={200}
          placeholder="Lección 1, Taller, Prueba del periodo…"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="activity-component">Componente</Label>
        <Select
          id="activity-component"
          value={componentCode}
          onChange={(e) => setComponentCode(e.target.value)}
        >
          {components.map((component) => (
            <option key={component.code} value={component.code}>
              {component.name} ({component.weight}%)
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="activity-due">Fecha (opcional)</Label>
        <Input
          id="activity-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={!name.trim()}>
          Crear actividad
        </Button>
      </div>
    </form>
  );
}
