import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(recipientId: string): Promise<{ updated: number }> {
    const updated = await this.notificationRepo.markAllAsRead(recipientId);
    return { updated };
  }
}
