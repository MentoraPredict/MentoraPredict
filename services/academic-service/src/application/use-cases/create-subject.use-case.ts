import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  credits: number;
  careerId: string;
  academicPeriodId: string;
  maxCapacity?: number;
  teacherId?: string;
}

@Injectable()
export class CreateSubjectUseCase {
  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepo: ISubjectRepository,
    @Inject('ICareerRepository')
    private readonly careerRepo: ICareerRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: CreateSubjectDto): Promise<SubjectEntity> {
    const career = await this.careerRepo.findById(dto.careerId);
    if (!career) {
      throw new NotFoundException(`Career with id '${dto.careerId}' not found`);
    }

    const period = await this.periodRepo.findById(dto.academicPeriodId);
    if (!period || period.status !== 'ACTIVE') {
      throw new BadRequestException('Academic period not found or not active');
    }

    const existingByNamePeriod = await this.subjectRepo.findByNameAndPeriod(
      dto.name,
      dto.academicPeriodId,
    );
    if (existingByNamePeriod) {
      throw new ConflictException(
        `Subject with name '${dto.name}' already exists in this academic period`,
      );
    }

    const existingByCode = await this.subjectRepo.findByCode(dto.code);
    if (existingByCode) {
      throw new ConflictException(`Subject with code '${dto.code}' already exists`);
    }

    const now = new Date();
    const subject = new SubjectEntity(
      randomUUID(),
      dto.name,
      dto.description ?? '',
      dto.code,
      dto.credits,
      dto.careerId,
      dto.academicPeriodId,
      dto.maxCapacity ?? 30,
      dto.teacherId ?? null,
      true,
      now,
      now,
    );

    return this.subjectRepo.save(subject);
  }
}
