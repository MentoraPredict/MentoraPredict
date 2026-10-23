import { useEffect, useState } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import type {
  CatalogSubject,
  CurriculumItem,
  GradeLevel,
} from "@/types/academic/academic-structure.types";

interface AdminCurriculumEditorProps {
  catalog: CatalogSubject[];
  gradeLevels: GradeLevel[];
  selectedGrade: string;
  curriculum: CurriculumItem[];
  isSubmitting: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSelectGrade: (code: string) => void;
  onSave: (items: { subjectCatalogId: string; weeklyHours: number }[]) => void;
}

export default function AdminCurriculumEditor({
  catalog,
  gradeLevels,
  selectedGrade,
  curriculum,
  isSubmitting,
  isSaved,
  errorMessage,
  onSelectGrade,
  onSave,
}: AdminCurriculumEditorProps) {
  // subjectCatalogId -> horas semanales (en texto, para poder editar)
  const [hours, setHours] = useState<Record<string, string>>({});

  useEffect(() => {
    setHours(
      Object.fromEntries(
        curriculum.map((item) => [item.subjectCatalogId, String(item.weeklyHours)])
      )
    );
  }, [curriculum]);

  const toggle = (subjectId: string, checked: boolean) => {
    setHours((current) => {
      const next = { ...current };

      if (checked) next[subjectId] = next[subjectId] ?? "1";
      else delete next[subjectId];

      return next;
    });
  };

  const totalHours = Object.values(hours).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );

  const handleSave = () => {
    onSave(
      Object.entries(hours).map(([subjectCatalogId, value]) => ({
        subjectCatalogId,
        weeklyHours: Number(value),
      }))
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <Heading as="h5" className="text-gray-900">
        Malla curricular por grado
      </Heading>
      <Text variant="caption" className="mt-1 text-gray-600">
        Define qué asignaturas se dictan en cada grado y su carga horaria
        semanal. Con la malla, cada paralelo genera sus cursos en un clic.
      </Text>

      <div className="mt-4 max-w-xs">
        <Label htmlFor="curriculum-grade">Grado</Label>
        <Select
          id="curriculum-grade"
          value={selectedGrade}
          onChange={(e) => onSelectGrade(e.target.value)}
        >
          <option value="">Selecciona un grado</option>
          {gradeLevels.map((grade) => (
            <option key={grade.code} value={grade.code}>
              {grade.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedGrade ? (
        <>
          <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {catalog
              .filter((subject) => subject.isActive || hours[subject.id])
              .map((subject) => (
                <div
                  key={subject.id}
                  className="flex flex-wrap items-center gap-4 px-4 py-3"
                >
                  <label className="flex min-w-[14rem] flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={subject.id in hours}
                      onChange={(e) => toggle(subject.id, e.target.checked)}
                    />
                    <span>
                      <Text variant="small" className="font-medium text-gray-900">
                        {subject.name}
                      </Text>
                      <Text variant="caption" className="text-gray-500">
                        {subject.code}
                        {subject.area ? ` · ${subject.area}` : ""}
                      </Text>
                    </span>
                  </label>

                  {subject.id in hours ? (
                    <div className="flex items-center gap-2">
                      <Input
                        aria-label={`Horas semanales de ${subject.name}`}
                        type="number"
                        min={1}
                        max={40}
                        className="w-20 py-2"
                        value={hours[subject.id]}
                        onChange={(e) =>
                          setHours((current) => ({
                            ...current,
                            [subject.id]: e.target.value,
                          }))
                        }
                      />
                      <Text variant="caption" className="text-gray-500">
                        h/semana
                      </Text>
                    </div>
                  ) : null}
                </div>
              ))}

            {catalog.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Text variant="small" className="text-gray-600">
                  Crea asignaturas en el catálogo para armar la malla.
                </Text>
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <Text variant="small" className="font-medium text-red-700">
                {errorMessage}
              </Text>
            </div>
          ) : null}

          {isSaved && !errorMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <Text variant="small" className="font-medium text-emerald-700">
                Malla guardada.
              </Text>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <Text variant="small" className="text-gray-600">
              Total: {totalHours} horas semanales
            </Text>
            <Button type="button" isLoading={isSubmitting} onClick={handleSave}>
              Guardar malla
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
}
