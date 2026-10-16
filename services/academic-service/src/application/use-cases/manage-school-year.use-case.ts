import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UpdateSchoolYearDto,
} from '../dtos/create-school-year.dto';
import { SchoolYearStatus } from '../../domain/entities/school-year.entity';
import {
  PeriodRange,
  toIsoDate,
  validatePeriodRanges,
  validateSchoolYearDates,
} from '../../domain/services/school-calendar';
import {
  SchoolYearView,
  buildSchoolYearView,
} from '../dtos/school-year.view';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';

@Injectable()
export class UpdateSchoolYearUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, dto: UpdateSchoolYearDto): Promise<SchoolYearView> {
    const year = await this.yearRepo.findById(id);
    if (!year) throw new NotFoundException(`Año lectivo '${id}' no encontrado`);

    if (year.status === 'FINISHED') {
      throw new ConflictException('Un año lectivo finalizado no se puede modificar');
    }

    const pick = <T>(value: T | null | undefined, current: T): T =>
      value === undefined ? current : (value as T);

    const next = {
      startDate: dto.startDate?.slice(0, 10) ?? year.startDate,
      endDate: dto.endDate?.slice(0, 10) ?? year.endDate,
      recoveryStartDate: pick(dto.recoveryStartDate, year.recoveryStartDate),
      recoveryEndDate: pick(dto.recoveryEndDate, year.recoveryEndDate),
      supplementaryStartDate: pick(
        dto.supplementaryStartDate,
        year.supplementaryStartDate,
      ),
      supplementaryEndDate: pick(
        dto.supplementaryEndDate,
        year.supplementaryEndDate,
      ),
    };

    const errors = validateSchoolYearDates(next);
    const periods = await this.periodRepo.findBySchoolYear(id);
    const ranges: PeriodRange[] = periods.map((p) => ({
      number: p.number ?? 0,
      startDate: toIsoDate(p.startDate),
      endDate: toIsoDate(p.endDate),
    }));
    errors.push(...validatePeriodRanges(next.startDate, next.endDate, ranges));
    if (errors.length > 0) throw new BadRequestException(errors);

    if (dto.name && dto.name !== year.name) {
      if (await this.yearRepo.findByName(dto.name)) {
        throw new ConflictException(`Ya existe un año lectivo con nombre '${dto.name}'`);
      }
      year.name = dto.name;
    }
    if (dto.regime) year.regime = dto.regime;
    if (dto.minClassDays) year.minClassDays = dto.minClassDays;
    Object.assign(year, next);
    year.updatedAt = new Date();

    await this.yearRepo.update(year);
    return buildSchoolYearView(year, periods);
  }
}

@Injectable()
export class ChangeSchoolYearStatusUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string, status: SchoolYearStatus): Promise<SchoolYearView> {
    const year = await this.yearRepo.findById(id);
    if (!year) throw new NotFoundException(`Año lectivo '${id}' no encontrado`);

    if (status === 'ACTIVE') {
      const active = await this.yearRepo.findActive();
      if (active && active.id !== id) {
        throw new ConflictException(
          `Ya hay un año lectivo activo (${active.name}); finalícelo antes de activar otro`,
        );
      }
    }
    if (year.status === 'FINISHED' && status !== 'FINISHED') {
      throw new ConflictException('Un año lectivo finalizado no se puede reabrir');
    }

    year.status = status;
    year.updatedAt = new Date();
    await this.yearRepo.update(year);

    return buildSchoolYearView(year, await this.periodRepo.findBySchoolYear(id));
  }
}

@Injectable()
export class DeleteSchoolYearUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const year = await this.yearRepo.findById(id);
    if (!year) throw new NotFoundException(`Año lectivo '${id}' no encontrado`);
    if (year.status !== 'PLANNED') {
      throw new ConflictException('Solo se puede eliminar un año lectivo planificado');
    }
    if (await this.yearRepo.hasRecords(id)) {
      throw new ConflictException(
        'El año lectivo tiene cursos asociados y no se puede eliminar',
      );
    }
    await this.yearRepo.deleteWithPeriods(id);
  }
}
