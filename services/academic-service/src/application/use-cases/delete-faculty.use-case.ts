import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

@Injectable()
export class DeleteFacultyUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const faculty = await this.repo.findById(id);
    if (!faculty) {
      throw new NotFoundException(`Faculty with id '${id}' not found`);
    }

    const hasCareer = await this.repo.hasCareer(id);
    if (hasCareer) {
      throw new BadRequestException('Cannot delete faculty with associated careers');
    }

    await this.repo.delete(id);
  }
}
