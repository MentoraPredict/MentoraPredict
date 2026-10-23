import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SubjectCatalogEntity } from '../../domain/entities/subject-catalog.entity';
import { ISubjectCatalogRepository } from '../ports/output/i-subject-catalog.repository';
import { CreateSubjectCatalogDto } from '../dtos/create-subject-catalog.dto';

@Injectable()
export class CreateSubjectCatalogUseCase {
  constructor(
    @Inject('ISubjectCatalogRepository')
    private readonly catalogRepo: ISubjectCatalogRepository,
  ) {}

  async execute(dto: CreateSubjectCatalogDto): Promise<SubjectCatalogEntity> {
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
        true,
        now,
        now,
        dto.area?.trim() || null,
      ),
    );
  }
}
