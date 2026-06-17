import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';

export interface UpdateAcademicPeriodDto {
  name?: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class UpdateAcademicPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, dto: UpdateAcademicPeriodDto): Promise<AcademicPeriodEntity> {
    const period = await this.repo.findById(id);
    if (!period) {
      throw new NotFoundException(`Academic period with id '${id}' not found`);
    }

    const newStart = dto.startDate ? new Date(dto.startDate) : period.startDate;
    const newEnd = dto.endDate ? new Date(dto.endDate) : period.endDate;

    if (dto.startDate || dto.endDate) {
      if (newStart >= newEnd) {
        throw new BadRequestException('startDate must be before endDate');
      }
    }

    if (dto.code && dto.code !== period.code) {
      const existing = await this.repo.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Academic period with code '${dto.code}' already exists`);
      }
      period.code = dto.code;
    }

    if (dto.name && dto.name !== period.name) {
      const existing = await this.repo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Academic period with name '${dto.name}' already exists`);
      }
      period.name = dto.name;
    }

    if (dto.description !== undefined) {
      period.description = dto.description;
    }

    period.startDate = newStart;
    period.endDate = newEnd;
    period.updatedAt = new Date();

    return this.repo.update(period);
  }
}
