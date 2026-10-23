import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

import AdminEnrollStudentsForm from "@/features/admin/components/AdminEnrollStudentsForm";
import useAdminEnrollments from "@/features/admin/hooks/useAdminEnrollments";
import { SHIFT_LABELS } from "@/types/academic/institution-config.types";
import {
  ENROLLMENT_STATUS_LABELS,
  type StudentEnrollmentStatus,
} from "@/types/academic/people-enrollment.types";

const STATUS_TONE: Record<StudentEnrollmentStatus, "green" | "neutral" | "amber"> = {
  ACTIVE: "green",
  WITHDRAWN: "neutral",
  TRANSFERRED: "amber",
  PROMOTED: "green",
  REPEATED: "amber",
};

export default function AdminEnrollmentsManagement() {
  const {
    schoolYears,
    selectedYearId,
    setSelectedYearId,
    sections,
    gradeName,
    selectedSectionId,
    setSelectedSectionId,
    selectedSection,
    enrollments,
    candidates,
    results,
    clearResults,
    searchStudents,
    isLoading,
    isSubmitting,
    error,
    actionError,
    clearActionError,
    enroll,
    end,
  } = useAdminEnrollments();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const enrolledIds = new Set(active.map((e) => e.studentId));

  const closeForm = () => {
    clearActionError();
    clearResults();
    setIsFormOpen(false);
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Matrículas
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Matricula estudiantes en un paralelo. Quedan inscritos en todos sus
          cursos y se registra el retiro o traslado cuando corresponda.
        </Text>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="enroll-year">Año lectivo</Label>
          <Select
            id="enroll-year"
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

        <div>
          <Label htmlFor="enroll-section">Paralelo</Label>
          <Select
            id="enroll-section"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
          >
            <option value="">Selecciona un paralelo</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {gradeName.get(section.gradeLevelCode) ?? section.gradeLevelCode}{" "}
                «{section.name}» · {SHIFT_LABELS[section.shift]}
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

      {actionError && !isFormOpen ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {actionError}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {!isLoading && !selectedSection ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            {sections.length === 0
              ? "Este año lectivo aún no tiene paralelos. Créalos en Grados y paralelos."
              : "Selecciona un paralelo para ver su matrícula."}
          </Text>
        </div>
      ) : null}

      {selectedSection ? (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
              <Heading as="h5" className="text-gray-900">
                {gradeName.get(selectedSection.gradeLevelCode)} «
                {selectedSection.name}»
              </Heading>
              <Badge
                tone={active.length >= selectedSection.capacity ? "red" : "blue"}
              >
                {active.length} / {selectedSection.capacity} cupos
              </Badge>
            </div>

            <Button
              type="button"
              disabled={active.length >= selectedSection.capacity}
              onClick={() => {
                clearResults();
                void searchStudents("");
                setIsFormOpen(true);
              }}
            >
              Matricular estudiantes
            </Button>
          </header>

          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Estudiante</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Matriculado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-5 py-3">
                      <Text variant="small" className="font-medium text-gray-900">
                        {enrollment.studentName}
                      </Text>
                      <Text variant="caption" className="text-gray-500">
                        {enrollment.studentEmail}
                      </Text>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[enrollment.status]}>
                        {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {enrollment.enrolledAt.slice(0, 10)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {enrollment.status === "ACTIVE" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-sm"
                            disabled={isSubmitting}
                            onClick={() => void end(enrollment.id, "TRANSFERRED")}
                          >
                            Trasladar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-sm"
                            disabled={isSubmitting}
                            onClick={() => void end(enrollment.id, "WITHDRAWN")}
                          >
                            Retirar
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-600">
                      Aún no hay estudiantes matriculados en este paralelo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Modal isOpen={isFormOpen} onClose={closeForm} ariaLabel="Matricular estudiantes">
        <AdminEnrollStudentsForm
          candidates={candidates}
          alreadyEnrolledIds={enrolledIds}
          results={results}
          isSubmitting={isSubmitting}
          errorMessage={actionError}
          onSearch={(search) => void searchStudents(search)}
          onSubmit={(ids) => void enroll(ids)}
          onClose={closeForm}
        />
      </Modal>
    </Container>
  );
}
