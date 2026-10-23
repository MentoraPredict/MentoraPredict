import { Inject, Injectable } from '@nestjs/common';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';

@Injectable()
export class ListSubjectCatalogUseCase {
  constructor(
    @Inject('ISubjectCatalogRepository')
    private readonly repo: ISubjectCatalogRepository,
  ) {}

  async execute(): Promise<SubjectCatalogEntity[]> {
    return this.repo.findAll();
  }
}
