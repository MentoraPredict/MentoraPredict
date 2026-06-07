import { BadRequestException, NotFoundException, Inject, Injectable } from '@nestjs/common';
import { randomUUID as uuidv4 } from 'crypto';
import { EvaluationEntity } from '../../domain/entities/evaluation.entity';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';

@Injectable()
export class CreateEvaluationUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository')    private readonly subjectRepo: ISubjectRepository,
  ) {}

  async execute(dto: CreateEvaluationDto): Promise<EvaluationEntity> {
    const subject = await this.subjectRepo.findById(dto.subjectId);
    if (!subject || !subject.isActive) throw new NotFoundException('Subject not found or inactive');

    // Validate total weight does not exceed 100
    const current = await this.evalRepo.getTotalWeightForSubject(dto.subjectId);
    if (current + dto.weight > 100) {
      throw new BadRequestException(
        `Adding ${dto.weight}% would exceed 100%. Current total: ${current}%`
      );
    }

    const now   = new Date();
    const evaluation = new EvaluationEntity(
      uuidv4(), dto.name, dto.weight, dto.subjectId,
      dto.dueDate ? new Date(dto.dueDate) : null,
      true, now, now,
    );
    return this.evalRepo.save(evaluation);
  }
}
