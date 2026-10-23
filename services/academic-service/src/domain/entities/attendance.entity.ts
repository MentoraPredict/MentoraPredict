export const JUSTIFICATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type JustificationStatus = (typeof JUSTIFICATION_STATUSES)[number];

/** Asistencia registrada por el docente a una clase concreta. */
export interface AttendanceRecord {
  sessionId: string;
  subjectId: string;
  studentId: string;
  present: boolean;
  /** Fecha de la clase, YYYY-MM-DD. */
  sessionDate: string;
  /** Estado de la justificación de la falta, si el representante la pidió. */
  justification: JustificationStatus | null;
}

export interface Justification {
  id: string;
  sessionId: string;
  studentId: string;
  requestedBy: string;
  reason: string;
  status: JustificationStatus;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
  createdAt: Date;
}

export const ATTENDANCE_STATUSES = ['OK', 'WARNING', 'EXCEEDED'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceSummary {
  /** Clases con asistencia registrada. */
  held: number;
  absences: number;
  /** Faltas con justificación aprobada. */
  justified: number;
  /** Faltas que cuentan para el límite (incluye las pendientes de resolver). */
  unjustified: number;
  /** Porcentaje de faltas injustificadas sobre las clases registradas. */
  unjustifiedPct: number;
}
