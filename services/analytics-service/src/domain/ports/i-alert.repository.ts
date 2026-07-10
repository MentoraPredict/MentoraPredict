import { AlertEntity } from '../entities/alert.entity';

export interface IAlertRepository {
  save(alert: AlertEntity): Promise<AlertEntity>;
  update(alert: AlertEntity): Promise<AlertEntity>;
  findById(id: string): Promise<AlertEntity | null>;
  // Legacy — used by GenerateAlertsUseCase (RF-021, UNREAD/READ) and the dashboards. Unchanged.
  findByStudentId(studentId: string, unreadOnly?: boolean): Promise<AlertEntity[]>;
  // At most one ACTIVE alert per (student, subject) — Fase 7 upsert target.
  findActiveByStudentAndSubject(studentId: string, subjectId: string): Promise<AlertEntity | null>;
  findByStudentPaginated(
    studentId: string,
    filters: { status?: string; subjectId?: string; periodId?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: AlertEntity[]; total: number }>;
  findBySubjectPaginated(
    subjectId: string,
    filters: { status?: string; severity?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: AlertEntity[]; total: number }>;
}
