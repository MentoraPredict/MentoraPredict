import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PeriodScheme,
  SchoolRegime,
  SchoolYearEntity,
  SchoolYearStatus,
} from '../../domain/entities/school-year.entity';
import { AcademicPeriodEntity } from '../../domain/entities/academic-period.entity';
import { ISchoolYearRepository } from '../../application/ports/output/i-school-year.repository';
import { toIsoDate } from '../../domain/services/school-calendar';
import { SchoolYearOrmEntity } from './school-year.orm-entity';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';

@Injectable()
export class SchoolYearRepository implements ISchoolYearRepository {
  constructor(
    @InjectRepository(SchoolYearOrmEntity)
    private readonly repo: Repository<SchoolYearOrmEntity>,
  ) {}

  async findById(id: string): Promise<SchoolYearEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findAll(): Promise<SchoolYearEntity[]> {
    const list = await this.repo.find({ order: { startDate: 'DESC' } });
    return list.map((o) => this.toDomain(o));
  }

  async findActive(): Promise<SchoolYearEntity | null> {
    const o = await this.repo.findOne({ where: { status: 'ACTIVE' } });
    return o ? this.toDomain(o) : null;
  }

  async findByCode(code: string): Promise<SchoolYearEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async findByName(name: string): Promise<SchoolYearEntity | null> {
    const o = await this.repo.findOne({ where: { name } });
    return o ? this.toDomain(o) : null;
  }

  async saveWithPeriods(
    year: SchoolYearEntity,
    periods: AcademicPeriodEntity[],
  ): Promise<void> {
    await this.repo.manager.transaction(async (em) => {
      await em.getRepository(SchoolYearOrmEntity).save(this.toOrm(year));
      const periodRepo = em.getRepository(AcademicPeriodOrmEntity);
      for (const p of periods) {
        const o = new AcademicPeriodOrmEntity();
        o.id = p.id;
        o.name = p.name;
        o.code = p.code;
        o.description = p.description;
        // Columnas `date`: se envían como YYYY-MM-DD para evitar desfases de zona horaria.
        o.startDate = toIsoDate(p.startDate) as unknown as Date;
        o.endDate = toIsoDate(p.endDate) as unknown as Date;
        o.status = p.status;
        o.type = p.type;
        o.schoolYearId = p.schoolYearId;
        o.number = p.number;
        o.gradesDueDate = p.gradesDueDate;
        o.createdAt = p.createdAt;
        o.updatedAt = p.updatedAt;
        await periodRepo.save(o);
      }
    });
  }

  async update(year: SchoolYearEntity): Promise<SchoolYearEntity> {
    await this.repo.save(this.toOrm(year));
    return year;
  }

  async hasRecords(schoolYearId: string): Promise<boolean> {
    const count = await this.repo.manager
      .getRepository('subjects')
      .createQueryBuilder('s')
      .innerJoin(
        'academic_periods',
        'p',
        'p.id = s.academic_period_id',
      )
      .where('p.school_year_id = :schoolYearId', { schoolYearId })
      .getCount();
    return count > 0;
  }

  async deleteWithPeriods(id: string): Promise<void> {
    await this.repo.manager.transaction(async (em) => {
      await em
        .getRepository(AcademicPeriodOrmEntity)
        .delete({ schoolYearId: id });
      await em.getRepository(SchoolYearOrmEntity).delete(id);
    });
  }

  private toDomain(o: SchoolYearOrmEntity): SchoolYearEntity {
    return new SchoolYearEntity(
      o.id,
      o.name,
      o.code,
      o.regime as SchoolRegime,
      o.periodScheme as PeriodScheme,
      o.periodsCount,
      toIsoDate(o.startDate),
      toIsoDate(o.endDate),
      o.minClassDays,
      o.recoveryStartDate ? toIsoDate(o.recoveryStartDate) : null,
      o.recoveryEndDate ? toIsoDate(o.recoveryEndDate) : null,
      o.supplementaryStartDate ? toIsoDate(o.supplementaryStartDate) : null,
      o.supplementaryEndDate ? toIsoDate(o.supplementaryEndDate) : null,
      o.status as SchoolYearStatus,
      o.createdAt,
      o.updatedAt,
    );
  }

  private toOrm(d: SchoolYearEntity): SchoolYearOrmEntity {
    const o = new SchoolYearOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.code = d.code;
    o.regime = d.regime;
    o.periodScheme = d.periodScheme;
    o.periodsCount = d.periodsCount;
    o.startDate = d.startDate;
    o.endDate = d.endDate;
    o.minClassDays = d.minClassDays;
    o.recoveryStartDate = d.recoveryStartDate;
    o.recoveryEndDate = d.recoveryEndDate;
    o.supplementaryStartDate = d.supplementaryStartDate;
    o.supplementaryEndDate = d.supplementaryEndDate;
    o.status = d.status;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
