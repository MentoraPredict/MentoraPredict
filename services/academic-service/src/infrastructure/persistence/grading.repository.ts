import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import {
  GradeActivity,
  GradingComponent,
  PeriodClosureEvent,
  PeriodResult,
  PromotionDecision,
  PromotionOutcome,
  PromotionSuggestion,
  SupplementaryGrade,
} from '../../domain/entities/grading.entity';
import { DEFAULT_INSTITUTION_ID } from '../../domain/entities/institution-config.entity';
import {
  CourseSummary,
  GradeRow,
  GradeUpsertEntry,
  GradeUpsertResult,
  IGradingRepository,
} from '../../application/ports/output/i-grading.repository';
import { EvaluationOrmEntity } from './evaluation.orm-entity';
import { GradeHistoryOrmEntity } from './grade-history.orm-entity';
import { GradeOrmEntity } from './grade.orm-entity';
import {
  GradingComponentOrmEntity,
  PeriodClosureOrmEntity,
  PeriodResultOrmEntity,
  PromotionDecisionOrmEntity,
  SupplementaryGradeOrmEntity,
} from './grading.orm-entities';
import { StudentEnrollmentOrmEntity } from './people.orm-entities';

const ID = DEFAULT_INSTITUTION_ID;

@Injectable()
export class GradingRepository implements IGradingRepository {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  // ── Componentes ────────────────────────────────────────────────────────────

  async getComponents(): Promise<GradingComponent[]> {
    const list = await this.ds
      .getRepository(GradingComponentOrmEntity)
      .find({ where: { institutionId: ID }, order: { sortOrder: 'ASC', code: 'ASC' } });
    return list.map((c) => ({
      code: c.code,
      name: c.name,
      weight: Number(c.weight),
      sortOrder: c.sortOrder,
    }));
  }

  async replaceComponents(components: GradingComponent[]): Promise<GradingComponent[]> {
    await this.ds.transaction(async (em) => {
      const repo = em.getRepository(GradingComponentOrmEntity);
      await repo.delete({ institutionId: ID });
      await repo.save(
        components.map((c, index) =>
          repo.create({
            institutionId: ID,
            code: c.code,
            name: c.name,
            weight: String(c.weight),
            sortOrder: index + 1,
          }),
        ),
      );
    });
    return this.getComponents();
  }

  async listUsedComponentCodes(): Promise<string[]> {
    const rows: { code: string }[] = await this.ds.query(
      `SELECT DISTINCT component_code AS code FROM evaluations WHERE component_code IS NOT NULL`,
    );
    return rows.map((r) => r.code);
  }

  // ── Actividades ────────────────────────────────────────────────────────────

  async findActivity(id: string): Promise<GradeActivity | null> {
    const o = await this.ds.getRepository(EvaluationOrmEntity).findOne({ where: { id } });
    return o && o.periodId && o.componentCode ? this.toActivity(o) : null;
  }

  async listActivities(subjectId: string, periodId?: string): Promise<GradeActivity[]> {
    const list = await this.ds
      .getRepository(EvaluationOrmEntity)
      .createQueryBuilder('e')
      .where('e.subject_id = :subjectId', { subjectId })
      .andWhere('e.period_id IS NOT NULL AND e.component_code IS NOT NULL')
      .andWhere(periodId ? 'e.period_id = :periodId' : '1=1', { periodId })
      .orderBy('e.created_at', 'ASC')
      .getMany();
    return list.map((o) => this.toActivity(o));
  }

  async saveActivity(activity: GradeActivity): Promise<GradeActivity> {
    const repo = this.ds.getRepository(EvaluationOrmEntity);
    await repo.save(
      repo.create({
        id: activity.id,
        name: activity.name,
        // El peso individual no se usa: la nota del periodo sale de los componentes.
        weight: 0,
        subjectId: activity.subjectId,
        periodId: activity.periodId,
        componentCode: activity.componentCode,
        dueDate: activity.dueDate,
        isActive: activity.isActive,
      }),
    );
    return (await this.findActivity(activity.id)) as GradeActivity;
  }

  countActivityGrades(activityId: string): Promise<number> {
    return this.ds.getRepository(GradeOrmEntity).count({ where: { evaluationId: activityId } });
  }

  // ── Notas ──────────────────────────────────────────────────────────────────

