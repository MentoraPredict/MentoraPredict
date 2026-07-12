import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StudentSubjectMetricsEntity,
  SubjectRiskLevel,
} from '../../domain/entities/student-subject-metrics.entity';
import {
  IStudentSubjectMetricsRepository,
  SubjectRiskCounts,
} from '../../domain/ports/i-student-subject-metrics.repository';
import { StudentSubjectMetricsOrmEntity } from './student-subject-metrics.orm-entity';

@Injectable()
export class StudentSubjectMetricsRepository implements IStudentSubjectMetricsRepository {
  constructor(
    @InjectRepository(StudentSubjectMetricsOrmEntity)
    private readonly repo: Repository<StudentSubjectMetricsOrmEntity>,
  ) {}

  async upsert(entity: StudentSubjectMetricsEntity): Promise<StudentSubjectMetricsEntity> {
    const rows = (await this.repo.manager.query(
      `INSERT INTO student_subject_metrics (
         id, student_id, subject_id, period_id, academic_week, academic_year,
         average_grade, compliance_index, attendance_rate, study_hours,
         comprehension_avg, risk_level, trend_slope, computed_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (student_id, subject_id, academic_week, academic_year)
       DO UPDATE SET
         period_id = EXCLUDED.period_id,
         average_grade = EXCLUDED.average_grade,
         compliance_index = EXCLUDED.compliance_index,
         attendance_rate = EXCLUDED.attendance_rate,
         study_hours = EXCLUDED.study_hours,
         comprehension_avg = EXCLUDED.comprehension_avg,
         risk_level = EXCLUDED.risk_level,
         trend_slope = EXCLUDED.trend_slope,
         computed_at = EXCLUDED.computed_at
       RETURNING *`,
      [
        entity.id,
        entity.studentId,
        entity.subjectId,
        entity.periodId,
        entity.academicWeek,
        entity.academicYear,
        entity.averageGrade,
        entity.complianceIndex,
        entity.attendanceRate,
        entity.studyHours,
        entity.comprehensionAvg,
        entity.riskLevel,
        entity.trendSlope,
        entity.computedAt,
      ],
    )) as Record<string, unknown>[];

    return this.rowToDomain(rows[0]);
  }

  async findLatestByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<StudentSubjectMetricsEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
    });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentSubjectPaginated(
    studentId: string,
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectMetricsEntity[]; total: number }> {
    const [orms, total] = await this.repo.findAndCount({
      where: { studentId, subjectId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items: orms.map(this.toDomain), total };
  }

  async findRecentByStudentSubject(
    studentId: string,
    subjectId: string,
    limit: number,
  ): Promise<StudentSubjectMetricsEntity[]> {
    const orms = await this.repo.find({
      where: { studentId, subjectId },
      order: { academicYear: 'DESC', academicWeek: 'DESC' },
      take: limit,
    });
    return orms.map(this.toDomain);
  }

  async getRiskCountsBySubject(subjectId: string): Promise<SubjectRiskCounts> {
    const rows = (await this.repo.manager.query(
      `SELECT risk_level AS "riskLevel", COUNT(*)::int AS count
       FROM (
         SELECT DISTINCT ON (student_id) student_id, risk_level
         FROM student_subject_metrics
         WHERE subject_id = $1
         ORDER BY student_id, academic_year DESC, academic_week DESC
       ) latest
       GROUP BY risk_level`,
      [subjectId],
    )) as { riskLevel: string | null; count: number }[];

    const counts: SubjectRiskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, unclassified: 0 };
    for (const row of rows) {
      if (row.riskLevel === null) counts.unclassified = row.count;
      else if (row.riskLevel in counts) counts[row.riskLevel as SubjectRiskLevel] = row.count;
    }
    return counts;
  }

  async getAverageGradeBySubject(subjectId: string): Promise<number | null> {
    const rows = (await this.repo.manager.query(
      `SELECT AVG(average_grade)::float AS "averageGrade"
       FROM (
         SELECT DISTINCT ON (student_id) student_id, average_grade
         FROM student_subject_metrics
         WHERE subject_id = $1
         ORDER BY student_id, academic_year DESC, academic_week DESC
       ) latest
       WHERE average_grade IS NOT NULL`,
      [subjectId],
    )) as { averageGrade: number | null }[];

    return rows[0]?.averageGrade ?? null;
  }

  private rowToDomain(row: Record<string, unknown>): StudentSubjectMetricsEntity {
    return new StudentSubjectMetricsEntity(
      row.id as string,
      row.student_id as string,
      row.subject_id as string,
      row.period_id as string,
      Number(row.academic_week),
      Number(row.academic_year),
      row.average_grade !== null ? Number(row.average_grade) : null,
      row.compliance_index !== null ? Number(row.compliance_index) : null,
      row.attendance_rate !== null ? Number(row.attendance_rate) : null,
      row.study_hours !== null ? Number(row.study_hours) : null,
      row.comprehension_avg !== null ? Number(row.comprehension_avg) : null,
      row.risk_level as SubjectRiskLevel | null,
      row.trend_slope !== null ? Number(row.trend_slope) : null,
      new Date(row.computed_at as string),
    );
  }

  private toDomain = (o: StudentSubjectMetricsOrmEntity): StudentSubjectMetricsEntity =>
    new StudentSubjectMetricsEntity(
      o.id,
      o.studentId,
      o.subjectId,
      o.periodId,
      o.academicWeek,
      o.academicYear,
      o.averageGrade !== null ? Number(o.averageGrade) : null,
      o.complianceIndex,
      o.attendanceRate,
      o.studyHours !== null ? Number(o.studyHours) : null,
      o.comprehensionAvg,
      o.riskLevel as SubjectRiskLevel | null,
      o.trendSlope !== null ? Number(o.trendSlope) : null,
      o.computedAt,
    );
}
