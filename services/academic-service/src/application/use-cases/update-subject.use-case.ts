import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

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
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, dto: UpdateSubjectDto): Promise<SubjectEntity> {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject with id '${id}' not found`);
    }

    const period = await this.periodRepo.findById(subject.academicPeriodId);
    if (!period || !period.isActive) {
      throw new ConflictException('No se puede modificar una materia de un periodo inactivo');
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
