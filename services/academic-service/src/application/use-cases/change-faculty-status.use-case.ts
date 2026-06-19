import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

@Injectable()
export class ChangeFacultyStatusUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<FacultyEntity> {
    const faculty = await this.repo.findById(id);
    if (!faculty) {
      throw new NotFoundException(`Faculty with id '${id}' not found`);
    }

    if (status === 'ACTIVE') {
      faculty.activate();
    } else {
      faculty.deactivate();
    }

    return this.repo.update(faculty);
  }
}
