import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import {
  GradingComponent,
  PromotionSuggestion,
  SubjectResultStatus,
} from '../../domain/entities/grading.entity';
import { GradingScale, PromotionRule } from '../../domain/entities/institution-config.entity';
import { StudentEnrollment } from '../../domain/entities/people.entity';
import {
  PeriodGradeResult,
  computeAnnualAverage,
  computePeriodGrade,
  resolveSubjectResult,
  suggestPromotion,
} from '../../domain/services/grading-rules';
import { qualitativeFor } from '../../domain/services/institution-rules';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { IAcademicStructureRepository } from '../ports/output/i-academic-structure.repository';
import { CourseSummary, GradeRow, IGradingRepository } from '../ports/output/i-grading.repository';
import { IInstitutionConfigRepository } from '../ports/output/i-institution-config.repository';

export interface GradingConfig {
  components: GradingComponent[];
  scale: GradingScale;
  rules: PromotionRule[];
}

export interface PeriodInfo {
  id: string;
  name: string;
  number: number | null;
  isClosed: boolean;
}

export interface CoursePeriodCell {
  periodId: string;
  value: number | null;
  isComplete: boolean;
  bandCode: string | null;
  isClosed: boolean;
}

export interface CourseYearResult {
  subjectId: string;
  name: string;
  code: string;
  periods: CoursePeriodCell[];
  annualAverage: number | null;
  supplementaryGrade: number | null;
  finalGrade: number | null;
  status: SubjectResultStatus;
  bandCode: string | null;
}

export interface StudentYearResult {
  enrollmentId: string;
  periods: PeriodInfo[];
  courses: CourseYearResult[];
  suggestion: PromotionSuggestion;
  reasons: string[];
}

/** Lo que se comparte entre todos los estudiantes de un paralelo. */
export interface SectionContext {
  config: GradingConfig;
  periods: AcademicPeriodEntity[];
  courses: CourseSummary[];
  rule: PromotionRule | undefined;
}

/**
 * Calcula notas de periodo, promedios anuales, resultados por asignatura y la
 * sugerencia de promoción a partir de la configuración institucional.
 * Reúne los datos; las reglas puras están en `domain/services/grading-rules`.
 */
@Injectable()
export class GradingCalculator {
  constructor(
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
    @Inject('IInstitutionConfigRepository') private readonly config: IInstitutionConfigRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
    @Inject('IAcademicStructureRepository') private readonly structure: IAcademicStructureRepository,
  ) {}

  async loadConfig(): Promise<GradingConfig> {
    const [components, scale, rules] = await Promise.all([
      this.grading.getComponents(),
      this.config.getGradingScale(),
      this.config.getPromotionRules(),
    ]);
    return { components, scale, rules };
  }

  /** Nota del periodo de cada estudiante activo de una asignatura. */
  async coursePeriod(
    subjectId: string,
    periodId: string,
    config?: GradingConfig,
  ): Promise<{ config: GradingConfig; studentIds: string[]; rows: GradeRow[]; byStudent: Map<string, PeriodGradeResult> }> {
    const cfg = config ?? (await this.loadConfig());
    const [studentIds, rows] = await Promise.all([
      this.grading.listActiveStudentIds(subjectId),
      this.grading.listGradeRows({ subjectId, periodId }),
    ]);

    const byStudent = new Map<string, PeriodGradeResult>();
    for (const studentId of studentIds) {
      byStudent.set(
        studentId,
        computePeriodGrade(cfg.components, rows.filter((r) => r.studentId === studentId), cfg.scale),
      );
    }
    return { config: cfg, studentIds, rows, byStudent };
  }

  async buildSectionContext(sectionId: string): Promise<SectionContext> {
    const section = await this.structure.findSection(sectionId);
    if (!section) throw new NotFoundException(`Paralelo '${sectionId}' no encontrado`);

    const [config, periods, courses, gradeLevel] = await Promise.all([
      this.loadConfig(),
      this.periodRepo.findBySchoolYear(section.schoolYearId),
      this.grading.listSectionCourses(sectionId),
      this.structure.findGradeLevel(section.gradeLevelCode),
    ]);
    return {
      config,
      periods,
      courses,
      rule: config.rules.find((r) => r.levelCode === gradeLevel?.levelCode),
    };
  }

  /** Resultados anuales de un estudiante en las asignaturas de su paralelo. */
  async studentYear(enrollment: StudentEnrollment, ctx: SectionContext): Promise<StudentYearResult> {
    const { config, periods, courses, rule } = ctx;
    const [rows, snapshots, supplementary] = await Promise.all([
      this.grading.listGradeRows({ studentId: enrollment.studentId }),
      this.grading.listPeriodResults({ studentId: enrollment.studentId }),
      this.grading.listSupplementary({ studentId: enrollment.studentId }),
    ]);

    const results: CourseYearResult[] = courses.map((course) => {
      const cells: CoursePeriodCell[] = periods.map((period) => {
        if (period.isClosed) {
          const snap = snapshots.find((s) => s.periodId === period.id && s.subjectId === course.id);
          return {
            periodId: period.id,
            value: snap?.value ?? null,
            isComplete: snap?.isComplete ?? false,
            bandCode: snap?.bandCode ?? null,
            isClosed: true,
          };
        }
        const live = computePeriodGrade(
          config.components,
          rows.filter((r) => r.subjectId === course.id && r.periodId === period.id),
          config.scale,
        );
        return {
          periodId: period.id,
          value: live.value,
          isComplete: live.isComplete,
          bandCode: live.value === null ? null : (qualitativeFor(config.scale, live.value)?.code ?? null),
          isClosed: false,
        };
      });

      // El promedio anual solo cuenta periodos cerrados y completos.
      const annualAverage = computeAnnualAverage(
        cells.map((c) => (c.isClosed && c.isComplete ? c.value : null)),
        config.scale,
      );
      const supplementaryGrade =
        supplementary.find((s) => s.subjectId === course.id)?.value ?? null;
      const outcome = resolveSubjectResult({
        annualAverage,
        supplementaryGrade,
        rule,
        scale: config.scale,
      });

      return {
        subjectId: course.id,
        name: course.name,
        code: course.code,
        periods: cells,
        annualAverage,
        supplementaryGrade,
        finalGrade: outcome.finalGrade,
        status: outcome.status,
        bandCode:
          outcome.finalGrade === null ? null : (qualitativeFor(config.scale, outcome.finalGrade)?.code ?? null),
      };
    });

    const suggestion = suggestPromotion({
      results: results.map((r) => ({ status: r.status, finalGrade: r.finalGrade })),
      rule,
    });

    return {
      enrollmentId: enrollment.id,
      periods: periods.map((p) => ({ id: p.id, name: p.name, number: p.number, isClosed: p.isClosed })),
      courses: results,
      suggestion: suggestion.outcome,
      reasons: suggestion.reasons,
    };
  }
}
