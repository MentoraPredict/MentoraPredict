import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  credits?: number;
  maxCapacity?: number;
  teacherId?: string | null;
}

@Injectable()
export class UpdateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly repo: ISubjectRepository,
  ) {}

  async execute(id: string, dto: UpdateSubjectDto): Promise<SubjectEntity> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }

    if (dto.name !== undefined) subject.name = dto.name;
    if (dto.description !== undefined) subject.description = dto.description;
    if (dto.credits !== undefined) subject.credits = dto.credits;
    if (dto.maxCapacity !== undefined) subject.maxCapacity = dto.maxCapacity;
    if (dto.teacherId !== undefined) subject.teacherId = dto.teacherId;

    subject.updatedAt = new Date();
    return this.repo.update(subject);
  }
}
