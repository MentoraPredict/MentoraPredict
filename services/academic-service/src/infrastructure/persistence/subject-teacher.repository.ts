import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import {
  ISubjectTeacherRepository,
  TeacherSubjectRawRow,
} from '../../application/ports/output/i-subject-teacher.repository';
import { SubjectTeacherOrmEntity } from './subject-teacher.orm-entity';

@Injectable()
export class SubjectTeacherRepository implements ISubjectTeacherRepository {
  constructor(
    @InjectRepository(SubjectTeacherOrmEntity)
    private readonly repo: Repository<SubjectTeacherOrmEntity>,
  ) {}

  async findBySubjectTeacherAndPeriod(
    subjectId: string, teacherId: string, periodId: string,
  ): Promise<SubjectTeacherEntity | null> {
    const o = await this.repo.findOne({ where: { subjectId, teacherId, periodId } });
    return o ? new SubjectTeacherEntity(o.subjectId, o.teacherId, o.periodId) : null;
  }

  async save(assignment: SubjectTeacherEntity): Promise<SubjectTeacherEntity> {
    const o = new SubjectTeacherOrmEntity();
    o.subjectId = assignment.subjectId;
    o.teacherId = assignment.teacherId;
    o.periodId = assignment.periodId;
    await this.repo.save(o);
    return assignment;
  }

  async findByTeacherIdWithDetails(
    teacherId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: TeacherSubjectRawRow[]; total: number }> {
    const params: unknown[] = [teacherId];
    let idx = 2;
    const conditions: string[] = ['st.teacher_id = $1'];

    if (filters.periodId) {
      conditions.push(`st.period_id = $${idx++}`);
      params.push(filters.periodId);
    }
    if (filters.status !== undefined) {
      conditions.push(`s.is_active = $${idx++}`);
      params.push(filters.status === 'ACTIVE');
    }

    const where = conditions.join(' AND ');

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM subject_teachers st
      INNER JOIN subjects s ON s.id = st.subject_id
      WHERE ${where}
    `;

    const dataParams = [
      ...params,
      pagination.limit,
      (pagination.page - 1) * pagination.limit,
    ];
    const dataSql = `
      SELECT
        s.id,
        s.name,
        s.code,
        s.description,
        s.credits,
        s.max_capacity AS "maxCapacity",
        s.is_active AS "isActive",
        c.id AS "careerId",
        c.name AS "careerName",
        c.code AS "careerCode",
        f.id AS "facultyId",
        f.name AS "facultyName",
        f.code AS "facultyCode",
        p.id AS "periodId",
        p.name AS "periodName",
        p.code AS "periodCode",
        p.status AS "periodStatus",
        p.start_date AS "periodStartDate",
        p.end_date AS "periodEndDate",
        (SELECT COUNT(*)::int FROM enrollments e
         WHERE e.subject_id = s.id AND e.status = 'ACTIVE') AS "enrolledCount"
      FROM subject_teachers st
      INNER JOIN subjects s ON s.id = st.subject_id
      INNER JOIN careers c ON c.id = s.career_id
      INNER JOIN faculties f ON f.id = c.faculty_id
      INNER JOIN academic_periods p ON p.id = st.period_id
      WHERE ${where}
      ORDER BY s.name ASC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, items] = await Promise.all([
      this.repo.manager.query(countSql, params) as Promise<{ total: number }[]>,
      this.repo.manager.query(dataSql, dataParams) as Promise<TeacherSubjectRawRow[]>,
    ]);

    return {
      items,
      total: countResult[0]?.total ?? 0,
    };
  }
}
