import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AcademicPeriodEntity,
  PeriodType,
} from '../../domain/entities/academic-period.entity';
import {
  PeriodScheme,
  SchoolYearEntity,
} from '../../domain/entities/school-year.entity';
import {
  DEFAULT_MIN_CLASS_DAYS,
  DEFAULT_PERIODS_BY_SCHEME,
  PeriodRange,
  generatePeriodRanges,
  validatePeriodRanges,
  validateSchoolYearDates,
} from '../../domain/services/school-calendar';
import { CreateSchoolYearDto } from '../dtos/create-school-year.dto';
import {
  SchoolYearView,
  buildSchoolYearView,
} from '../dtos/school-year.view';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';

const SCHEME_LABEL: Record<PeriodScheme, { name: string; code: string }> = {
  TRIMESTER: { name: 'Trimestre', code: 'T' },
  QUIMESTER: { name: 'Quimestre', code: 'Q' },
  SEMESTER: { name: 'Semestre', code: 'S' },
};

@Injectable()
export class CreateSchoolYearUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(dto: CreateSchoolYearDto): Promise<SchoolYearView> {
    const dateErrors = validateSchoolYearDates(dto);
    if (dateErrors.length > 0) {
      throw new BadRequestException(dateErrors);
    }

    const code = dto.code.trim().toUpperCase();
    if (await this.yearRepo.findByCode(code)) {
      throw new ConflictException(`Ya existe un año lectivo con código '${code}'`);
    }
    if (await this.yearRepo.findByName(dto.name)) {
      throw new ConflictException(`Ya existe un año lectivo con nombre '${dto.name}'`);
    }

    const count =
      dto.periods?.length ??
      dto.periodsCount ??
      DEFAULT_PERIODS_BY_SCHEME[dto.periodScheme];

    if (dto.periods && dto.periodsCount && dto.periods.length !== dto.periodsCount) {
      throw new BadRequestException(
        'La cantidad de periodos enviados no coincide con periodsCount',
      );
    }

    const ranges: PeriodRange[] = dto.periods
      ? dto.periods.map((p, i) => ({
          number: i + 1,
          startDate: p.startDate.slice(0, 10),
          endDate: p.endDate.slice(0, 10),
        }))
      : generatePeriodRanges(dto.startDate, dto.endDate, count);

    const rangeErrors = validatePeriodRanges(dto.startDate, dto.endDate, ranges);
    if (rangeErrors.length > 0) {
      throw new BadRequestException(rangeErrors);
    }

    const now = new Date();
    const year = new SchoolYearEntity(
      randomUUID(),
      dto.name,
      code,
      dto.regime,
      dto.periodScheme,
      count,
      dto.startDate.slice(0, 10),
      dto.endDate.slice(0, 10),
      dto.minClassDays ?? DEFAULT_MIN_CLASS_DAYS,
      dto.recoveryStartDate?.slice(0, 10) ?? null,
      dto.recoveryEndDate?.slice(0, 10) ?? null,
      dto.supplementaryStartDate?.slice(0, 10) ?? null,
      dto.supplementaryEndDate?.slice(0, 10) ?? null,
      'PLANNED',
      now,
      now,
    );

    const label = SCHEME_LABEL[dto.periodScheme];
    const periods = ranges.map((r, i) => {
      const code2 = `${code}-${label.code}${r.number}`;
      return new AcademicPeriodEntity(
        randomUUID(),
        `${dto.name} - ${label.name} ${r.number}`,
        code2,
        '',
        new Date(`${r.startDate}T00:00:00.000Z`),
        new Date(`${r.endDate}T00:00:00.000Z`),
        'PLANNED',
        dto.periodScheme as PeriodType,
        now,
        now,
        year.id,
        r.number,
        dto.periods?.[i]?.gradesDueDate?.slice(0, 10) ?? null,
      );
    });

    for (const p of periods) {
      if (await this.periodRepo.findByCode(p.code)) {
        throw new ConflictException(`Ya existe un periodo con código '${p.code}'`);
      }
      if (await this.periodRepo.findByName(p.name)) {
        throw new ConflictException(`Ya existe un periodo con nombre '${p.name}'`);
      }
    }

    await this.yearRepo.saveWithPeriods(year, periods);
    return buildSchoolYearView(year, periods);
  }
}
