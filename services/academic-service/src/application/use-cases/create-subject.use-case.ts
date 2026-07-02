import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectEntity } from '../../domain/entities/subject.entity';
import { SubjectTeacherEntity } from '../../domain/entities/subject-teacher.entity';
import { ISubjectRepository } from '../ports/output/i-subject.repository';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISubjectTeacherRepository } from '../ports/output/i-subject-teacher.repository';

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  credits: number;
  careerId: string;
  maxCapacity?: number;
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
    @Inject('ISubjectTeacherRepository')
    private readonly subjectTeacherRepo: ISubjectTeacherRepository,
  ) {}

  async execute(dto: CreateSubjectDto, teacherId: string): Promise<SubjectEntity> {
    const activePeriod = await this.periodRepo.findActive();
    if (!activePeriod) {
      throw new ConflictException(
        'No hay un periodo académico activo. Contacta al administrador.',
      );
    }

    const career = await this.careerRepo.findById(dto.careerId);
    if (!career) {
      throw new NotFoundException(`Career with id '${dto.careerId}' not found`);
    }

    const existingByNamePeriod = await this.subjectRepo.findByNameAndPeriod(
      dto.name,
      activePeriod.id,
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
      activePeriod.id,
      dto.maxCapacity ?? 30,
      teacherId,
      true,
      now,
      now,
    );

    const saved = await this.subjectRepo.save(subject);

    await this.subjectTeacherRepo.save(
      new SubjectTeacherEntity(saved.id, teacherId, activePeriod.id),
    );

    return saved;
  }
}
