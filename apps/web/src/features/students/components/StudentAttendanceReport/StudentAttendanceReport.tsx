import { FormEvent, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import Modal from "@/components/molecules/Modal";

import useStudentAttendance from "@/features/students/hooks/useStudentAttendance";
import {
  ATTENDANCE_STATUS_LABELS,
  JUSTIFICATION_LABELS,
  type AttendanceStatus,
  type JustificationStatus,
  type StudentAbsence,
} from "@/types/academic/attendance.types";

interface StudentAttendanceReportProps {
  studentId: string | undefined;
  /** Solo el representante puede pedir justificar una falta. */
  canJustify?: boolean;
  /** El propio estudiante ya sabe quién es; el representante sí lo necesita. */
  showStudentName?: boolean;
}

const STATUS_TONE: Record<AttendanceStatus, "green" | "amber" | "red"> = {
  OK: "green",
  WARNING: "amber",
  EXCEEDED: "red",
};

const JUSTIFICATION_TONE: Record<JustificationStatus, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default function StudentAttendanceReport({
  studentId,
  canJustify = false,
  showStudentName = true,
}: StudentAttendanceReportProps) {
  const { data, isLoading, isSubmitting, error, actionError, clearActionError, justify } =
    useStudentAttendance(studentId);
  const [target, setTarget] = useState<StudentAbsence | null>(null);
  const [reason, setReason] = useState("");

  const close = () => {
    clearActionError();
    setReason("");
    setTarget(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (target && (await justify(target.sessionId, reason.trim()))) close();
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando asistencia...</Text>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Text variant="small" className="font-medium text-amber-800">
          {error ?? "Todavía no hay asistencia para mostrar."}
        </Text>
      </div>
    );
  }

  const deadline =
    data.rule.justificationDays === null
      ? "sin plazo"
      : `hasta ${data.rule.justificationDays} día(s) después de la clase`;

  return (
    <div className="space-y-5">
      <div>
        {showStudentName ? (
          <Heading as="h4" className="text-gray-900">
            Asistencia de {data.studentName}
          </Heading>
        ) : null}
        <Text
          variant="small"
          className={showStudentName ? "mt-1 text-gray-600" : "text-gray-600"}
        >
          Las faltas injustificadas no deben superar el {data.rule.maxPct} % de las
          clases de cada asignatura. Las faltas se pueden justificar {deadline}.
        </Text>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Asignatura</th>
              <th className="px-4 py-3 text-center font-medium">Clases</th>
              <th className="px-4 py-3 text-center font-medium">Faltas</th>
              <th className="px-4 py-3 text-center font-medium">Injustificadas</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.courses.map((course) => (
              <tr key={course.subjectId}>
                <td className="px-4 py-2.5 font-medium text-gray-900">{course.name}</td>
                <td className="px-4 py-2.5 text-center text-gray-700">{course.summary.held}</td>
                <td className="px-4 py-2.5 text-center text-gray-700">{course.summary.absences}</td>
                <td className="px-4 py-2.5 text-center text-gray-700">
                  {course.summary.unjustified} ({course.summary.unjustifiedPct} %)
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={STATUS_TONE[course.status]}>
                    {ATTENDANCE_STATUS_LABELS[course.status]}
                  </Badge>
                </td>
              </tr>
            ))}
            {data.courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  El paralelo aún no tiene asignaturas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <Heading as="h5" className="text-gray-900">
          Faltas registradas
        </Heading>
        {data.absences.length === 0 ? (
          <Text variant="small" className="mt-2 text-gray-600">
            No hay faltas registradas.
          </Text>
        ) : (
          <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {data.absences.map((absence) => (
              <div key={absence.sessionId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-[12rem] flex-1">
                  <Text variant="small" className="font-medium text-gray-900">
                    {absence.courseName}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {absence.date}
                    {absence.justification?.note ? ` · ${absence.justification.note}` : ""}
                  </Text>
                </div>

                {absence.justification ? (
                  <Badge tone={JUSTIFICATION_TONE[absence.justification.status]}>
                    {JUSTIFICATION_LABELS[absence.justification.status]}
                  </Badge>
                ) : canJustify && absence.canJustify ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-sm"
                    onClick={() => setTarget(absence)}
                  >
                    Justificar
                  </Button>
                ) : (
                  <Badge tone="neutral">Injustificada</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={Boolean(target)} onClose={close} ariaLabel="Justificar falta">
        <form
          onSubmit={submit}
          className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
        >
          <div>
            <Heading as="h4" className="text-gray-900">
              Justificar falta
            </Heading>
            <Text variant="caption" className="mt-1 text-gray-600">
              {target?.courseName} · {target?.date}. Inspección revisará tu solicitud.
            </Text>
          </div>

          <div>
            <Label htmlFor="justification-reason">Motivo</Label>
            <Textarea
              id="justification-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {actionError ? (
            <Text variant="small" className="font-medium text-red-700">
              {actionError}
            </Text>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={reason.trim().length < 5}>
              Enviar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
