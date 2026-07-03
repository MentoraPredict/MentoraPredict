import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PredictedRiskLevel,
  PredictionStatus,
  StudentSubjectPredictionEntity,
} from '../../domain/entities/student-subject-prediction.entity';
import { IStudentSubjectPredictionRepository } from '../../domain/ports/i-student-subject-prediction.repository';
import { StudentSubjectPredictionOrmEntity } from './student-subject-prediction.orm-entity';

@Injectable()
export class StudentSubjectPredictionRepository implements IStudentSubjectPredictionRepository {
  constructor(
    @InjectRepository(StudentSubjectPredictionOrmEntity)
    private readonly repo: Repository<StudentSubjectPredictionOrmEntity>,
  ) {}

  async upsert(entity: StudentSubjectPredictionEntity): Promise<StudentSubjectPredictionEntity> {
    const rows = (await this.repo.manager.query(
      `INSERT INTO student_subject_predictions (
         id, student_id, subject_id, period_id, academic_week, academic_year,
         status, predicted_risk_level, trend_slope, recommendation, computed_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (student_id, subject_id, academic_week, academic_year)
       DO UPDATE SET
         period_id = EXCLUDED.period_id,
         status = EXCLUDED.status,
         predicted_risk_level = EXCLUDED.predicted_risk_level,
         trend_slope = EXCLUDED.trend_slope,
         recommendation = EXCLUDED.recommendation,
         computed_at = EXCLUDED.computed_at
       RETURNING *`,
      [
        entity.id,
        entity.studentId,
        entity.subjectId,
        entity.periodId,
        entity.academicWeek,
        entity.academicYear,
        entity.status,
        entity.predictedRiskLevel,
        entity.trendSlope,
        entity.recommendation,
        entity.computedAt,
      ],
    )) as Record<string, unknown>[];

    return this.rowToDomain(rows[0]);
  }

  async findLatestByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<StudentSubjectPredictionEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
    });
    return o ? this.toDomain(o) : null;
  }

  async findLatestBySubjectPaginated(
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectPredictionEntity[]; total: number }> {
    const [countResult, rows] = await Promise.all([
      this.repo.manager.query(
        `SELECT COUNT(DISTINCT student_id)::int AS total
         FROM student_subject_predictions
         WHERE subject_id = $1`,
        [subjectId],
      ) as Promise<{ total: number }[]>,
      this.repo.manager.query(
        `SELECT * FROM (
           SELECT DISTINCT ON (student_id) *
           FROM student_subject_predictions
           WHERE subject_id = $1
           ORDER BY student_id, academic_year DESC, academic_week DESC
         ) latest
         ORDER BY computed_at DESC
         LIMIT $2 OFFSET $3`,
        [subjectId, pagination.limit, (pagination.page - 1) * pagination.limit],
      ) as Promise<Record<string, unknown>[]>,
    ]);

    return {
      items: rows.map((r) => this.rowToDomain(r)),
      total: countResult[0]?.total ?? 0,
    };
  }

  private rowToDomain(row: Record<string, unknown>): StudentSubjectPredictionEntity {
    return new StudentSubjectPredictionEntity(
      row.id as string,
      row.student_id as string,
      row.subject_id as string,
      row.period_id as string,
      Number(row.academic_week),
      Number(row.academic_year),
      row.status as PredictionStatus,
      row.predicted_risk_level as PredictedRiskLevel | null,
      row.trend_slope !== null ? Number(row.trend_slope) : null,
      (row.recommendation as string | null) ?? null,
      new Date(row.computed_at as string),
    );
  }

  private toDomain = (o: StudentSubjectPredictionOrmEntity): StudentSubjectPredictionEntity =>
    new StudentSubjectPredictionEntity(
      o.id,
      o.studentId,
      o.subjectId,
      o.periodId,
      o.academicWeek,
      o.academicYear,
      o.status as PredictionStatus,
      o.predictedRiskLevel as PredictedRiskLevel | null,
      o.trendSlope !== null ? Number(o.trendSlope) : null,
      o.recommendation,
      o.computedAt,
    );
}
