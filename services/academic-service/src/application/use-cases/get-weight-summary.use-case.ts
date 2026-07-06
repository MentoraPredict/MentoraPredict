import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

@Injectable()
export class GetWeightSummaryUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository') private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(subjectId: string) {
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject) throw new NotFoundException('Materia no encontrada');

    const evaluations = await this.evalRepo.findBySubjectId(subjectId);

    const totalWeight = evaluations
      .filter((e) => e.isActive)
      .reduce((sum, e) => sum + e.weight, 0);

    return {
      totalWeight: Math.round(totalWeight * 100) / 100,
      isComplete: Math.abs(totalWeight - 100) < 0.001,
      evaluations: evaluations.map((e) => ({
        id: e.id,
        name: e.name,
        weight: e.weight,
        isActive: e.isActive,
      })),
    };
  }
}
