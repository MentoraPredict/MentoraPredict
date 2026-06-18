import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

@Injectable()
export class DeleteSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }

    const hasRecords = await this.repo.hasAcademicRecords(id);
    if (hasRecords) {
      throw new BadRequestException('Cannot delete subject with academic records');
    }

    await this.repo.delete(id);
  }
}
