import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(
    recipientId: string,
    filters: { status?: string; type?: string },
    pagination: { page: number; limit: number },
  ): Promise<{ data: NotificationEntity[]; total: number; page: number; limit: number }> {
    const { items, total } = await this.notificationRepo.findByRecipientPaginated(
      recipientId,
      filters,
      pagination,
    );
    return { data: items, total, page: pagination.page, limit: pagination.limit };
  }
}
