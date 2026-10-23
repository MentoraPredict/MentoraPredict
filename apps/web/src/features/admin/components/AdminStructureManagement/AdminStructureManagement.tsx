import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

import AdminSectionForm, {
  type SectionFormValues,
} from "@/features/admin/components/AdminSectionForm";
import SectionCoursesTeachers from "@/features/admin/components/SectionCoursesTeachers";
import useAdminStructure from "@/features/admin/hooks/useAdminStructure";
import { SHIFT_LABELS } from "@/types/academic/institution-config.types";
import type {
  GradeLevel,
  Section,
} from "@/types/academic/academic-structure.types";
import type { AppUser } from "@/types/user/user.types";

interface FormTarget {
  grade: GradeLevel;
  section?: Section;
}

function teacherName(teachers: AppUser[], id: string | null) {
  if (!id) return "Sin tutor";

  const teacher = teachers.find((item) => item.id === id);

  return teacher
    ? [teacher.firstName, teacher.lastName].filter(Boolean).join(" ") ||
        teacher.email
    : "Tutor asignado";
}

export default function AdminStructureManagement() {
  const {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    gradeLevels,
    sectionsByGrade,
    teachers,
    isLoading,
    isSubmitting,
    error,
    actionError,
    notice,
    clearActionError,
    create,
    update,
    remove,
    generateCourses,
  } = useAdminStructure();
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [teachersTarget, setTeachersTarget] = useState<{
    sectionId: string;
    label: string;
  } | null>(null);

  const offeredGrades = gradeLevels.filter((grade) => grade.isLevelActive);
  const levels = Array.from(
    new Map(offeredGrades.map((g) => [g.levelCode, g.levelName]))
  );

  const closeForm = () => {
    clearActionError();
    setFormTarget(null);
  };

  const handleSubmit = async (values: SectionFormValues) => {
    if (!formTarget) return;

    const saved = formTarget.section
      ? await update(formTarget.section.id, values)
      : await create({ gradeLevelCode: formTarget.grade.code, ...values });

    if (saved) setFormTarget(null);
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h3" className="text-gray-900">
            Grados y paralelos
          </Heading>
          <Text variant="small" className="mt-1 text-gray-600">
            Organiza los paralelos de cada grado por año lectivo. Los grados
            que aparecen dependen de los niveles activos en Configuración.
          </Text>
        </div>

        <div className="w-64">
          <Label htmlFor="structure-year">Año lectivo</Label>
          <Select
            id="structure-year"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
          >
            {schoolYears.length === 0 ? (
              <option value="">Sin años lectivos</option>
            ) : null}
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {actionError && !formTarget ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {actionError}
          </Text>
        </div>
      ) : null}

      {notice ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            {notice}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {!isLoading && !selectedYearId ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            Primero crea un año lectivo para poder organizar los paralelos.
          </Text>
        </div>
      ) : null}

      {!isLoading && selectedYearId && offeredGrades.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            No hay niveles activos. Actívalos en Configuración &gt; Niveles y
            jornadas.
          </Text>
        </div>
      ) : null}

      {selectedYearId
        ? levels.map(([levelCode, levelName]) => (
            <section key={levelCode} className="mb-8">
              <Heading as="h5" className="mb-3 text-gray-900">
                {levelName}
              </Heading>

              <div className="space-y-3">
                {offeredGrades
                  .filter((grade) => grade.levelCode === levelCode)
                  .map((grade) => {
                    const sections = sectionsByGrade.get(grade.code) ?? [];

                    return (
                      <article
                        key={grade.code}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                      >
                        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Text
                              variant="small"
                              className="font-semibold text-gray-900"
                            >
                              {grade.name}
                            </Text>
                            <Badge tone="neutral">
                              {sections.length} paralelo(s)
                            </Badge>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="px-4 py-2 text-sm"
                            onClick={() => setFormTarget({ grade })}
                          >
                            Nuevo paralelo
                          </Button>
                        </header>

                        {sections.map((section) => (
                          <div
                            key={section.id}
                            className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-3"
                          >
                            <div className="min-w-[8rem]">
                              <Text
                                variant="small"
                                className="font-medium text-gray-900"
                              >
                                Paralelo {section.name}
                              </Text>
                              <Text variant="caption" className="text-gray-500">
                                {SHIFT_LABELS[section.shift]} · cupo{" "}
                                {section.capacity}
                              </Text>
                            </div>

                            <Text
                              variant="caption"
                              className="min-w-[10rem] flex-1 text-gray-600"
                            >
                              Tutor: {teacherName(teachers, section.tutorId)}
                            </Text>

                            <Badge tone={section.courseCount > 0 ? "green" : "amber"}>
                              {section.courseCount} curso(s)
                            </Badge>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="px-3 py-1.5 text-sm"
                                disabled={isSubmitting}
                                onClick={() => void generateCourses(section.id)}
                              >
                                Generar cursos
                              </Button>
                              {section.courseCount > 0 ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-3 py-1.5 text-sm"
                                  onClick={() =>
                                    setTeachersTarget({
                                      sectionId: section.id,
                                      label: `${grade.name} «${section.name}»`,
                                    })
                                  }
                                >
                                  Docentes
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="outline"
                                className="px-3 py-1.5 text-sm"
                                onClick={() => setFormTarget({ grade, section })}
                              >
                                Editar
                              </Button>
                              {section.courseCount === 0 ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-3 py-1.5 text-sm"
                                  disabled={isSubmitting}
                                  onClick={() => void remove(section.id)}
                                >
                                  Eliminar
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </article>
                    );
                  })}
              </div>
            </section>
          ))
        : null}

      <Modal
        isOpen={Boolean(teachersTarget)}
        onClose={() => setTeachersTarget(null)}
        ariaLabel="Docentes del paralelo"
      >
        {teachersTarget ? (
          <SectionCoursesTeachers
            sectionId={teachersTarget.sectionId}
            sectionLabel={teachersTarget.label}
            teachers={teachers}
            onClose={() => setTeachersTarget(null)}
          />
        ) : null}
      </Modal>

      <Modal isOpen={Boolean(formTarget)} onClose={closeForm} ariaLabel="Paralelo">
        {formTarget ? (
          <AdminSectionForm
            grade={formTarget.grade}
            section={formTarget.section}
            teachers={teachers}
            isSubmitting={isSubmitting}
            errorMessage={actionError}
            onCancel={closeForm}
            onSubmit={(values) => void handleSubmit(values)}
          />
        ) : null}
      </Modal>
    </Container>
  );
}
