import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertEntity, AlertStatus, AlertType } from '../../domain/entities/alert.entity';
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

  async findByStudentId(studentId: string, unreadOnly?: boolean): Promise<AlertEntity[]> {
    const where: { studentId: string; status?: string } = { studentId };
    if (unreadOnly) where.status = 'UNREAD';
    const list = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return list.map((o) => this.toDomain(o));
  }

  private toDomain(o: AlertOrmEntity): AlertEntity {
    return new AlertEntity(
      o.id, o.studentId, o.type as AlertType, o.message,
      o.status as AlertStatus, o.createdAt, o.metadata,
    );
  }

  private toOrm(d: AlertEntity): AlertOrmEntity {
    const o = new AlertOrmEntity();
    o.id = d.id; o.studentId = d.studentId; o.type = d.type;
    o.message = d.message; o.status = d.status;
    o.createdAt = d.createdAt; o.metadata = d.metadata;
    return o;
  }
}
