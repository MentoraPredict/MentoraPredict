import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import ScheduleForm from "@/features/teachers/components/ScheduleForm";
import useCourseAttendance from "@/features/teachers/hooks/useCourseAttendance";
import {
  ATTENDANCE_STATUS_LABELS,
  DAY_LABELS,
  type AttendanceStatus,
} from "@/types/academic/attendance.types";

interface TeacherCourseAttendanceProps {
  courseId: string;
}

const STATUS_TONE: Record<AttendanceStatus, "green" | "amber" | "red"> = {
  OK: "green",
  WARNING: "amber",
  EXCEEDED: "red",
};

const weekday = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  const name = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ];

  return DAY_LABELS[name];
};

export default function TeacherCourseAttendance({
  courseId,
}: TeacherCourseAttendanceProps) {
  const {
    attendance,
    sessions,
    availableSessions,
    selectedSessionId,
    setSelectedSessionId,
    marks,
    setPresent,
    isLoading,
    isSaving,
    error,
    notice,
    save,
    saveSchedule,
  } = useCourseAttendance(courseId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando asistencia...</Text>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
        <Text variant="small" className="font-medium text-red-700">
          {error ?? "No se pudo cargar la asistencia."}
        </Text>
      </div>
    );
  }

  const recorded = new Set(attendance.recordedSessionIds);

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h4" className="text-gray-900">
          Asistencia
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Registra la asistencia de cada clase. Las faltas injustificadas no deben
          superar el {attendance.rule.maxPct} % de las clases.
          {attendance.rule.warningPcts.length > 0
            ? ` Se avisa al representante al llegar a ${attendance.rule.warningPcts.join(" %, ")} %.`
            : ""}
        </Text>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            {notice}
          </Text>
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <ScheduleForm isSaving={isSaving} onSubmit={(slots) => void saveSchedule(slots)} />
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-[16rem]">
                <Label htmlFor="attendance-session">Clase</Label>
                <Select
                  id="attendance-session"
                  value={selectedSessionId}
                  disabled={isSaving}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  {availableSessions.length === 0 ? (
                    <option value="">Aún no hay clases dictadas</option>
                  ) : null}
                  {availableSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {weekday(session.sessionDate.slice(0, 10))} {session.sessionDate.slice(0, 10)}
                      {recorded.has(session.id) ? " · registrada" : " · pendiente"}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                type="button"
                isLoading={isSaving}
                disabled={!selectedSessionId}
                onClick={() => void save()}
              >
                Guardar asistencia
              </Button>
            </div>

            <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200">
              {attendance.students.map((student) => {
                const present = marks[student.studentId] ?? true;

                return (
                  <div
                    key={student.studentId}
                    className="flex flex-wrap items-center gap-3 px-4 py-2.5"
                  >
                    <Text variant="small" className="min-w-[12rem] flex-1 font-medium text-gray-900">
                      {student.name}
                    </Text>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={present ? "primary" : "outline"}
                        className="px-3 py-1.5 text-sm"
                        onClick={() => setPresent(student.studentId, true)}
                      >
                        Presente
                      </Button>
                      <Button
                        type="button"
                        variant={present ? "outline" : "primary"}
                        className="px-3 py-1.5 text-sm"
                        onClick={() => setPresent(student.studentId, false)}
                      >
                        Falta
                      </Button>
                    </div>
                  </div>
                );
              })}
              {attendance.students.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Text variant="small" className="text-gray-600">
                    Este curso aún no tiene estudiantes matriculados.
                  </Text>
                </div>
              ) : null}
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Estudiante</th>
                  <th className="px-4 py-3 text-center font-medium">Clases</th>
                  <th className="px-4 py-3 text-center font-medium">Faltas</th>
                  <th className="px-4 py-3 text-center font-medium">Injustificadas</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.students.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-2.5 text-center text-gray-700">{student.summary.held}</td>
                    <td className="px-4 py-2.5 text-center text-gray-700">{student.summary.absences}</td>
                    <td className="px-4 py-2.5 text-center text-gray-700">
                      {student.summary.unjustified} ({student.summary.unjustifiedPct} %)
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_TONE[student.status]}>
                        {ATTENDANCE_STATUS_LABELS[student.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Text variant="caption" className="px-4 py-3 text-gray-500">
              {attendance.held} de {attendance.planned} clases programadas con asistencia
              registrada.
            </Text>
          </section>
        </>
      )}
    </div>
  );
}
