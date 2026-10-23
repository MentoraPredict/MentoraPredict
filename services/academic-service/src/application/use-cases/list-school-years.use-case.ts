import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SchoolYearView,
  buildSchoolYearView,
} from '../dtos/school-year.view';
import { IAcademicPeriodRepository } from '../ports/output/i-academic-period.repository';
import { ISchoolYearRepository } from '../ports/output/i-school-year.repository';

@Injectable()
export class ListSchoolYearsUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(): Promise<SchoolYearView[]> {
    const years = await this.yearRepo.findAll();
    return Promise.all(
      years.map(async (y) =>
        buildSchoolYearView(y, await this.periodRepo.findBySchoolYear(y.id)),
      ),
    );
  }
}

@Injectable()
export class GetSchoolYearUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(id: string): Promise<SchoolYearView> {
    const year = await this.yearRepo.findById(id);
    if (!year) throw new NotFoundException(`Año lectivo '${id}' no encontrado`);
    return buildSchoolYearView(year, await this.periodRepo.findBySchoolYear(id));
  }
}

@Injectable()
export class GetCurrentSchoolYearUseCase {
  constructor(
    @Inject('ISchoolYearRepository')
    private readonly yearRepo: ISchoolYearRepository,
    @Inject('IAcademicPeriodRepository')
    private readonly periodRepo: IAcademicPeriodRepository,
  ) {}

  async execute(): Promise<SchoolYearView> {
    const year = await this.yearRepo.findActive();
    if (!year) throw new NotFoundException('No hay un año lectivo activo');
    return buildSchoolYearView(
      year,
      await this.periodRepo.findBySchoolYear(year.id),
    );
  }
}
