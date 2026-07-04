import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async execute(notificationId: string, recipientId: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.findById(notificationId);
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    if (notification.recipientId !== recipientId) {
      throw new ForbiddenException('No puedes modificar esta notificación');
    }

    notification.markRead(); // no-op if already READ — idempotent
    return this.notificationRepo.update(notification);
  }
}
