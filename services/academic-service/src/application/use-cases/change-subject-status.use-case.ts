import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

@Injectable()
export class ChangeSubjectStatusUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
  ) {}

  async execute(id: string, isActive: boolean): Promise<SubjectEntity> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }

    if (isActive) {
      subject.isActive = true;
      subject.updatedAt = new Date();
    } else {
      subject.deactivate();
    }

    return this.repo.update(subject);
  }
}
