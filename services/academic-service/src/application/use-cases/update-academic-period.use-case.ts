import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import {
  PeriodRange,
  toIsoDate,
  validatePeriodRanges,
} from '../../domain/services/school-calendar';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';

export interface UpdateAcademicPeriodDto {
  name?: string;
  code?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  gradesDueDate?: string | null;
}

@Injectable()
export class UpdateAcademicPeriodUseCase {
  constructor(
    @Inject('IAcademicPeriodRepository')
    private readonly repo: IAcademicPeriodRepository,
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
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
      await this.assertWithinSchoolYear(period, newStart, newEnd);
    }

    if (dto.gradesDueDate !== undefined) {
      const due = dto.gradesDueDate ? toIsoDate(dto.gradesDueDate) : null;
      if (due && due < toIsoDate(newStart)) {
        throw new BadRequestException(
          'La fecha límite de notas no puede ser anterior al inicio del periodo',
        );
      }
      period.gradesDueDate = due;
    }

    if (dto.code) {
      const normalizedCode = dto.code.trim().toUpperCase();
      if (normalizedCode !== period.code) {
        const existing = await this.repo.findByCode(normalizedCode);
        if (existing) {
          throw new ConflictException(`Academic period with code '${normalizedCode}' already exists`);
        }
        period.code = normalizedCode;
      }
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

  /** Un periodo ligado a un año lectivo debe caer dentro de él y no traslaparse con sus hermanos. */
  private async assertWithinSchoolYear(
    period: AcademicPeriodEntity,
    start: Date,
    end: Date,
  ): Promise<void> {
    if (!period.schoolYearId) return;

    const year = await this.yearRepo.findById(period.schoolYearId);
    if (!year) return;

    const siblings = await this.repo.findBySchoolYear(year.id);
    const ranges: PeriodRange[] = siblings.map((s) =>
      s.id === period.id
        ? { number: s.number ?? 0, startDate: toIsoDate(start), endDate: toIsoDate(end) }
        : { number: s.number ?? 0, startDate: toIsoDate(s.startDate), endDate: toIsoDate(s.endDate) },
    );

    const errors = validatePeriodRanges(year.startDate, year.endDate, ranges);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
