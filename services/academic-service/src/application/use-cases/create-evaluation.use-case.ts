import { BadRequestException, ConflictException, NotFoundException, Inject, Injectable } from '@nestjs/common';
import { randomUUID as uuidv4 } from 'crypto';
import { EvaluationEntity } from '../../domain/entities/evaluation.entity';
import { IEvaluationRepository } from '../ports/output/i-evaluation.repository';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';

@Injectable()
export class CreateEvaluationUseCase {
  constructor(
    @Inject('IEvaluationRepository') private readonly evalRepo: IEvaluationRepository,
    @Inject('ISubjectRepository')    private readonly subjectRepo: ISubjectRepository,
    @Inject('IAcademicPeriodRepository') private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: CreateEvaluationDto, subjectIdOverride?: string): Promise<EvaluationEntity> {
    const subjectId = subjectIdOverride ?? dto.subjectId;
    const subject = await this.subjectRepo.findById(subjectId);
    if (!subject || !subject.isActive) throw new NotFoundException('Subject not found or inactive');

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede crear una evaluación en un periodo inactivo');
    }

    const current = await this.evalRepo.getTotalWeightForSubject(subjectId);
    if (current + dto.weight > 100) {
      throw new BadRequestException(
        `Adding ${dto.weight}% would exceed 100%. Current total: ${current}%`
      );
    }

    const now   = new Date();
    const evaluation = new EvaluationEntity(
      uuidv4(), dto.name, dto.weight, subjectId,
      dto.dueDate ? new Date(dto.dueDate) : null,
      true, now, now,
    );
    return this.evalRepo.save(evaluation);
  }
}
