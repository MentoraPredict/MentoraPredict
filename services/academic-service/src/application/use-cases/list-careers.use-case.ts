import { Inject, Injectable } from '@nestjs/common';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../ports/output/i-career.repository';

@Injectable()
export class ListCareersUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly repo: ICareerRepository,
  ) {}

  async execute(facultyId?: string): Promise<CareerEntity[]> {
    if (facultyId) {
      return this.repo.findByFaculty(facultyId);
    }
    return this.repo.findAll();
  }
}
