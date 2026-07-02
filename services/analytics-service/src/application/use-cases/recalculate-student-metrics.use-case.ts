import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CalculateAverageUseCase } from './calculate-average.use-case';
import { ClassifyRiskUseCase } from './classify-risk.use-case';
import { IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { IStudentSubjectMetricsRepository } from '../../domain/ports/i-student-subject-metrics.repository';
import { StudentSubjectMetricsEntity, SubjectRiskLevel } from '../../domain/entities/student-subject-metrics.entity';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertEntity, AlertSeverity } from '../../domain/entities/alert.entity';
import { IPredictionClientPort } from '../../domain/ports/i-prediction-client.port';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { getAcademicWeek } from '../../infrastructure/utils/academic-week.util';

const PASSING_GRADE = 7;
const TREND_LOOKBACK = 4;
const RISK_RANK: Record<SubjectRiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

/**
 * Weekly processing pipeline (Punto 12 del plan) — an explicit synchronous HTTP
 * call chain, NOT a cron job or a queue. This endpoint (POST
 * /api/v1/analytics/internal/recalculate) is only ever reached two ways, both
 * already wired in earlier phases, and both call it fire-and-forget (the
 * caller does not await it):
 *
 *   1. Docente importa notas       (Fase 4, ImportSubjectGradesUseCase)
 *   2. Estudiante guarda check-in  (Fase 5, UpsertCheckInUseCase)
 *
 * From the moment this use-case's execute() runs, everything below is
 * synchronous/awaited, in this order, per student:
 *   → CalculateAverageUseCase.execute        (await) — weighted average, all subjects
 *   → academic.getLatestCheckIn              (await) — this week's compliance/attendance/study/comprehension
 *   → academic.getGradesByStudent            (await) — failed-evaluations count for this subject
 *   → subjectMetricsRepo.findRecentByStudentSubject (await) — last N rows for trend + previous riskLevel
 *   → ClassifyRiskUseCase.execute            (sync)  — per-subject risk classification
 *   → subjectMetricsRepo.upsert              (await) — persists the per-subject weekly row (with trendSlope)
 *   → alert escalate/resolve                 (await) — Fase 7, see handleAlertTransition
 *   → prediction.triggerRecalculate          (fire-and-forget) — Fase 8, next link in the chain:
 *       POST prediction-service/internal/recalculate, which itself pulls
 *       riskLevel/trendSlope/factors back from this same metrics/latest
 *       endpoint — this use-case never pushes already-computed data to it.
 *   → notifyEscalation                       (await, own try/catch) — Fase 9:
 *       persists a STUDENT + TEACHER notification, but ONLY the first time
 *       an alert is CREATED (never on re-escalation of an already-ACTIVE
 *       alert, never on resolve). See handleAlertTransition.
 *
 * There is no cron, no queue, no periodic retry. If any call in this chain
 * fails for a given student, that student's row simply stays stale until the
 * next grade import or check-in save re-triggers this endpoint. This is the
 * decided architecture (Prompt 0), not an oversight.
 */
@Injectable()
export class RecalculateStudentMetricsUseCase {
  private readonly logger = new Logger(RecalculateStudentMetricsUseCase.name);

