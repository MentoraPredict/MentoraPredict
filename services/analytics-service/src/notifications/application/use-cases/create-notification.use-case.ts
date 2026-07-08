import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  NotificationEntity,
  NotificationRecipientRole,
  NotificationType,
} from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/ports/i-notification.repository';
import { IUserServiceClient } from '../../domain/ports/i-user-service.client';
import { NotificationDeliveryService } from '../services/notification-delivery.service';

export interface CreateNotificationDto {
  // Either target one specific recipient...
  recipientId?: string;
  recipientRole?: NotificationRecipientRole;
  // ...or broadcast to every active user with this role (e.g. every ADMIN).
  broadcastToRole?: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
    @Inject('IUserServiceClient') private readonly userServiceClient: IUserServiceClient,
    private readonly deliveryService: NotificationDeliveryService,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<NotificationEntity[]> {
    const recipients = await this.resolveRecipients(dto);
    const now = new Date();
    const created: NotificationEntity[] = [];

    for (const recipient of recipients) {
      const notification = new NotificationEntity(
        randomUUID(),
        recipient.id,
        recipient.role,
        dto.type,
        dto.title,
        dto.message,
        'UNREAD',
        now,
        null,
      );
      await this.notificationRepo.save(notification);
      await this.deliveryService.deliver(notification);
      created.push(notification);
    }

    return created;
  }

  private async resolveRecipients(
    dto: CreateNotificationDto,
  ): Promise<Array<{ id: string; role: NotificationRecipientRole }>> {
    if (dto.broadcastToRole) {
      const ids = await this.userServiceClient.getUserIdsByRole(dto.broadcastToRole);
      return ids.map((id) => ({ id, role: dto.broadcastToRole as NotificationRecipientRole }));
    }

    if (dto.recipientId && dto.recipientRole) {
      return [{ id: dto.recipientId, role: dto.recipientRole }];
    }

    throw new BadRequestException(
      'Either recipientId+recipientRole or broadcastToRole is required',
    );
  }
}
