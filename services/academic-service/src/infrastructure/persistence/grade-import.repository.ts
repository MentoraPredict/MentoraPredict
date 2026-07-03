import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GradeImportEntity,
  GradeImportError,
  GradeImportStatus,
} from '../../domain/entities/grade-import.entity';
import { IGradeImportRepository } from '../../application/ports/output/i-grade-import.repository';
import { GradeImportOrmEntity } from './grade-import.orm-entity';

@Injectable()
export class GradeImportRepository implements IGradeImportRepository {
  constructor(
    @InjectRepository(GradeImportOrmEntity)
    private readonly repo: Repository<GradeImportOrmEntity>,
  ) {}

  async save(e: GradeImportEntity): Promise<GradeImportEntity> {
    await this.repo.save(this.toOrm(e));
    return e;
  }

  async findById(id: string): Promise<GradeImportEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findBySubjectIdPaginated(
    subjectId: string,
    pagination: { page: number; limit: number },
  ): Promise<{ items: GradeImportEntity[]; total: number }> {
    const [orms, total] = await this.repo.findAndCount({
      where: { subjectId },
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items: orms.map(this.toDomain), total };
  }

  private toDomain = (o: GradeImportOrmEntity): GradeImportEntity =>
    new GradeImportEntity(
      o.id,
      o.subjectId,
      o.importedBy,
      o.fileName,
      o.fileSize,
      o.totalRows,
      o.createdRows,
      o.updatedRows,
      o.unchangedRows,
      o.failedRows,
      o.status as GradeImportStatus,
      o.errors as GradeImportError[],
      o.createdAt,
    );

  private toOrm(d: GradeImportEntity): GradeImportOrmEntity {
    const o = new GradeImportOrmEntity();
    o.id = d.id;
    o.subjectId = d.subjectId;
    o.importedBy = d.importedBy;
    o.fileName = d.fileName;
    o.fileSize = d.fileSize;
    o.totalRows = d.totalRows;
    o.createdRows = d.createdRows;
    o.updatedRows = d.updatedRows;
    o.unchangedRows = d.unchangedRows;
    o.failedRows = d.failedRows;
    o.status = d.status;
    o.errors = d.errors as Record<string, unknown>[];
    return o;
  }
}
