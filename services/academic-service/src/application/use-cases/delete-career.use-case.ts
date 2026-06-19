import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICareerRepository } from '../ports/output/i-career.repository';

@Injectable()
export class DeleteCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly repo: ICareerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const career = await this.repo.findById(id);
    if (!career) {
      throw new NotFoundException(`Career with id '${id}' not found`);
    }

    const hasSubjects = await this.repo.hasSubjects(id);
    if (hasSubjects) {
      throw new BadRequestException('Cannot delete career with associated subjects');
    }

    await this.repo.delete(id);
  }
}
