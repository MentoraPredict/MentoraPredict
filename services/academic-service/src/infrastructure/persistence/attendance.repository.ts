import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AttendanceRecord,
  Justification,
  JustificationStatus,
} from '../../domain/entities/attendance.entity';
import {
  IAttendanceRepository,
  JustificationDetail,
  SessionInfo,
} from '../../application/ports/output/i-attendance.repository';
import { AbsenceJustificationOrmEntity } from './absence-justification.orm-entity';

const DATE = `to_char(cs.session_date, 'YYYY-MM-DD')`;

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async findSession(sessionId: string): Promise<SessionInfo | null> {
    const rows: SessionInfo[] = await this.ds.query(
      `SELECT cs.id, cs.subject_id AS "subjectId", ${DATE} AS "sessionDate"
         FROM class_sessions cs WHERE cs.id = $1`,
      [sessionId],
    );
    return rows[0] ?? null;
  }

  async listRecords(filter: {
    subjectId?: string;
    studentId?: string;
    subjectIds?: string[];
  }): Promise<AttendanceRecord[]> {
    const conditions = [`sa.recorded_by = 'TEACHER'`, `cs.status <> 'CANCELLED'`];
    const params: unknown[] = [];
    if (filter.subjectId) {
      params.push(filter.subjectId);
      conditions.push(`cs.subject_id = $${params.length}`);
    }
    if (filter.studentId) {
      params.push(filter.studentId);
      conditions.push(`sa.student_id = $${params.length}`);
    }
    if (filter.subjectIds) {
      params.push(filter.subjectIds);
      conditions.push(`cs.subject_id = ANY($${params.length}::uuid[])`);
    }

    return this.ds.query(
      `SELECT sa.session_id AS "sessionId", cs.subject_id AS "subjectId", sa.student_id AS "studentId",
              sa.present AS "present", ${DATE} AS "sessionDate", aj.status AS "justification"
         FROM session_attendances sa
         JOIN class_sessions cs ON cs.id = sa.session_id
         LEFT JOIN absence_justifications aj
                ON aj.session_id = sa.session_id AND aj.student_id = sa.student_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY cs.session_date`,
      params,
    );
  }

  async countPlannedSessions(subjectIds: string[]): Promise<Map<string, number>> {
    if (subjectIds.length === 0) return new Map();
    const rows: { subjectId: string; total: string }[] = await this.ds.query(
      `SELECT subject_id AS "subjectId", COUNT(*) AS total
         FROM class_sessions WHERE subject_id = ANY($1::uuid[]) AND status <> 'CANCELLED'
        GROUP BY subject_id`,
      [subjectIds],
    );
    return new Map(rows.map((r) => [r.subjectId, Number(r.total)]));
  }

  async findJustification(sessionId: string, studentId: string): Promise<Justification | null> {
    const o = await this.ds
      .getRepository(AbsenceJustificationOrmEntity)
      .findOne({ where: { sessionId, studentId } });
    return o ? this.toDomain(o) : null;
  }

  async findJustificationById(id: string): Promise<JustificationDetail | null> {
    const [detail] = await this.detailQuery('aj.id = $1', [id]);
    return detail ?? null;
  }

  listJustifications(filter: {
    status?: JustificationStatus;
    studentId?: string;
  }): Promise<JustificationDetail[]> {
    const conditions: string[] = ['1=1'];
    const params: unknown[] = [];
    if (filter.status) {
      params.push(filter.status);
      conditions.push(`aj.status = $${params.length}`);
    }
    if (filter.studentId) {
      params.push(filter.studentId);
      conditions.push(`aj.student_id = $${params.length}`);
    }
    return this.detailQuery(conditions.join(' AND '), params);
  }

  async saveJustification(j: Justification): Promise<void> {
    const repo = this.ds.getRepository(AbsenceJustificationOrmEntity);
    await repo.save(repo.create(j));
  }

  private async detailQuery(where: string, params: unknown[]): Promise<JustificationDetail[]> {
    const rows: Array<Record<string, unknown>> = await this.ds.query(
      `SELECT aj.id, aj.session_id AS "sessionId", aj.student_id AS "studentId",
              aj.requested_by AS "requestedBy", aj.reason, aj.status,
              aj.resolved_by AS "resolvedBy", aj.resolved_at AS "resolvedAt",
              aj.resolution_note AS "resolutionNote", aj.created_at AS "createdAt",
              cs.subject_id AS "subjectId", ${DATE} AS "sessionDate"
         FROM absence_justifications aj
         JOIN class_sessions cs ON cs.id = aj.session_id
        WHERE ${where}
        ORDER BY aj.created_at DESC`,
      params,
    );
    return rows as unknown as JustificationDetail[];
  }

  private toDomain(o: AbsenceJustificationOrmEntity): Justification {
    return {
      id: o.id,
      sessionId: o.sessionId,
      studentId: o.studentId,
      requestedBy: o.requestedBy,
      reason: o.reason,
      status: o.status as JustificationStatus,
      resolvedBy: o.resolvedBy,
      resolvedAt: o.resolvedAt,
      resolutionNote: o.resolutionNote,
      createdAt: o.createdAt,
    };
  }
}
