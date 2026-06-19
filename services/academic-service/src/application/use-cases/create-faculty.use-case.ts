import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FacultyEntity } from '../../domain/entities/faculty.entity';
import { IFacultyRepository } from '../ports/output/i-faculty.repository';

export interface CreateFacultyDto {
  name: string;
  code: string;
  description?: string;
}

@Injectable()
export class CreateFacultyUseCase {
  constructor(
    @Inject('IFacultyRepository')
    private readonly repo: IFacultyRepository,
  ) {}

  async execute(dto: CreateFacultyDto): Promise<FacultyEntity> {
    const existingByCode = await this.repo.findByCode(dto.code);
    if (existingByCode) {
      throw new ConflictException(`Faculty with code '${dto.code}' already exists`);
    }

    const existingByName = await this.repo.findByName(dto.name);
    if (existingByName) {
      throw new ConflictException(`Faculty with name '${dto.name}' already exists`);
    }

    const now = new Date();
    const faculty = new FacultyEntity(
      randomUUID(),
      dto.name,
      dto.code,
      dto.description ?? '',
      'ACTIVE',
      now,
      now,
    );

    return this.repo.save(faculty);
  }
}
