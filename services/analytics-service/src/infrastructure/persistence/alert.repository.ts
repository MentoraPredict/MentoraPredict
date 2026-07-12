import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AlertEntity, AlertSeverity, AlertStatus, AlertType } from '../../domain/entities/alert.entity';
import { IAlertRepository } from '../../domain/ports/i-alert.repository';
import { AlertOrmEntity } from './alert.orm-entity';

@Injectable()
export class AlertRepository implements IAlertRepository {
  constructor(
    @InjectRepository(AlertOrmEntity)
    private readonly repo: Repository<AlertOrmEntity>,
  ) {}

  async save(alert: AlertEntity): Promise<AlertEntity> {
    const saved = await this.repo.save(this.toOrm(alert));
    return this.toDomain(saved);
  }

  async update(alert: AlertEntity): Promise<AlertEntity> {
    await this.repo.save(this.toOrm(alert));
    return alert;
  }

  async findById(id: string): Promise<AlertEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentId(studentId: string, unreadOnly?: boolean): Promise<AlertEntity[]> {
    const where: { studentId: string; status?: string } = { studentId };
    if (unreadOnly) where.status = 'UNREAD';
    const list = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return list.map((o) => this.toDomain(o));
  }

  async findActiveByStudentAndSubject(studentId: string, subjectId: string): Promise<AlertEntity | null> {
    const o = await this.repo.findOne({ where: { studentId, subjectId, status: 'ACTIVE' } });
    return o ? this.toDomain(o) : null;
  }

  async findByStudentPaginated(
    studentId: string,
    filters: { status?: string; subjectId?: string; periodId?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: AlertEntity[]; total: number }> {
    const where: Record<string, unknown> = {
      studentId,
      status: filters.status ?? In(['ACTIVE', 'UNREAD']),
    };
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.periodId) where.periodId = filters.periodId;

    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { triggeredAt: 'DESC', createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items: orms.map((o) => this.toDomain(o)), total };
  }

  async findBySubjectPaginated(
    subjectId: string,
    filters: { status?: string; severity?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: AlertEntity[]; total: number }> {
    const where: Record<string, unknown> = {
      subjectId,
      status: filters.status ?? In(['ACTIVE', 'UNREAD']),
    };
    if (filters.severity) where.severity = filters.severity;

    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { triggeredAt: 'DESC', createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items: orms.map((o) => this.toDomain(o)), total };
  }

  private toDomain(o: AlertOrmEntity): AlertEntity {
    return new AlertEntity(
      o.id,
      o.studentId,
      o.type as AlertType,
      o.message,
      o.status as AlertStatus,
      o.createdAt,
      o.metadata,
      o.subjectId,
      o.periodId,
      o.severity as AlertSeverity | null,
      o.triggeredAt,
      o.resolvedAt,
      o.resolvedBy,
    );
  }

  private toOrm(d: AlertEntity): AlertOrmEntity {
    const o = new AlertOrmEntity();
    o.id = d.id; o.studentId = d.studentId; o.type = d.type;
    o.message = d.message; o.status = d.status;
    o.createdAt = d.createdAt; o.metadata = d.metadata;
    o.subjectId = d.subjectId; o.periodId = d.periodId;
    o.severity = d.severity; o.triggeredAt = d.triggeredAt;
    o.resolvedAt = d.resolvedAt; o.resolvedBy = d.resolvedBy;
    return o;
  }
}
