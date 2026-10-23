import { useEffect, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";

import type { EnrollmentResult } from "@/types/academic/people-enrollment.types";
import type { AppUser } from "@/types/user/user.types";

interface AdminEnrollStudentsFormProps {
  candidates: AppUser[];
  alreadyEnrolledIds: Set<string>;
  results: EnrollmentResult[] | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSearch: (search: string) => void;
  onSubmit: (studentIds: string[]) => void;
  onClose: () => void;
}

function displayName(user: AppUser) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email
  );
}

export default function AdminEnrollStudentsForm({
  candidates,
  alreadyEnrolledIds,
  results,
  isSubmitting,
  errorMessage,
  onSearch,
  onSubmit,
  onClose,
}: AdminEnrollStudentsFormProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => onSearch(search), 300);

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const nameById = new Map(candidates.map((user) => [user.id, displayName(user)]));

  return (
    <div className="max-h-[85vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div>
        <Heading as="h4" className="text-gray-900">
          Matricular estudiantes
        </Heading>
        <Text variant="caption" className="mt-1 text-gray-600">
          Selecciona los estudiantes. Se inscriben automáticamente en todos los
          cursos del paralelo.
        </Text>
      </div>

      {results ? (
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.studentId}
              className={`rounded-xl border px-4 py-3 ${
                result.ok
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <Text variant="small" className="font-medium text-gray-900">
                {nameById.get(result.studentId) ?? result.studentId}:{" "}
                {result.ok ? "matriculado" : "no se pudo matricular"}
              </Text>
              {[...result.errors, ...result.warnings].map((message) => (
                <Text
                  key={message}
                  variant="caption"
                  className={result.ok ? "text-amber-700" : "text-red-700"}
                >
                  {message}
                </Text>
              ))}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Input
            aria-label="Buscar estudiante"
            placeholder="Buscar por nombre o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
            {candidates.map((user) => {
              const enrolled = alreadyEnrolledIds.has(user.id);

              return (
                <label
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <input
                    type="checkbox"
                    disabled={enrolled}
                    checked={selected.has(user.id)}
                    onChange={() => toggle(user.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <Text variant="small" className="font-medium text-gray-900">
                      {displayName(user)}
                    </Text>
                    <Text variant="caption" className="text-gray-500">
                      {user.email}
                    </Text>
                  </span>
                  {enrolled ? <Badge tone="neutral">En este paralelo</Badge> : null}
                </label>
              );
            })}

            {candidates.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Text variant="small" className="text-gray-600">
                  No se encontraron estudiantes.
                </Text>
              </div>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <Text variant="small" className="font-medium text-red-700">
                {errorMessage}
              </Text>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <Text variant="small" className="text-gray-600">
              {selected.size} seleccionado(s)
            </Text>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                isLoading={isSubmitting}
                disabled={selected.size === 0}
                onClick={() => onSubmit([...selected])}
              >
                Matricular
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
