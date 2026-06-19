import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

@Injectable()
export class GetAcademicPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string): Promise<AcademicPeriodEntity> {
    const period = await this.repo.findById(id);
    if (!period) {
      throw new NotFoundException(`Academic period with id '${id}' not found`);
    }
    return period;
  }
}