  async listGradeRows(filter: {
    subjectId?: string;
    studentId?: string;
    periodId?: string;
  }): Promise<GradeRow[]> {
    const conditions = [
      'e.is_active = true',
      'e.component_code IS NOT NULL',
      'e.period_id IS NOT NULL',
    ];
    const params: string[] = [];
    const add = (column: string, value?: string) => {
      if (!value) return;
      params.push(value);
      conditions.push(`${column} = $${params.length}`);
    };
    add('g.subject_id', filter.subjectId);
    add('g.student_id', filter.studentId);
    add('e.period_id', filter.periodId);

    const rows: Array<{
      gradeId: string;
      studentId: string;
      subjectId: string;
      activityId: string;
      periodId: string;
      componentCode: string;
      value: string;
    }> = await this.ds.query(
      `SELECT g.id AS "gradeId", g.student_id AS "studentId", g.subject_id AS "subjectId",
              e.id AS "activityId", e.period_id AS "periodId",
              e.component_code AS "componentCode", g.value AS "value"
         FROM grades g
         JOIN evaluations e ON e.id = g.evaluation_id
        WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return rows.map((r) => ({ ...r, value: Number(r.value) }));
  }

  async upsertGrades(entries: GradeUpsertEntry[], registeredBy: string): Promise<GradeUpsertResult> {
    const result: GradeUpsertResult = { created: 0, updated: 0, unchanged: 0 };

    await this.ds.transaction(async (em) => {
      const grades = em.getRepository(GradeOrmEntity);
      const history = em.getRepository(GradeHistoryOrmEntity);

      for (const entry of entries) {
        const existing = await grades.findOne({
          where: { studentId: entry.studentId, evaluationId: entry.activityId },
        });
        const now = new Date();

        if (!existing) {
          await grades.save(
            grades.create({
              id: randomUUID(),
              studentId: entry.studentId,
              subjectId: entry.subjectId,
              evaluationId: entry.activityId,
              value: entry.value,
              registeredBy,
              registeredAt: now,
            }),
          );
          result.created++;
          continue;
        }

        if (Number(existing.value) === entry.value) {
          result.unchanged++;
          continue;
        }
        await history.save(
          history.create({
            id: randomUUID(),
            gradeId: existing.id,
            previousValue: Number(existing.value),
            newValue: entry.value,
            changedBy: registeredBy,
            changedAt: now,
          }),
        );
        existing.value = entry.value;
        await grades.save(existing);
        result.updated++;
      }
    });
    return result;
  }

  // ── Cursos y estudiantes ───────────────────────────────────────────────────

  async listActiveStudentIds(subjectId: string): Promise<string[]> {
    const rows: { studentId: string }[] = await this.ds.query(
      `SELECT student_id AS "studentId" FROM enrollments WHERE subject_id = $1 AND status = 'ACTIVE'`,
      [subjectId],
    );
    return rows.map((r) => r.studentId);
  }

  private readonly courseSelect = `
    SELECT s.id, c.name, c.code, s.section_id AS "sectionId", s.teacher_id AS "teacherId",
           s.academic_period_id AS "academicPeriodId"
      FROM subjects s
      JOIN subject_catalog c ON c.id = s.subject_catalog_id`;

  listSectionCourses(sectionId: string): Promise<CourseSummary[]> {
    return this.ds.query(
      `${this.courseSelect} WHERE s.section_id = $1 AND s.is_active = true ORDER BY c.name`,
      [sectionId],
    );
  }

  listSchoolYearCourses(schoolYearId: string): Promise<CourseSummary[]> {
    return this.ds.query(
      `${this.courseSelect}
         JOIN sections sec ON sec.id = s.section_id
        WHERE sec.school_year_id = $1 AND s.is_active = true
        ORDER BY sec.grade_level_code, sec.name, c.name`,
      [schoolYearId],
    );
  }

  // ── Cierre de periodos ─────────────────────────────────────────────────────

  async closePeriod(
    periodId: string,
    userId: string,
    results: PeriodResult[],
    event: PeriodClosureEvent,
  ): Promise<void> {
    await this.ds.transaction(async (em) => {
      await em.query(`UPDATE academic_periods SET closed_at = now(), closed_by = $2 WHERE id = $1`, [
        periodId,
        userId,
      ]);
      const repo = em.getRepository(PeriodResultOrmEntity);
      await repo.delete({ periodId });
      // Por lotes para no superar el límite de parámetros de PostgreSQL.
      for (let i = 0; i < results.length; i += 500) {
        await repo.save(
          results.slice(i, i + 500).map((r) =>
            repo.create({
              periodId: r.periodId,
              subjectId: r.subjectId,
              studentId: r.studentId,
              value: r.value === null ? null : String(r.value),
              isComplete: r.isComplete,
              bandCode: r.bandCode,
              closedAt: r.closedAt,
            }),
          ),
        );
      }
      await em.getRepository(PeriodClosureOrmEntity).save(this.closureToOrm(event));
    });
  }

  async reopenPeriod(periodId: string, event: PeriodClosureEvent): Promise<void> {
    await this.ds.transaction(async (em) => {
      await em.query(`UPDATE academic_periods SET closed_at = NULL, closed_by = NULL WHERE id = $1`, [periodId]);
      await em.getRepository(PeriodResultOrmEntity).delete({ periodId });
      await em.getRepository(PeriodClosureOrmEntity).save(this.closureToOrm(event));
    });
  }

  async listClosureEvents(periodId: string): Promise<PeriodClosureEvent[]> {
    const list = await this.ds
      .getRepository(PeriodClosureOrmEntity)
      .find({ where: { periodId }, order: { performedAt: 'DESC' } });
    return list.map((o) => ({
      id: o.id,
      periodId: o.periodId,
      action: o.action as 'CLOSE' | 'REOPEN',
      reason: o.reason,
      performedBy: o.performedBy,
      performedAt: o.performedAt,
    }));
  }

  async listPeriodResults(filter: {
    studentId?: string;
    subjectId?: string;
    periodId?: string;
  }): Promise<PeriodResult[]> {
    const where: Record<string, string> = {};
    if (filter.studentId) where.studentId = filter.studentId;
    if (filter.subjectId) where.subjectId = filter.subjectId;
    if (filter.periodId) where.periodId = filter.periodId;

    const list = await this.ds.getRepository(PeriodResultOrmEntity).find({ where });
    return list.map((o) => ({
      periodId: o.periodId,
      subjectId: o.subjectId,
      studentId: o.studentId,
      value: o.value === null ? null : Number(o.value),
      isComplete: o.isComplete,
      bandCode: o.bandCode,
      closedAt: o.closedAt,
    }));
  }

  // ── Supletorio ─────────────────────────────────────────────────────────────

  async listSupplementary(filter: {
    subjectId?: string;
    studentId?: string;
  }): Promise<SupplementaryGrade[]> {
    const where: Record<string, string> = {};
    if (filter.subjectId) where.subjectId = filter.subjectId;
    if (filter.studentId) where.studentId = filter.studentId;

    const list = await this.ds.getRepository(SupplementaryGradeOrmEntity).find({ where });
    return list.map((o) => ({
      subjectId: o.subjectId,
      studentId: o.studentId,
      value: Number(o.value),
      registeredBy: o.registeredBy,
      registeredAt: o.registeredAt,
    }));
  }

  async upsertSupplementary(entries: SupplementaryGrade[]): Promise<void> {
    const repo = this.ds.getRepository(SupplementaryGradeOrmEntity);
    await repo.save(
      entries.map((e) =>
        repo.create({
          subjectId: e.subjectId,
          studentId: e.studentId,
          value: String(e.value),
          registeredBy: e.registeredBy,
          registeredAt: e.registeredAt,
        }),
      ),
    );
  }

  // ── Promoción ──────────────────────────────────────────────────────────────

  async getDecision(studentEnrollmentId: string): Promise<PromotionDecision | null> {
    const o = await this.ds
      .getRepository(PromotionDecisionOrmEntity)
      .findOne({ where: { studentEnrollmentId } });
    return o ? this.decisionToDomain(o) : null;
  }

  async listDecisions(studentEnrollmentIds: string[]): Promise<PromotionDecision[]> {
    if (studentEnrollmentIds.length === 0) return [];
    const list = await this.ds
      .getRepository(PromotionDecisionOrmEntity)
      .createQueryBuilder('d')
      .where('d.student_enrollment_id IN (:...ids)', { ids: studentEnrollmentIds })
      .getMany();
    return list.map((o) => this.decisionToDomain(o));
  }

  async saveDecision(decision: PromotionDecision): Promise<void> {
    await this.ds.transaction(async (em) => {
      await em.getRepository(PromotionDecisionOrmEntity).save({
        studentEnrollmentId: decision.studentEnrollmentId,
        outcome: decision.outcome,
        suggested: decision.suggested,
        isOverride: decision.isOverride,
        notes: decision.notes,
        decidedBy: decision.decidedBy,
        decidedAt: decision.decidedAt,
      });
      await em.getRepository(StudentEnrollmentOrmEntity).update(
        { id: decision.studentEnrollmentId },
        {
          status: decision.outcome === 'PROMOTED' ? 'PROMOTED' : 'REPEATED',
          endedAt: decision.decidedAt,
        },
      );
    });
  }

  // ── Mapeos ─────────────────────────────────────────────────────────────────

  private toActivity(o: EvaluationOrmEntity): GradeActivity {
    return {
      id: o.id,
      subjectId: o.subjectId,
      periodId: o.periodId as string,
      componentCode: o.componentCode as string,
      name: o.name,
      dueDate: o.dueDate,
      isActive: o.isActive,
    };
  }

  private closureToOrm(e: PeriodClosureEvent): PeriodClosureOrmEntity {
    const o = new PeriodClosureOrmEntity();
    o.id = e.id;
    o.periodId = e.periodId;
    o.action = e.action;
    o.reason = e.reason;
    o.performedBy = e.performedBy;
    o.performedAt = e.performedAt;
    return o;
  }

  private decisionToDomain(o: PromotionDecisionOrmEntity): PromotionDecision {
    return {
      studentEnrollmentId: o.studentEnrollmentId,
      outcome: o.outcome as PromotionOutcome,
      suggested: o.suggested as PromotionSuggestion,
      isOverride: o.isOverride,
      notes: o.notes,
      decidedBy: o.decidedBy,
      decidedAt: o.decidedAt,
    };
  }
}
