import { Inject, Injectable } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

export interface ListSubjectsFilters {
  careerId?: string;
  periodId?: string;
}

@Injectable()
export class ListSubjectsUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
  ) {}

  async execute(filters: ListSubjectsFilters = {}): Promise<SubjectEntity[]> {
    return this.repo.findAll(filters);
  }
}
