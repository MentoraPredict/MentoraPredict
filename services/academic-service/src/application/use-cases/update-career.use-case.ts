import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CareerEntity } from '../../domain/entities/career.entity';
import { ICareerRepository } from '../ports/output/i-career.repository';

export interface UpdateCareerDto {
  name?: string;
  code?: string;
  description?: string;
  durationSemesters?: number;
}

@Injectable()
export class UpdateCareerUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly repo: ICareerRepository,
  ) {}

  async execute(id: string, dto: UpdateCareerDto): Promise<CareerEntity> {
    const career = await this.repo.findById(id);
    if (!career) {
      throw new NotFoundException(`Career with id '${id}' not found`);
    }

    if (dto.code && dto.code !== career.code) {
      const existing = await this.repo.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Career with code '${dto.code}' already exists`);
      }
      career.code = dto.code;
    }

    if (dto.name !== undefined) {
      career.name = dto.name;
    }
    if (dto.description !== undefined) {
      career.description = dto.description;
    }
    if (dto.durationSemesters !== undefined) {
      career.durationSemesters = dto.durationSemesters;
    }

    career.updatedAt = new Date();
    return this.repo.update(career);
  }
}
