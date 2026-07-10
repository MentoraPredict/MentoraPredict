import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

export interface CreateCareerDto {
  name: string;
  code: string;
  description?: string;
  facultyId: string;
  durationSemesters: number;
}

@Injectable()
export class CreateCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly careerRepo: ICareerRepository,
    @Inject('IFacultyRepository')
    private readonly facultyRepo: IFacultyRepository,
  ) {}

  async execute(dto: CreateCareerDto): Promise<CareerEntity> {
    const faculty = await this.facultyRepo.findById(dto.facultyId);
    if (!faculty) {
      throw new NotFoundException(`Faculty with id '${dto.facultyId}' not found`);
    }

    const normalizedCode = dto.code.trim().toUpperCase();
    const existingByCode = await this.careerRepo.findByCode(normalizedCode);
    if (existingByCode) {
      throw new ConflictException(`Career with code '${normalizedCode}' already exists`);
    }

    const now = new Date();
    const career = new CareerEntity(
      randomUUID(),
      dto.name,
      normalizedCode,
      dto.description ?? '',
      'ACTIVE',
      dto.facultyId,
      dto.durationSemesters,
      now,
      now,
    );

    return this.careerRepo.save(career);
  }
}
