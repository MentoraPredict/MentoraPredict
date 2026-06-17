import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

@Injectable()
export class GetSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
  ) {}

  async execute(id: string): Promise<SubjectEntity> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }
    return subject;
  }
}
