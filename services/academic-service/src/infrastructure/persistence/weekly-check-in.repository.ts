import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  EmotionalState,
  TopicResponse,
  WeeklyCheckInEntity,
} from '../../domain/entities/weekly-check-in.entity';
import {
  CheckInWeekSummaryRow,
  IWeeklyCheckInRepository,
  UpsertCheckInResult,
} from '../../application/ports/output/i-weekly-check-in.repository';
import { WeeklyCheckInOrmEntity } from './weekly-check-in.orm-entity';
import { WeeklyCheckInTopicResponseOrmEntity } from './weekly-check-in-topic-response.orm-entity';

@Injectable()
export class WeeklyCheckInRepository implements IWeeklyCheckInRepository {
  constructor(
    @InjectRepository(WeeklyCheckInOrmEntity)
    private readonly repo: Repository<WeeklyCheckInOrmEntity>,
    @InjectRepository(WeeklyCheckInTopicResponseOrmEntity)
    private readonly topicResponseRepo: Repository<WeeklyCheckInTopicResponseOrmEntity>,
  ) {}

  async findById(id: string): Promise<WeeklyCheckInEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    if (!o) return null;
    return this.toDomain(o, await this.findTopicResponses(id));
  }

  async findByStudentSubjectWeek(
    studentId: string,
    subjectId: string,
    academicWeek: number,
    academicYear: number,
  ): Promise<WeeklyCheckInEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId, academicWeek, academicYear },
    });
    if (!o) return null;
    return this.toDomain(o, await this.findTopicResponses(o.id));
  }

  async findLatestByStudentSubject(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<WeeklyCheckInEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId, periodId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
    });
    if (!o) return null;
    return this.toDomain(o, await this.findTopicResponses(o.id));
  }

  async findByStudentSubjectPaginated(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: WeeklyCheckInEntity[]; total: number }> {
    const [orms, total] = await this.repo.findAndCount({
      where: { studentId, subjectId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    const byCheckIn = await this.findTopicResponsesBatch(orms.map((o) => o.id));
    return {
      items: orms.map((o) => this.toDomain(o, byCheckIn.get(o.id) ?? [])),
      total,
    };
  }

  async getWeeklySummaryBySubject(subjectId: string): Promise<CheckInWeekSummaryRow[]> {
    const rows = (await this.repo.manager.query(
      `SELECT
         academic_week AS "academicWeek",
         academic_year AS "academicYear",
         ROUND(AVG(attendance)::numeric, 2)::float AS "avgAttendance",
         ROUND(AVG(task_completion)::numeric, 2)::float AS "avgTaskCompletion",
         ROUND(AVG(study_hours)::numeric, 2)::float AS "avgStudyHours",
         ROUND(AVG(general_comprehension)::numeric, 2)::float AS "avgGeneralComprehension",
         COUNT(*)::int AS "responseCount"
       FROM weekly_check_ins
       WHERE subject_id = $1
       GROUP BY academic_year, academic_week
       ORDER BY academic_year DESC, academic_week DESC`,
      [subjectId],
    )) as CheckInWeekSummaryRow[];
    return rows;
  }

  async upsert(entity: WeeklyCheckInEntity): Promise<UpsertCheckInResult> {
    return this.repo.manager.transaction(async (manager) => {
      const rows = (await manager.query(
        `INSERT INTO weekly_check_ins (
           id, student_id, subject_id, period_id, academic_week, academic_year,
           check_in_date, attendance, task_completion, study_hours, emotional_state,
           general_comprehension, notes, explain_better, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (student_id, subject_id, academic_week, academic_year)
         DO UPDATE SET
           period_id = EXCLUDED.period_id,
           check_in_date = EXCLUDED.check_in_date,
           attendance = EXCLUDED.attendance,
           task_completion = EXCLUDED.task_completion,
           study_hours = EXCLUDED.study_hours,
           emotional_state = EXCLUDED.emotional_state,
           general_comprehension = EXCLUDED.general_comprehension,
           notes = EXCLUDED.notes,
           explain_better = EXCLUDED.explain_better,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [
          entity.id,
          entity.studentId,
          entity.subjectId,
          entity.periodId,
          entity.academicWeek,
          entity.academicYear,
          entity.checkInDate,
          entity.attendance,
          entity.taskCompletion,
          entity.studyHours,
          entity.emotionalState,
          entity.generalComprehension,
          entity.notes,
          entity.explainBetter,
          entity.createdAt,
          entity.updatedAt,
        ],
      )) as Record<string, unknown>[];

      const row = rows[0];
      const checkInId = row.id as string;
      // ON CONFLICT DO UPDATE never touches `id`, así que el id devuelto es
      // siempre el de la fila original — comparar contra el id generado acá
      // dice si fue insert o update.
      const wasCreated = checkInId === entity.id;

      await this.replaceTopicResponses(manager, checkInId, entity.topicResponses);

      return { checkIn: this.rowToDomain(row, entity.topicResponses), wasCreated };
    });
  }

  async update(entity: WeeklyCheckInEntity): Promise<WeeklyCheckInEntity> {
    await this.repo.manager.transaction(async (manager) => {
      await manager.save(this.toOrm(entity));
      await this.replaceTopicResponses(manager, entity.id, entity.topicResponses);
    });
    return entity;
  }

  private async replaceTopicResponses(
    manager: EntityManager,
    checkInId: string,
    responses: TopicResponse[],
  ): Promise<void> {
    await manager.delete(WeeklyCheckInTopicResponseOrmEntity, { checkInId });
    if (responses.length === 0) return;
    await manager.insert(
      WeeklyCheckInTopicResponseOrmEntity,
      responses.map((r) => {
        const o = new WeeklyCheckInTopicResponseOrmEntity();
        o.id = randomUUID();
        o.checkInId = checkInId;
        o.topicId = r.topicId;
        o.comprehension = r.comprehension;
        return o;
      }),
    );
  }

  private async findTopicResponses(checkInId: string): Promise<TopicResponse[]> {
    const list = await this.topicResponseRepo.find({ where: { checkInId } });
    return list.map((o) => ({ topicId: o.topicId, comprehension: o.comprehension }));
  }

  private async findTopicResponsesBatch(checkInIds: string[]): Promise<Map<string, TopicResponse[]>> {
    const map = new Map<string, TopicResponse[]>();
    if (checkInIds.length === 0) return map;
    const list = await this.topicResponseRepo.find({ where: { checkInId: In(checkInIds) } });
    for (const o of list) {
      const existing = map.get(o.checkInId) ?? [];
      existing.push({ topicId: o.topicId, comprehension: o.comprehension });
      map.set(o.checkInId, existing);
    }
    return map;
  }

  private rowToDomain(row: Record<string, unknown>, topicResponses: TopicResponse[]): WeeklyCheckInEntity {
    return new WeeklyCheckInEntity(
      row.id as string,
      row.student_id as string,
      row.subject_id as string,
      row.period_id as string,
      Number(row.academic_week),
      Number(row.academic_year),
      new Date(row.check_in_date as string),
      Number(row.attendance),
      Number(row.task_completion),
      Number(row.study_hours),
      row.emotional_state as EmotionalState,
      Number(row.general_comprehension),
      topicResponses,
      (row.notes as string | null) ?? null,
      (row.explain_better as string | null) ?? null,
      new Date(row.created_at as string),
      new Date(row.updated_at as string),
    );
  }

  private toDomain(o: WeeklyCheckInOrmEntity, topicResponses: TopicResponse[]): WeeklyCheckInEntity {
    return new WeeklyCheckInEntity(
      o.id,
      o.studentId,
      o.subjectId,
      o.periodId,
      o.academicWeek,
      o.academicYear,
      o.checkInDate,
      o.attendance,
      o.taskCompletion,
      Number(o.studyHours),
      o.emotionalState as EmotionalState,
      o.generalComprehension,
      topicResponses,
      o.notes,
      o.explainBetter,
      o.createdAt,
      o.updatedAt,
    );
  }

  private toOrm(d: WeeklyCheckInEntity): WeeklyCheckInOrmEntity {
    const o = new WeeklyCheckInOrmEntity();
    o.id = d.id;
    o.studentId = d.studentId;
    o.subjectId = d.subjectId;
    o.periodId = d.periodId;
    o.academicWeek = d.academicWeek;
    o.academicYear = d.academicYear;
    o.checkInDate = d.checkInDate;
    o.attendance = d.attendance;
    o.taskCompletion = d.taskCompletion;
    o.studyHours = d.studyHours;
    o.emotionalState = d.emotionalState;
    o.generalComprehension = d.generalComprehension;
    o.notes = d.notes;
    o.explainBetter = d.explainBetter;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
