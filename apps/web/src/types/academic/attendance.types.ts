export type AttendanceStatus = "OK" | "WARNING" | "EXCEEDED";
export type JustificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AttendanceSummary {
  held: number;
  absences: number;
  justified: number;
  unjustified: number;
  unjustifiedPct: number;
}

export interface AttendanceStatusView {
  summary: AttendanceSummary;
  status: AttendanceStatus;
  reachedWarningPct: number | null;
  applies: boolean;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  scheduleId: string;
  sessionDate: string;
  status: string;
}

export interface CourseAttendance {
  subject: { id: string; name: string };
  planned: number;
  held: number;
  recordedSessionIds: string[];
  rule: { maxPct: number; warningPcts: number[]; applies: boolean };
  students: Array<{ studentId: string; name: string } & AttendanceStatusView>;
}

export interface SessionRecord {
  studentId: string;
  present: boolean;
}

export interface ScheduleSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface StudentAbsence {
  sessionId: string;
  subjectId: string;
  courseName: string;
  date: string;
  justification: {
    id: string;
    status: JustificationStatus;
    reason: string;
    note: string | null;
  } | null;
  canJustify: boolean;
}

export interface StudentAttendance {
  studentId: string;
  studentName: string;
  rule: {
    maxPct: number;
    warningPcts: number[];
    justificationDays: number | null;
    applies: boolean;
  };
  courses: Array<{ subjectId: string; name: string } & AttendanceStatusView>;
  absences: StudentAbsence[];
}

export interface SectionAttendanceRow {
  studentId: string;
  name: string;
  worstStatus: AttendanceStatus;
  courses: Array<{
    subjectId: string;
    name: string;
    unjustifiedPct: number;
    absences: number;
    status: AttendanceStatus;
  }>;
}

export interface JustificationItem {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  sessionDate: string;
  reason: string;
  status: JustificationStatus;
  resolutionNote: string | null;
  createdAt: string;
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  OK: "Al día",
  WARNING: "Aviso",
  EXCEEDED: "Límite superado",
};

export const JUSTIFICATION_LABELS: Record<JustificationStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};
