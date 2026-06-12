import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeHistoryEntity } from '../../domain/entities/grade-history.entity';
import { IGradeHistoryRepository } from '../../application/ports/output/i-grade-history.repository';
import { GradeHistoryOrmEntity } from './grade-history.orm-entity';

@Injectable()
export class GradeHistoryRepository implements IGradeHistoryRepository {
  constructor(
    @InjectRepository(GradeHistoryOrmEntity)
    private readonly repo: Repository<GradeHistoryOrmEntity>,
  ) {}

  async save(entry: GradeHistoryEntity): Promise<GradeHistoryEntity> {
    const o = new GradeHistoryOrmEntity();
    o.id = entry.id;
    o.gradeId = entry.gradeId;
    o.previousValue = entry.previousValue;
    o.newValue = entry.newValue;
    o.changedBy = entry.changedBy;
    o.changedAt = entry.changedAt;
    await this.repo.save(o);
    return entry;
  }
}
