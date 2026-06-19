import { Inject, Injectable } from '@nestjs/common';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

@Injectable()
export class ListFacultiesUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(): Promise<FacultyEntity[]> {
    return this.repo.findAll();
  }
}
