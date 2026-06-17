import { Inject, Injectable } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

@Injectable()
export class ListAcademicPeriodsUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(): Promise<AcademicPeriodEntity[]> {
    return this.repo.findAll();
  }
}
