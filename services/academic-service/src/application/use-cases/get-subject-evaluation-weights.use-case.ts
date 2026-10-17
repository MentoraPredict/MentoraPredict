import { Inject, Injectable } from '@nestjs/common';
import { effectiveActivityWeights } from '../../domain/services/grading-rules';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { IGradingRepository } from '../ports/output/i-grading.repository';

@Injectable()
export class GetSubjectEvaluationWeightsUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('IGradingRepository') private readonly grading: IGradingRepository,
  ) {}

  /**
   * Las actividades de un paralelo escolar no llevan peso propio: su peso
   * efectivo sale de los componentes de la nota. Las evaluaciones del modelo
   * anterior conservan el suyo.
   */
  async execute(subjectId: string): Promise<{ id: string; weight: number; isActive: boolean }[]> {
    const [evals, activities, components] = await Promise.all([
      this.evalRepo.findBySubjectId(subjectId),
      this.grading.listActivities(subjectId),
      this.grading.getComponents(),
    ]);
    const effective = effectiveActivityWeights(components, activities);

    return evals.map((e) => ({
      id: e.id,
      weight: effective.get(e.id) ?? e.weight,
      isActive: e.isActive,
    }));
  }
}
