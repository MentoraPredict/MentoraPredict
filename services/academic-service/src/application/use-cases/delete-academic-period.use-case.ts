import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

@Injectable()
export class DeleteAcademicPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const period = await this.repo.findById(id);
    if (!period) {
      throw new NotFoundException(`Academic period with id '${id}' not found`);
    }

    const hasRecords = await this.repo.hasRecords(id);
    if (hasRecords) {
      throw new BadRequestException('Cannot delete period with associated records');
    }

    await this.repo.delete(id);
  }
}
