import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

@Injectable()
export class GetActivePeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(): Promise<AcademicPeriodEntity> {
    const period = await this.repo.findActive();
    if (!period) {
      throw new NotFoundException('No active academic period found');
    }
    return period;
  }
}
