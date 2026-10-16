import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";

import AdminCurriculumEditor from "@/features/admin/components/AdminCurriculumEditor";
import useAdminSubjects from "@/features/admin/hooks/useAdminSubjects";

export default function AdminSubjectsManagement() {
  const {
    catalog,
    gradeLevels,
    selectedGrade,
    setSelectedGrade,
    curriculum,
    isLoading,
    isSubmitting,
    error,
    actionError,
    savedCurriculum,
    createSubject,
    toggleSubject,
    saveCurriculum,
  } = useAdminSubjects();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [area, setArea] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !code.trim()) {
      setFormError("El nombre y el código son obligatorios.");
      return;
    }

    setFormError(null);

    const created = await createSubject({
      name: name.trim(),
      code: code.trim(),
      area: area.trim() || undefined,
    });

    if (created) {
      setName("");
      setCode("");
      setArea("");
    }
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Asignaturas
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Catálogo de asignaturas de la institución y su malla por grado.
        </Text>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <Heading as="h5" className="text-gray-900">
              Catálogo
            </Heading>

            <form
              onSubmit={(event) => void handleCreate(event)}
              className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_9rem_12rem_auto]"
            >
              <div>
                <Label htmlFor="subject-name">Nombre</Label>
                <Input
                  id="subject-name"
                  placeholder="Matemática"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject-code">Código</Label>
                <Input
                  id="subject-code"
                  placeholder="MAT"
                  maxLength={20}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject-area">Área (opcional)</Label>
                <Input
                  id="subject-area"
                  placeholder="Matemática"
                  maxLength={50}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <Button type="submit" isLoading={isSubmitting}>
                Agregar
              </Button>
            </form>

            {formError || actionError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <Text variant="small" className="font-medium text-red-700">
                  {formError ?? actionError}
                </Text>
              </div>
            ) : null}

            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Asignatura</th>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Área</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {catalog.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-3 text-gray-900">{subject.name}</td>
                      <td className="px-4 py-3 text-gray-600">{subject.code}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {subject.area ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={subject.isActive ? "green" : "neutral"}>
                          {subject.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-3 py-1.5 text-sm"
                          disabled={isSubmitting}
                          onClick={() => void toggleSubject(subject)}
                        >
                          {subject.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {catalog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-600">
                        Aún no hay asignaturas en el catálogo.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <AdminCurriculumEditor
            catalog={catalog}
            gradeLevels={gradeLevels}
            selectedGrade={selectedGrade}
            curriculum={curriculum}
            isSubmitting={isSubmitting}
            isSaved={savedCurriculum}
            errorMessage={selectedGrade ? actionError : null}
            onSelectGrade={setSelectedGrade}
            onSave={(items) => void saveCurriculum(items)}
          />
        </div>
      )}
    </Container>
  );
}
