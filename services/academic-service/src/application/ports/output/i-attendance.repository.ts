import {
  AttendanceRecord,
  Justification,
  JustificationStatus,
} from '../../../domain/entities/attendance.entity';

export const ATTENDANCE_REPOSITORY_TOKEN = 'IAttendanceRepository';

export interface SessionInfo {
  id: string;
  subjectId: string;
  /** YYYY-MM-DD */
  sessionDate: string;
}

export interface JustificationDetail extends Justification {
  subjectId: string;
  sessionDate: string;
}

export interface IAttendanceRepository {
  findSession(sessionId: string): Promise<SessionInfo | null>;
  /** Clases con asistencia registrada por el docente (una fila por estudiante y clase). */
  listRecords(filter: {
    subjectId?: string;
    studentId?: string;
    subjectIds?: string[];
  }): Promise<AttendanceRecord[]>;
  /** Cuántas clases tiene programadas cada asignatura. */
  countPlannedSessions(subjectIds: string[]): Promise<Map<string, number>>;

  findJustification(sessionId: string, studentId: string): Promise<Justification | null>;
  findJustificationById(id: string): Promise<JustificationDetail | null>;
  listJustifications(filter: {
    status?: JustificationStatus;
    studentId?: string;
  }): Promise<JustificationDetail[]>;
  saveJustification(justification: Justification): Promise<void>;
}
