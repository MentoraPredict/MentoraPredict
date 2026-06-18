import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AcademicPeriodEntity,
  PeriodType,
} from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

export interface CreateAcademicPeriodDto {
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: PeriodType;
}

@Injectable()
export class CreateAcademicPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: CreateAcademicPeriodDto): Promise<AcademicPeriodEntity> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const existingByCode = await this.repo.findByCode(dto.code);
    if (existingByCode) {
      throw new ConflictException(`Academic period with code '${dto.code}' already exists`);
    }

    const existingByName = await this.repo.findByName(dto.name);
    if (existingByName) {
      throw new ConflictException(`Academic period with name '${dto.name}' already exists`);
    }

    const now = new Date();
    const period = new AcademicPeriodEntity(
      randomUUID(),
      dto.name,
      dto.code,
      dto.description ?? '',
      start,
      end,
      'PLANNED',
      dto.type,
      now,
      now,
    );

    return this.repo.save(period);
  }
}
