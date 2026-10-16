import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';
import { ICareerRepository } from '../ports/output/i-career.repository';
import { CreateSubjectCatalogDto } from '../dtos/create-subject-catalog.dto';

@Injectable()
export class CreateSubjectCatalogUseCase {
  constructor(
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
    @Inject('ICareerRepository')
    private readonly careerRepo: ICareerRepository,
  ) {}

  async execute(dto: CreateSubjectCatalogDto): Promise<SubjectCatalogEntity> {
    if (dto.careerId) {
      const career = await this.careerRepo.findById(dto.careerId);
      if (!career) {
        throw new NotFoundException(`Career with id '${dto.careerId}' not found`);
      }
    }

    const normalizedCode = dto.code.trim().toUpperCase();
    const existing = await this.catalogRepo.findByCode(normalizedCode);
    if (existing) {
      throw new ConflictException(`El código '${normalizedCode}' ya está en uso por la materia '${existing.name}'.`);
    }

    const now = new Date();
    return this.catalogRepo.save(
      new SubjectCatalogEntity(
        randomUUID(),
        dto.name,
        dto.description ?? '',
        normalizedCode,
        dto.credits ?? 0,
        dto.careerId ?? null,
        true,
        now,
        now,
        dto.area?.trim() || null,
      ),
    );
  }
}
