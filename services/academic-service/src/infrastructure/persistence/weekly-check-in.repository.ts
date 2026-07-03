import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class WeeklyCheckInRepository implements IWeeklyCheckInRepository {
  constructor(
    @InjectRepository(WeeklyCheckInOrmEntity)
    private readonly repo: Repository<WeeklyCheckInOrmEntity>,
  ) {}

  async findById(id: string): Promise<WeeklyCheckInEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
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
    return o ? this.toDomain(o) : null;
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
    return o ? this.toDomain(o) : null;
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
    return { items: orms.map(this.toDomain), total };
  }

  async getWeeklySummaryBySubject(subjectId: string): Promise<CheckInWeekSummaryRow[]> {
    const rows = (await this.repo.manager.query(
      `SELECT
         academic_week AS "academicWeek",
         academic_year AS "academicYear",
         ROUND(AVG(CASE WHEN attendance THEN 100 ELSE 0 END)::numeric, 2)::float AS "avgAttendance",
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
    const rows = (await this.repo.manager.query(
      `INSERT INTO weekly_check_ins (
         id, student_id, subject_id, period_id, academic_week, academic_year,
         check_in_date, attendance, task_completion, study_hours, emotional_state,
         general_comprehension, topic_responses, notes, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16)
       ON CONFLICT (student_id, subject_id, academic_week, academic_year)
       DO UPDATE SET
         period_id = EXCLUDED.period_id,
         check_in_date = EXCLUDED.check_in_date,
         attendance = EXCLUDED.attendance,
         task_completion = EXCLUDED.task_completion,
         study_hours = EXCLUDED.study_hours,
         emotional_state = EXCLUDED.emotional_state,
         general_comprehension = EXCLUDED.general_comprehension,
         topic_responses = EXCLUDED.topic_responses,
         notes = EXCLUDED.notes,
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
        JSON.stringify(entity.topicResponses),
        entity.notes,
        entity.createdAt,
        entity.updatedAt,
      ],
    )) as Record<string, unknown>[];

    const row = rows[0];
    // ON CONFLICT DO UPDATE never touches `id`, so the returned id stays the
    // original row's id on an update — comparing against the id we generated
    // for this call tells us whether this was an insert or an update.
    const wasCreated = row.id === entity.id;
    return { checkIn: this.rowToDomain(row), wasCreated };
  }

  async update(entity: WeeklyCheckInEntity): Promise<WeeklyCheckInEntity> {
    await this.repo.save(this.toOrm(entity));
    return entity;
  }

  private rowToDomain(row: Record<string, unknown>): WeeklyCheckInEntity {
    return new WeeklyCheckInEntity(
      row.id as string,
      row.student_id as string,
      row.subject_id as string,
      row.period_id as string,
      Number(row.academic_week),
      Number(row.academic_year),
      new Date(row.check_in_date as string),
      row.attendance as boolean,
      Number(row.task_completion),
      Number(row.study_hours),
      row.emotional_state as EmotionalState,
      Number(row.general_comprehension),
      row.topic_responses as TopicResponse[],
      (row.notes as string | null) ?? null,
      new Date(row.created_at as string),
      new Date(row.updated_at as string),
    );
  }

  private toDomain = (o: WeeklyCheckInOrmEntity): WeeklyCheckInEntity =>
    new WeeklyCheckInEntity(
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
      o.topicResponses as TopicResponse[],
      o.notes,
      o.createdAt,
      o.updatedAt,
    );

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
    o.topicResponses = d.topicResponses as unknown as Record<string, unknown>[];
    o.notes = d.notes;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
