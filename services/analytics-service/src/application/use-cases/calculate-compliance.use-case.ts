import { Inject, Injectable } from '@nestjs/common';
import { IDatasetVersionRepository } from '../../domain/ports/i-dataset-version.repository';
import { ComplianceInputDto } from '../dtos/compliance-input.dto';

export type ComplianceClassification = 'EXCELLENT' | 'GOOD' | 'LOW' | 'CRITICAL';

export interface ComplianceResult {
  index: number;
  classification: ComplianceClassification;
}

@Injectable()
export class CalculateComplianceUseCase {
  constructor(
    @Inject('IDatasetVersionRepository') private readonly datasetRepo: IDatasetVersionRepository,
  ) {}

  async execute(studentId: string, input: ComplianceInputDto): Promise<ComplianceResult> {
    const index = Math.round(
      (input.asistencia * 0.35)
      + (input.tareas * 0.30)
      + (input.evaluaciones * 0.25)
      + (input.participacion * 0.10),
    );

    const classification = this.classify(index);
    const result = { index, classification };

    await this.datasetRepo.save({
      studentId,
      type: 'compliance',
      inputs: { ...input },
      result: result as unknown as Record<string, unknown>,
      timestamp: new Date(),
    });

    return result;
  }

  private classify(index: number): ComplianceClassification {
    if (index >= 90) return 'EXCELLENT';
    if (index >= 70) return 'GOOD';
    if (index >= 50) return 'LOW';
    return 'CRITICAL';
  }
}
