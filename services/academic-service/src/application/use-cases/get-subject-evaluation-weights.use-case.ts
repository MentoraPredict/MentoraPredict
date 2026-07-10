import { Inject, Injectable } from '@nestjs/common';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';

@Injectable()
export class GetSubjectEvaluationWeightsUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
  ) {}

  async execute(subjectId: string): Promise<{ id: string; weight: number; isActive: boolean }[]> {
    const evals = await this.evalRepo.findBySubjectId(subjectId);
    return evals.map((e) => ({ id: e.id, weight: e.weight, isActive: e.isActive }));
  }
}
