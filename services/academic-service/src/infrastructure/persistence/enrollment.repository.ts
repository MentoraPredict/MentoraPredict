import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  EnrollmentEntity,
  EnrollmentStatus,
} from "../../domain/entities/enrollment.entity";
import {
  IEnrollmentRepository,
  StudentSubjectRawRow,
} from "../../application/ports/output/i-enrollment.repository";
import { EnrollmentOrmEntity } from "./enrollment.orm-entity";

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentOrmEntity)
    private readonly repo: Repository<EnrollmentOrmEntity>,
  ) {}

  async findById(id: string): Promise<EnrollmentEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<EnrollmentEntity | null> {
    const o = await this.repo.findOne({ where: { studentId, subjectId } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentSubjectAndPeriod(
    studentId: string,
    subjectId: string,
    periodId: string,
  ): Promise<EnrollmentEntity | null> {
    const o = await this.repo.findOne({
      where: { studentId, subjectId, periodId },
    });
    return o ? this.toDomain(o) : null;
  }

  async countActiveBySubject(subjectId: string): Promise<number> {
    return this.repo.count({ where: { subjectId, status: "ACTIVE" } });
  }

  async findByStudentId(studentId: string): Promise<EnrollmentEntity[]> {
    return (await this.repo.find({ where: { studentId } })).map(this.toDomain);
  }

  async findBySubjectIdPaginated(
    subjectId: string,
    filters: { status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: EnrollmentEntity[]; total: number }> {
    const where: Record<string, unknown> = { subjectId };
    if (filters.status) where.status = filters.status;

    const [orms, total] = await this.repo.findAndCount({
      where,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { enrolledAt: "DESC" },
    });
    return { items: orms.map(this.toDomain), total };
  }

  async findByStudentIdWithDetails(
    studentId: string,
    filters: { periodId?: string; status?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: StudentSubjectRawRow[]; total: number }> {
    const params: unknown[] = [studentId];
    let idx = 2;
    const conditions: string[] = ["e.student_id = $1"];

    if (filters.periodId) {
      conditions.push(`e.period_id = $${idx++}`);
      params.push(filters.periodId);
    }
    if (filters.status) {
      conditions.push(`e.status = $${idx++}`);
      params.push(filters.status);
    }

    const where = conditions.join(" AND ");

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM enrollments e
      WHERE ${where}
    `;

    const dataParams = [
      ...params,
      pagination.limit,
      (pagination.page - 1) * pagination.limit,
    ];
    const dataSql = `
      SELECT
        e.id AS "enrollmentId",
        e.student_id AS "studentId",
        e.status,
        e.enrolled_at AS "enrolledAt",
        s.id AS "subjectId",
        s.name AS "subjectName",
        s.code AS "subjectCode",
        s.description AS "subjectDescription",
        s.credits,
        s.max_capacity AS "maxCapacity",
        s.teacher_id AS "teacherId",
        c.id AS "careerId",
        c.name AS "careerName",
        p.id AS "periodId",
        p.name AS "periodName",
        p.status AS "periodStatus"
      FROM enrollments e
      INNER JOIN subjects s ON s.id = e.subject_id
      INNER JOIN careers c ON c.id = s.career_id
      INNER JOIN academic_periods p ON p.id = e.period_id
      WHERE ${where}
      ORDER BY e.enrolled_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const [countResult, items] = await Promise.all([
      this.repo.manager.query(countSql, params) as Promise<{ total: number }[]>,
      this.repo.manager.query(dataSql, dataParams) as Promise<StudentSubjectRawRow[]>,
    ]);

    return { items, total: countResult[0]?.total ?? 0 };
  }

  async save(e: EnrollmentEntity): Promise<EnrollmentEntity> {
    const saved = await this.repo.save(this.toOrm(e));
    return this.toDomain(saved);
  }

  async update(e: EnrollmentEntity): Promise<EnrollmentEntity> {
    await this.repo.save(this.toOrm(e));
    return e;
  }

  async saveWithCapacityCheck(
    enrollment: EnrollmentEntity,
    maxCapacity: number,
  ): Promise<'enrolled' | 'at_capacity' | 'already_enrolled'> {
    return this.repo.manager.transaction(async (em) => {
      await em.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        enrollment.subjectId,
      ]);

      const [{ count }] = (await em.query(
        `SELECT COUNT(*)::int AS count FROM enrollments
         WHERE subject_id = $1 AND status = 'ACTIVE'`,
        [enrollment.subjectId],
      )) as { count: number }[];

      if (count >= maxCapacity) return 'at_capacity';

      const existing = await em.query(
        `SELECT id FROM enrollments
         WHERE student_id = $1 AND subject_id = $2 AND period_id = $3 AND status = 'ACTIVE'`,
        [enrollment.studentId, enrollment.subjectId, enrollment.periodId],
      );
      if (existing.length > 0) return 'already_enrolled';

      await em.query(
        `INSERT INTO enrollments (id, student_id, subject_id, period_id, status, enrolled_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          enrollment.id,
          enrollment.studentId,
          enrollment.subjectId,
          enrollment.periodId,
          enrollment.status,
          enrollment.enrolledAt,
          enrollment.createdAt,
        ],
      );

      return 'enrolled';
    });
  }

  private toDomain = (o: EnrollmentOrmEntity): EnrollmentEntity =>
    new EnrollmentEntity(
      o.id,
      o.studentId,
      o.subjectId,
      o.periodId,
      o.status as EnrollmentStatus,
      o.enrolledAt,
      o.createdAt,
    );

  private toOrm(d: EnrollmentEntity): EnrollmentOrmEntity {
    const o = new EnrollmentOrmEntity();
    o.id = d.id;
    o.studentId = d.studentId;
    o.subjectId = d.subjectId;
    o.periodId = d.periodId;
    o.status = d.status;
    o.enrolledAt = d.enrolledAt;
    o.createdAt = d.createdAt;
    return o;
  }
}
