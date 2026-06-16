import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AcademicPeriodEntity,
  PeriodStatus,
} from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

@Injectable()
export class ChangeAcademicPeriodStatusUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, status: PeriodStatus): Promise<AcademicPeriodEntity> {
    const period = await this.repo.findById(id);
    if (!period) {
      throw new NotFoundException(`Academic period with id '${id}' not found`);
    }

    if (status === 'ACTIVE') {
      const activeCount = await this.repo.countActive();
      if (activeCount > 0) {
        throw new ConflictException('Another period is already active');
      }
      period.activate();
    } else if (status === 'FINISHED') {
      period.finish();
    } else if (status === 'CANCELLED') {
      period.cancel();
    } else {
      period.plan();
    }

    return this.repo.update(period);
  }
}
