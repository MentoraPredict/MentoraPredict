import { Link } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import useMyStudents from "@/features/guardian/hooks/useMyStudents";
import {
  getGuardianStudentAttendancePath,
  getGuardianStudentResultsPath,
} from "@/routes/paths";
import { SHIFT_LABELS, type Shift } from "@/types/academic/institution-config.types";
import {
  CONSENT_LABELS,
  RELATION_LABELS,
  type ConsentPurpose,
} from "@/types/academic/people-enrollment.types";

export default function GuardianStudents() {
  const { students, consents, isLoading, pending, error, toggleConsent } =
    useMyStudents();

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Mis representados
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Consulta dónde está matriculado cada estudiante y administra los
          consentimientos que nos autorizas a aplicar.
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
      ) : null}

      {!isLoading && students.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small" className="text-gray-600">
            Aún no tienes estudiantes vinculados. Pide a secretaría que registre
            tu vínculo.
          </Text>
        </div>
      ) : null}

      <div className="space-y-6">
        {students.map((student) => {
          const granted = new Set(
            (consents[student.studentId] ?? [])
              .filter((consent) => !consent.revokedAt)
              .map((consent) => consent.purpose)
          );

          return (
            <article
              key={student.studentId}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Heading as="h5" className="text-gray-900">
                    {student.studentName}
                  </Heading>
                  <Text variant="caption" className="mt-1 text-gray-600">
                    {RELATION_LABELS[student.relation]}
                    {student.isPrimary ? " · representante principal" : ""}
                  </Text>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {student.activeEnrollment ? (
                    <Badge tone="green">
                      {student.activeEnrollment.gradeName} «
                      {student.activeEnrollment.sectionName}»
                      {student.activeEnrollment.shift
                        ? ` · ${SHIFT_LABELS[student.activeEnrollment.shift as Shift]}`
                        : ""}
                    </Badge>
                  ) : (
                    <Badge tone="amber">Sin matrícula activa</Badge>
                  )}

                  {student.activeEnrollment ? (
                    <>
                      <Link to={getGuardianStudentResultsPath(student.studentId)}>
                        <Button type="button" variant="outline" className="px-4 py-2 text-sm">
                          Ver calificaciones
                        </Button>
                      </Link>
                      <Link to={getGuardianStudentAttendancePath(student.studentId)}>
                        <Button type="button" variant="outline" className="px-4 py-2 text-sm">
                          Ver asistencia
                        </Button>
                      </Link>
                    </>
                  ) : null}
                </div>
              </header>

              <div className="mt-5 space-y-3">
                <Text variant="small" className="font-medium text-gray-900">
                  Consentimientos
                </Text>

                {(Object.keys(CONSENT_LABELS) as ConsentPurpose[]).map((purpose) => {
                  const isGranted = granted.has(purpose);
                  const key = `${student.studentId}:${purpose}`;

                  return (
                    <div
                      key={purpose}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <div className="min-w-[14rem] flex-1">
                        <Text variant="small" className="font-medium text-gray-900">
                          {CONSENT_LABELS[purpose].title}
                        </Text>
                        <Text variant="caption" className="text-gray-500">
                          {CONSENT_LABELS[purpose].description}
                        </Text>
                      </div>

                      <Button
                        type="button"
                        variant={isGranted ? "outline" : "primary"}
                        className="px-4 py-2 text-sm"
                        isLoading={pending === key}
                        onClick={() =>
                          void toggleConsent(student.studentId, purpose, isGranted)
                        }
                      >
                        {isGranted ? "Retirar" : "Autorizar"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </Container>
  );
}
