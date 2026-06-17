import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

@Injectable()
export class GetFacultyUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(id: string): Promise<FacultyEntity> {
    const faculty = await this.repo.findById(id);
    if (!faculty) {
      throw new NotFoundException(`Faculty with id '${id}' not found`);
    }
    return faculty;
  }
}
