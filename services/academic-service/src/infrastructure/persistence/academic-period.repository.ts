import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AcademicPeriodEntity,
  PeriodStatus,
  PeriodType,
} from '../../domain/entities/academic-period.entity';
import { IAcademicPeriodRepository } from '../../application/ports/output/i-academic-period.repository';
import { AcademicPeriodOrmEntity } from './academic-period.orm-entity';

@Injectable()
export class AcademicPeriodRepository implements IAcademicPeriodRepository {
  constructor(
    @InjectRepository(AcademicPeriodOrmEntity)
    private readonly repo: Repository<AcademicPeriodOrmEntity>,
  ) {}

  async findById(id: string): Promise<AcademicPeriodEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findActive(): Promise<AcademicPeriodEntity | null> {
    const o = await this.repo.findOne({ where: { status: 'ACTIVE' } });
    return o ? this.toDomain(o) : null;
  }

  async findAll(): Promise<AcademicPeriodEntity[]> {
    const list = await this.repo.find();
    return list.map((o) => this.toDomain(o));
  }

  async findByCode(code: string): Promise<AcademicPeriodEntity | null> {
    const o = await this.repo.findOne({ where: { code } });
    return o ? this.toDomain(o) : null;
  }

  async findByName(name: string): Promise<AcademicPeriodEntity | null> {
    const o = await this.repo.findOne({ where: { name } });
    return o ? this.toDomain(o) : null;
  }

  async countActive(): Promise<number> {
    return this.repo.count({ where: { status: 'ACTIVE' } });
  }

  async save(period: AcademicPeriodEntity): Promise<AcademicPeriodEntity> {
    const saved = await this.repo.save(this.toOrm(period));
    return this.toDomain(saved);
  }

  async update(period: AcademicPeriodEntity): Promise<AcademicPeriodEntity> {
    await this.repo.save(this.toOrm(period));
    return period;
  }

  async hasRecords(periodId: string): Promise<boolean> {
    const count = await this.repo.manager
      .getRepository('subjects')
      .createQueryBuilder('s')
      .where('s.academic_period_id = :periodId', { periodId })
      .getCount();
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(o: AcademicPeriodOrmEntity): AcademicPeriodEntity {
    return new AcademicPeriodEntity(
      o.id,
      o.name,
      o.code,
      o.description,
      o.startDate,
      o.endDate,
      o.status as PeriodStatus,
      o.type as PeriodType,
      o.createdAt,
      o.updatedAt,
    );
  }

  private toOrm(d: AcademicPeriodEntity): AcademicPeriodOrmEntity {
    const o = new AcademicPeriodOrmEntity();
    o.id = d.id;
    o.name = d.name;
    o.code = d.code;
    o.description = d.description;
    o.startDate = d.startDate;
    o.endDate = d.endDate;
    o.status = d.status;
    o.type = d.type;
    o.createdAt = d.createdAt;
    o.updatedAt = d.updatedAt;
    return o;
  }
}
