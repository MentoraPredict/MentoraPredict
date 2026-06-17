import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

export interface UpdateFacultyDto {
  name?: string;
  code?: string;
  description?: string;
}

@Injectable()
export class UpdateFacultyUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(id: string, dto: UpdateFacultyDto): Promise<FacultyEntity> {
    const faculty = await this.repo.findById(id);
    if (!faculty) {
      throw new NotFoundException(`Faculty with id '${id}' not found`);
    }

    if (dto.code && dto.code !== faculty.code) {
      const existingByCode = await this.repo.findByCode(dto.code);
      if (existingByCode) {
        throw new ConflictException(`Faculty with code '${dto.code}' already exists`);
      }
      faculty.code = dto.code;
    }

    if (dto.name && dto.name !== faculty.name) {
      const existingByName = await this.repo.findByName(dto.name);
      if (existingByName) {
        throw new ConflictException(`Faculty with name '${dto.name}' already exists`);
      }
      faculty.name = dto.name;
    }

    if (dto.description !== undefined) {
      faculty.description = dto.description;
    }

    faculty.updatedAt = new Date();
    return this.repo.update(faculty);
  }
}