  constructor(
    private readonly calculateAverageUC: CalculateAverageUseCase,
    private readonly classifyRiskUC: ClassifyRiskUseCase,
    @Inject('IAcademicServiceClient') private readonly academic: IAcademicServiceClient,
    @Inject('IStudentSubjectMetricsRepository')
    private readonly subjectMetricsRepo: IStudentSubjectMetricsRepository,
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
    @Inject('IPredictionClientPort') private readonly predictionClient: IPredictionClientPort,
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(
    subjectId: string,
    periodId: string,
    studentIds: string[],
  ): Promise<{ processed: number; errors: string[] }> {
    let processed = 0;
    const errors: string[] = [];

    for (const studentId of studentIds) {
      try {
        // CalculateAverageUseCase also persists the pre-existing global
        // StudentMetricsEntity as a side effect (Fase 4 behavior, unchanged).
        const [metrics, checkIn, grades, recentRows] = await Promise.all([
          this.calculateAverageUC.execute(studentId, periodId),
          this.academic.getLatestCheckIn(studentId, subjectId, periodId),
          this.academic.getGradesByStudent(studentId, periodId),
          this.subjectMetricsRepo.findRecentByStudentSubject(studentId, subjectId, TREND_LOOKBACK),
        ]);

        const now = new Date();
        const { academicWeek, academicYear } = getAcademicWeek(now);

        const averageGrade = metrics.subjectAverages[subjectId] ?? null;
        // These four always travel together: they all come from the same
        // WeeklyCheckIn record, so a missing check-in means all four are
        // honestly null — never a fabricated neutral value (those only
        // exist for Fase 5's global risk-snapshot fallback).
        const complianceIndex = checkIn?.taskCompletion ?? null;
        const attendanceRate = checkIn ? (checkIn.attendance ? 100 : 0) : null;
        const studyHours = checkIn?.studyHours ?? null;
        const comprehensionAvg = checkIn?.generalComprehension ?? null;

        const failedEvaluations = grades.filter(
          (g) => g.subjectId === subjectId && g.value < PASSING_GRADE,
        ).length;

        // Rows for weeks strictly before the current one — if this endpoint
        // was already triggered once this week (e.g. grade import then
        // check-in the same week), recentRows may contain a stale row for
        // THIS week; that one must not count twice.
        const priorRows = recentRows.filter(
          (r) => !(r.academicWeek === academicWeek && r.academicYear === academicYear),
        );

        // Fase 7 — trendSlope: simple linear regression of averageGrade over
        // sequential weeks (oldest → newest), including the value just
        // computed for this week. null unless there are >= 2 non-null points.
        const historicalGrades = priorRows
          .slice()
          .sort((a, b) => a.academicYear - b.academicYear || a.academicWeek - b.academicWeek)
          .map((r) => r.averageGrade)
          .filter((v): v is number => v !== null);
        const gradePoints = averageGrade !== null ? [...historicalGrades, averageGrade] : historicalGrades;
        const trendSlope = gradePoints.length >= 2
          ? Math.round(this.computeLinearSlope(gradePoints) * 100) / 100
          : null;

        // Previous week's riskLevel, reused from the same query above — no
        // extra round-trip just to know "what changed".
        const previousRiskLevel = priorRows[0]?.riskLevel ?? null;

        // Only classify once every required input is a real number. A
        // missing check-in or an ungraded subject means "not enough data
        // yet" — a state distinct from "classified as low risk" — so
        // riskLevel stays null rather than guessing.
        let riskLevel: SubjectRiskLevel | null = null;
        if (averageGrade !== null && complianceIndex !== null && attendanceRate !== null && studyHours !== null) {
          const classification = this.classifyRiskUC.execute({
            globalAverage: averageGrade,
            complianceIndex,
            attendance: attendanceRate,
            failedEvaluations,
            trendSlope: trendSlope ?? 0,
            studyHours,
          });
          riskLevel = classification.riskLevel;
        }

        const entity = new StudentSubjectMetricsEntity(
          randomUUID(),
          studentId,
          subjectId,
          periodId,
          academicWeek,
          academicYear,
          averageGrade,
          complianceIndex,
          attendanceRate,
          studyHours,
          comprehensionAvg,
          riskLevel,
          trendSlope,
          now,
        );

        await this.subjectMetricsRepo.upsert(entity);

        await this.handleAlertTransition({
          studentId,
          subjectId,
          periodId,
          previousRiskLevel,
          riskLevel,
          averageGrade,
          complianceIndex,
          now,
        });

        // Fase 8 — fire-and-forget, same pattern as every trigger so far
        // (ImportSubjectGradesUseCase, UpsertCheckInUseCase): a failure here
        // must not fail the grade import or check-in save that got us here.
        this.predictionClient
          .triggerRecalculate(studentId, subjectId, periodId)
          .catch((err) =>
            this.logger.error(`Prediction trigger failed: ${err instanceof Error ? err.message : String(err)}`),
          );

        processed++;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        errors.push(`${studentId}: ${reason}`);
        this.logger.warn(`Recalculate failed for student ${studentId}: ${reason}`);
      }
    }

    return { processed, errors };
  }

  // Fase 7, punto 3 — an alert escalates on any upward risk transition (never
  // for an initial LOW classification) and resolves on any downward one.
  // Lateral (unchanged) transitions leave any existing alert untouched.
  private async handleAlertTransition(params: {
    studentId: string;
    subjectId: string;
    periodId: string;
    previousRiskLevel: SubjectRiskLevel | null;
    riskLevel: SubjectRiskLevel | null;
    averageGrade: number | null;
    complianceIndex: number | null;
    now: Date;
  }): Promise<void> {
    const { studentId, subjectId, periodId, previousRiskLevel, riskLevel, averageGrade, complianceIndex, now } = params;

    if (riskLevel === null) return; // insufficient data — don't guess at improvement or decline

    const prevRank = previousRiskLevel !== null ? RISK_RANK[previousRiskLevel] : -1;
    const rank = RISK_RANK[riskLevel];

    if (rank > prevRank && riskLevel !== 'LOW') {
      const fromLabel = previousRiskLevel ?? 'sin clasificación previa';
      const avgLabel = averageGrade !== null ? averageGrade.toFixed(1) : 'sin datos';
      const complianceLabel = complianceIndex !== null ? `${complianceIndex}%` : 'sin datos';
      const reason = `Riesgo escaló de ${fromLabel} a ${riskLevel} — promedio ${avgLabel}, cumplimiento de tareas ${complianceLabel}`;

      const existing = await this.alertRepo.findActiveByStudentAndSubject(studentId, subjectId);
      let alert: AlertEntity;
      if (existing) {
        existing.escalate(riskLevel as AlertSeverity, reason, now);
        alert = await this.alertRepo.update(existing);
      } else {
        alert = new AlertEntity(
          randomUUID(),
          studentId,
          'RISK_ESCALATION',
          reason,
          'ACTIVE',
          now,
          {},
          subjectId,
          periodId,
          riskLevel as AlertSeverity,
          now,
          null,
          null,
        );
        await this.alertRepo.save(alert);
      }

      // Fase 9 — notify only when a brand-new alert row was just created
      // (no pre-existing ACTIVE alert), never on a re-escalation of one that
      // was already active. A notification failure must not undo the
      // metrics/alert work already persisted above, so it gets its own
      // try/catch instead of bubbling to the per-student loop's catch.
      if (!existing) {
        try {
          await this.notifyEscalation(studentId, subjectId, periodId, riskLevel, reason, alert.id, now);
        } catch (err) {
          this.logger.error(
            `Notification creation failed for student ${studentId}/${subjectId}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    } else if (rank < prevRank) {
      const existing = await this.alertRepo.findActiveByStudentAndSubject(studentId, subjectId);
      if (existing) {
        existing.resolve('SYSTEM');
        await this.alertRepo.update(existing);
      }
    }
    // rank === prevRank: no change, leave any existing alert as-is.
  }

  // Fase 9 — one notification for the affected student, one for the
  // subject's teacher (if any is assigned). Reuses the alert's own `reason`
  // text instead of composing a new message from scratch.
  private async notifyEscalation(
    studentId: string,
    subjectId: string,
    periodId: string,
    riskLevel: SubjectRiskLevel,
    reason: string,
    alertId: string,
    now: Date,
  ): Promise<void> {
    // Degrades to a generic label instead of failing the whole notification
    // if academic-service is briefly unreachable — same resilience pattern
    // as getLatestSubjectMetric elsewhere in this chain.
    const subject = await this.academic.getSubjectDetails(subjectId).catch(() => null);
    const subjectName = subject?.name ?? 'la materia';

    const studentNotification = new NotificationEntity(
      randomUUID(),
      studentId,
      'STUDENT',
      'RISK_ESCALATION',
      alertId,
      subjectId,
      studentId,
      periodId,
      `Tu riesgo académico en ${subjectName} aumentó a ${riskLevel}`,
      reason,
      'UNREAD',
      now,
      null,
    );
    await this.notificationRepo.save(studentNotification);

    const teacherId = subject?.teacherId ?? null;
    if (!teacherId) return; // no teacher assigned — skip without failing

    const teacherNotification = new NotificationEntity(
      randomUUID(),
      teacherId,
      'TEACHER',
      'RISK_ESCALATION',
      alertId,
      subjectId,
      studentId,
      periodId,
      `Un estudiante de ${subjectName} escaló a riesgo ${riskLevel}`,
      `Estudiante ${studentId}: ${reason}`,
      'UNREAD',
      now,
      null,
    );
    await this.notificationRepo.save(teacherNotification);
  }

  private computeLinearSlope(values: number[]): number {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (values[i] - yMean);
      den += (i - xMean) ** 2;
    }
    return den === 0 ? 0 : num / den;
  }
}
