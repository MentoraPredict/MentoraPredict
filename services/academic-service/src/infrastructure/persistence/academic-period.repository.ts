import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicPeriodEntity, PeriodType } from '../../domain/entities/academic-period.entity';
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
    const o = await this.repo.findOne({ where: { isActive: true } });
    return o ? this.toDomain(o) : null;
  }

  private toDomain(o: AcademicPeriodOrmEntity): AcademicPeriodEntity {
    return new AcademicPeriodEntity(
      o.id, o.name, o.startDate, o.endDate, o.isActive, o.type as PeriodType,
    );
  }
}
