import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceRecord, AttendanceSummary } from '../../domain/entities/attendance.entity';
import { AttendanceRule } from '../../domain/entities/institution-config.entity';
import {
  AttendanceEvaluation,
  evaluateAttendance,
  ruleApplies,
  summarizeAttendance,
} from '../../domain/services/attendance-rules';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { IAttendanceRepository } from '../ports/output/i-attendance.repository';
import { IInstitutionConfigRepository } from '../ports/output/i-institution-config.repository';

export interface AttendanceContext {
  rule: AttendanceRule;
  applies: boolean;
}

export interface AttendanceResult {
  summary: AttendanceSummary;
  evaluation: AttendanceEvaluation;
}

/**
 * Reúne la regla de asistencia vigente y la aplica a los registros del
 * docente. Las reglas puras viven en `domain/services/attendance-rules`.
 */
@Injectable()
export class AttendanceCalculator {
  constructor(
    @Inject('IAttendanceRepository') private readonly attendance: IAttendanceRepository,
    @Inject('IInstitutionConfigRepository') private readonly config: IInstitutionConfigRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
  ) {}

  /** Regla y si aplica al nivel del paralelo. */
  async contextForSection(sectionId: string): Promise<AttendanceContext> {
    const section = await this.structure.findSection(sectionId);
    if (!section) throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);

    const [rule, catalog, gradeLevel] = await Promise.all([
      this.config.getAttendanceRule(),
      this.config.listLevelCatalog(),
      this.structure.findGradeLevel(section.gradeLevelCode),
    ]);
    const level = catalog.find((l) => l.code === gradeLevel?.levelCode);
    return { rule, applies: level ? ruleApplies(rule, level.sortOrder) : true };
  }

  evaluate(records: AttendanceRecord[], ctx: AttendanceContext): AttendanceResult {
    const summary = summarizeAttendance(records);
    return { summary, evaluation: evaluateAttendance(ctx.rule, summary, ctx.applies) };
  }

  /** Resultado por asignatura de un estudiante. */
  async studentBySubject(
    studentId: string,
    subjectIds: string[],
    ctx: AttendanceContext,
  ): Promise<Map<string, AttendanceResult>> {
    const records = await this.attendance.listRecords({ studentId, subjectIds });
    return new Map(
      subjectIds.map((id) => [id, this.evaluate(records.filter((r) => r.subjectId === id), ctx)]),
    );
  }

  /** true si el estudiante superó el límite en alguna asignatura. */
  async studentExceeded(studentId: string, subjectIds: string[], ctx: AttendanceContext): Promise<boolean> {
    if (!ctx.applies || subjectIds.length === 0) return false;
    const results = await this.studentBySubject(studentId, subjectIds, ctx);
    return [...results.values()].some((r) => r.evaluation.status === 'EXCEEDED');
  }
}
