import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EvaluationWeight, IAcademicServiceClient } from '../../domain/ports/i-academic-service.client';
import { IStudentMetricsRepository } from '../../domain/ports/i-student-metrics.repository';
import { IMetricsCachePort } from '../../domain/ports/i-metrics-cache.port';
import { StudentMetricsEntity } from '../../domain/entities/student-metrics.entity';
import { Grade } from '../../domain/entities/grade.vo';

const CACHE_TTL = 300;

@Injectable()
export class CalculateAverageUseCase {
  constructor(
    @Inject('IAcademicServiceClient')    private readonly academic: IAcademicServiceClient,
    @Inject('IStudentMetricsRepository') private readonly metricsRepo: IStudentMetricsRepository,
    @Inject('IMetricsCachePort')         private readonly cache: IMetricsCachePort,
  ) {}

  async execute(studentId: string, periodId: string, correlationId?: string): Promise<StudentMetricsEntity> {
    const cacheKey = `metrics:${studentId}:${periodId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached) as StudentMetricsEntity;

    const grades = await this.academic.getGradesByStudent(studentId, periodId, correlationId);

    if (grades.length === 0) {
      const previous = await this.metricsRepo.findByStudentAndPeriod(studentId, periodId);
      const metrics = new StudentMetricsEntity(
        randomUUID(), studentId, periodId, {}, 0, new Date(), (previous?.version ?? 0) + 1,
      );
      const saved = await this.metricsRepo.save(metrics);
      await this.cache.set(cacheKey, JSON.stringify(saved), CACHE_TTL);
      return saved;
    }

    // Group grades by subjectId — now one entry per evaluation
    const gradesBySubject = new Map<string, Grade[]>();
    for (const g of grades) {
      const bucket = gradesBySubject.get(g.subjectId) ?? [];
      bucket.push(g);
      gradesBySubject.set(g.subjectId, bucket);
    }

    // For subjects that have evaluation-linked grades, fetch weights in parallel
    const subjectsNeedingWeights = [...gradesBySubject.entries()]
      .filter(([, gs]) => gs.some((g) => g.evaluationId))
      .map(([subjectId]) => subjectId);

    const evalResults = await Promise.all(
      subjectsNeedingWeights.map((id) =>
        this.academic.getEvaluationsBySubject(id, correlationId).catch((): EvaluationWeight[] => []),
      ),
    );
    const evalsBySubject = new Map<string, EvaluationWeight[]>(
      subjectsNeedingWeights.map((id, i) => [id, evalResults[i]]),
    );

    // Compute per-subject weighted averages
    const subjectAverages: Record<string, number> = {};
    const creditsBySubject: Record<string, number> = {};

    for (const [subjectId, sg] of gradesBySubject.entries()) {
      creditsBySubject[subjectId] = (sg[0]?.subjectCredits ?? 0) > 0 ? sg[0].subjectCredits : 1;

      const evals = evalsBySubject.get(subjectId) ?? [];
      const weightMap = new Map(evals.filter((e) => e.isActive).map((e) => [e.id, e.weight]));

      const evalGrades = sg.filter((g) => g.evaluationId && weightMap.has(g.evaluationId!));

      if (evalGrades.length > 0) {
        // Weighted average: Σ(value × weight) / Σ(weight) for graded evaluations only
        let weightedSum = 0;
        let totalWeight = 0;
        for (const g of evalGrades) {
          const w = weightMap.get(g.evaluationId!)!;
          weightedSum += g.value * w;
          totalWeight += w;
        }
        subjectAverages[subjectId] =
          totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
      } else {
        // Legacy: grades without evaluationId — simple average
        const avg = sg.reduce((s, g) => s + g.value, 0) / sg.length;
        subjectAverages[subjectId] = Math.round(avg * 100) / 100;
      }
    }

    // Global average: weighted by subject credits
    let weighted = 0;
    let totalCredits = 0;
    for (const [subjectId, avg] of Object.entries(subjectAverages)) {
      const credits = creditsBySubject[subjectId] ?? 1;
      weighted += avg * credits;
      totalCredits += credits;
    }
    const globalAverage =
      totalCredits > 0 ? Math.round((weighted / totalCredits) * 100) / 100 : 0;

    const previous = await this.metricsRepo.findByStudentAndPeriod(studentId, periodId);
    const version = (previous?.version ?? 0) + 1;

    const metrics = new StudentMetricsEntity(
      randomUUID(), studentId, periodId, subjectAverages, globalAverage, new Date(), version,
    );

    const saved = await this.metricsRepo.save(metrics);
    await this.cache.set(cacheKey, JSON.stringify(saved), CACHE_TTL);
    return saved;
  }
}
