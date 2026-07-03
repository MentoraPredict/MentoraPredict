import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationEntity,
  NotificationRecipientRole,
  NotificationStatus,
  NotificationType,
} from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';
import { NotificationOrmEntity } from './notification.orm-entity';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repo: Repository<NotificationOrmEntity>,
  ) {}

  async save(notification: NotificationEntity): Promise<NotificationEntity> {
    const saved = await this.repo.save(this.toOrm(notification));
    return this.toDomain(saved);
  }

  async update(notification: NotificationEntity): Promise<NotificationEntity> {
    await this.repo.save(this.toOrm(notification));
    return notification;
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const o = await this.repo.findOne({ where: { id } });
    return o ? this.toDomain(o) : null;
  }

  async findByRecipientPaginated(
    recipientId: string,
    filters: { status?: string; type?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ items: NotificationEntity[]; total: number }> {
    const where: Record<string, unknown> = { recipientId, status: filters.status ?? 'UNREAD' };
    if (filters.type) where.type = filters.type;

    const [orms, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { items: orms.map((o) => this.toDomain(o)), total };
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NotificationOrmEntity)
      .set({ status: 'READ', readAt: new Date() })
      .where('recipient_id = :recipientId AND status = :status', { recipientId, status: 'UNREAD' })
      .execute();
    return result.affected ?? 0;
  }

  private toDomain(o: NotificationOrmEntity): NotificationEntity {
    return new NotificationEntity(
      o.id,
      o.recipientId,
      o.recipientRole as NotificationRecipientRole,
      o.type as NotificationType,
      o.relatedAlertId,
      o.subjectId,
      o.studentId,
      o.periodId,
      o.title,
      o.message,
      o.status as NotificationStatus,
      o.createdAt,
      o.readAt,
    );
  }

  private toOrm(d: NotificationEntity): NotificationOrmEntity {
    const o = new NotificationOrmEntity();
    o.id = d.id;
    o.recipientId = d.recipientId;
    o.recipientRole = d.recipientRole;
    o.type = d.type;
    o.relatedAlertId = d.relatedAlertId;
    o.subjectId = d.subjectId;
    o.studentId = d.studentId;
    o.periodId = d.periodId;
    o.title = d.title;
    o.message = d.message;
    o.status = d.status;
    o.createdAt = d.createdAt;
    o.readAt = d.readAt;
    return o;
  }
}
